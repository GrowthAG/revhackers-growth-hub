/**
 * OFX 1.x / 2.x Parser.
 *
 * Suporta o formato SGML (OFX 1.x) e XML (OFX 2.x) com o mesmo AST.
 * Extrai registros STMTTRN (bank transactions) e normaliza para
 * ConnectorNormalizedTxn (camada única de bridge para PostgreSQL).
 *
 * Date formats OFX:
 *   YYYYMMDD
 *   YYYYMMDDHHMMSS
 *   YYYYMMDDHHMMSS.XXX
 *   YYYYMMDDHHMMSS.XXX[+/-TZ:TZ]
 *
 * Bancos BR (Itaú, Bradesco, BB, Caixa, Santander) emitem OFX 1.x
 * com tags sem fechamento — por isso o parser trata as duas gramáticas.
 */

import { ApiError } from '../../../contracts/errors';
import type { ConnectorNormalizedTxn } from '../connectors/types';

export interface OfxParseResult {
  bank_org?: string;
  account_id?: string;
  account_type?: string;
  currency?: string;
  txns: ConnectorNormalizedTxn[];
}

interface OfxTransaction {
  trntype: string;
  dtposted: string;
  trnamt: number;
  fitid: string;
  name?: string;
  memo?: string;
  checknum?: string;
}

export class OfxParser {
  /**
   * Detecta a versão e dispatcha para o parser específico.
   * A heurística é simples: OFX 2.x começa com "<?xml" ou tem tag
   * <OFX> no topo; OFX 1.x usa o cabeçalho "OFXHEADER:100".
   */
  parse(raw: string): OfxParseResult {
    const trimmed = raw.trim();
    if (trimmed.startsWith('<?xml') || /^<OFX[\s>]/i.test(trimmed)) {
      return this.parseXml(trimmed);
    }
    if (/^OFXHEADER[:=]/i.test(trimmed) || /^<OFX[\s>]/i.test(trimmed)) {
      return this.parseSgml(trimmed);
    }
    // Fallback: tentar SGML (mais comum em bancos BR).
    return this.parseSgml(trimmed);
  }

  // ---------------------- OFX 1.x (SGML) ----------------------

  private parseSgml(raw: string): OfxParseResult {
    const body = raw.replace(/<\\?xml[^>]*>/gi, '').replace(/<\\?OFX[^>]*>/gi, '');
    // Extrai blocos STMTTRN -- cada um começa com <STMTTRN> e termina no próximo STMTTRN ou com </BANKTRANLIST>.
    const stmtrnRegex = /<STMTTRN>([\s\S]*?)(?=<STMTTRN>|<\/BANKTRANLIST>)/gi;
    const txns: OfxTransaction[] = [];
    let match: RegExpExecArray | null;
    while ((match = stmtrnRegex.exec(body)) !== null) {
      if (match[1]) {
        const tx = this.parseStmtrnBlock(match[1]);
        if (tx) txns.push(tx);
      }
    }

    const header = this.extractHeaderValues(body);
    const result: OfxParseResult = {
      txns: txns.map((t) => this.normalize(t)),
    };
    if (header.ORG) result.bank_org = header.ORG;
    if (header.ACCTID) result.account_id = header.ACCTID;
    if (header.ACCTTYPE) result.account_type = header.ACCTTYPE;
    if (header.CURDEF) result.currency = header.CURDEF;

    return result;
  }

  private parseStmtrnBlock(block: string): OfxTransaction | null {
    const trntype = this.extractTag(block, 'TRNTYPE');
    const dtposted = this.extractTag(block, 'DTPOSTED');
    const trnamt = this.extractTag(block, 'TRNAMT');
    const fitid = this.extractTag(block, 'FITID');
    if (!trntype || !dtposted || !trnamt || !fitid) return null;

    const name = this.extractTag(block, 'NAME');
    const memo = this.extractTag(block, 'MEMO');
    const checknum = this.extractTag(block, 'CHECKNUM');

    const tx: OfxTransaction = {
      trntype,
      dtposted,
      trnamt: parseFloat(trnamt.replace(',', '.')),
      fitid,
    };
    if (name) tx.name = name;
    if (memo) tx.memo = memo;
    if (checknum) tx.checknum = checknum;

    return tx;
  }

  private extractTag(block: string, tag: string): string | undefined {
    // OFX 1.x: "<TAG>value" até quebra de linha ou próxima tag.
    const regex = new RegExp(`<${tag}>([^<\\r\\n]+)`, 'i');
    const match = regex.exec(block);
    return match && match[1] ? match[1].trim() : undefined;
  }

  private extractHeaderValues(body: string): { ORG?: string; ACCTID?: string; ACCTTYPE?: string; CURDEF?: string } {
    const org = this.extractTag(body, 'ORG');
    const acctid = this.extractTag(body, 'ACCTID');
    const accttype = this.extractTag(body, 'ACCTTYPE');
    const curdef = this.extractTag(body, 'CURDEF');

    const res: { ORG?: string; ACCTID?: string; ACCTTYPE?: string; CURDEF?: string } = {};
    if (org) res.ORG = org;
    if (acctid) res.ACCTID = acctid;
    if (accttype) res.ACCTTYPE = accttype;
    if (curdef) res.CURDEF = curdef;

    return res;
  }

  // ---------------------- OFX 2.x (XML) ----------------------

  private parseXml(raw: string): OfxParseResult {
    const stmtrnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
    const txns: OfxTransaction[] = [];
    let match: RegExpExecArray | null;
    while ((match = stmtrnRegex.exec(raw)) !== null) {
      if (match[1]) {
        const tx = this.parseXmlStmtrnBlock(match[1]);
        if (tx) txns.push(tx);
      }
    }

    const org = extractXmlField(raw, 'ORG');
    const acctid = extractXmlField(raw, 'ACCTID');
    const accttype = extractXmlField(raw, 'ACCTTYPE');
    const curdef = extractXmlField(raw, 'CURDEF');

    const result: OfxParseResult = {
      txns: txns.map((t) => this.normalize(t)),
    };
    if (org) result.bank_org = org;
    if (acctid) result.account_id = acctid;
    if (accttype) result.account_type = accttype;
    if (curdef) result.currency = curdef;

    return result;
  }

  private parseXmlStmtrnBlock(block: string): OfxTransaction | null {
    const trntype = extractXmlField(block, 'TRNTYPE');
    const dtposted = extractXmlField(block, 'DTPOSTED');
    const trnamt = extractXmlField(block, 'TRNAMT');
    const fitid = extractXmlField(block, 'FITID');
    if (!trntype || !dtposted || !trnamt || !fitid) return null;

    const name = extractXmlField(block, 'NAME');
    const memo = extractXmlField(block, 'MEMO');
    const checknum = extractXmlField(block, 'CHECKNUM');

    const tx: OfxTransaction = {
      trntype,
      dtposted,
      trnamt: parseFloat(trnamt.replace(',', '.')),
      fitid,
    };
    if (name) tx.name = name;
    if (memo) tx.memo = memo;
    if (checknum) tx.checknum = checknum;

    return tx;
  }

  // ---------------------- Normalização ----------------------

  private normalize(tx: OfxTransaction): ConnectorNormalizedTxn {
    const isCredit = tx.trnamt > 0 || tx.trntype.toUpperCase() === 'CREDIT';
    return {
      transaction_date: parseOfxDate(tx.dtposted),
      amount: Math.abs(tx.trnamt),
      type: isCredit ? 'CREDIT' : 'DEBIT',
      description: (tx.memo ?? tx.name ?? `OFX ${tx.trntype}`).trim(),
      bank_transaction_id: tx.fitid,
      payer_document: null,
      payer_name: tx.name ?? null,
      source: 'ofx',
      reconciliation_status: 'PENDING',
      raw_payload: {
        trntype: tx.trntype,
        checknum: tx.checknum ?? null,
      },
    };
  }
}

/**
 * Converte data OFX (YYYYMMDD[HHMMSS[.XXX][TZ]]) em "YYYY-MM-DD".
 * Extrai só os primeiros 8 dígitos; ignora hora/timezone.
 */
function parseOfxDate(raw: string): string {
  const m = raw.match(/^(\d{4})(\d{2})(\d{2})/);
  if (!m) {
    throw ApiError.validation(`Data OFX inválida: ${raw}`);
  }
  return `${m[1]}-${m[2]}-${m[3]}`;
}

function extractXmlField(block: string, tag: string): string | undefined {
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = regex.exec(block);
  return match && match[1] ? match[1].trim() : undefined;
}
