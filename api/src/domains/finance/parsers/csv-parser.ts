/**
 * CSV Statement Parser.
 *
 * Suporta delimitadores vírgula (,), ponto e vírgula (;) e tab (\t).
 * Suporta formatos numéricos br/latino ("1.234,56") e en/US ("1,234.56").
 * Suporta heurística automática de mapeamento de colunas por apelidos.
 */

import { ApiError } from '../../../contracts/errors';
import type { ConnectorNormalizedTxn } from '../connectors/types';

export type CsvDelimiter = ',' | ';' | '\t' | 'AUTO';
export type CsvDecimalSeparator = '.' | ',' | 'AUTO';

export interface ColumnMapping {
  date: string;
  amount: string;
  description?: string;
  document?: string;
  name?: string;
  fitid?: string;
  type?: string;
}

export interface CsvParseOptions {
  delimiter?: CsvDelimiter;
  decimalSeparator?: CsvDecimalSeparator;
  mapping?: Partial<ColumnMapping>;
  dateFormat?: 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'AUTO';
  skipRows?: number;
}

export interface CsvParseResult {
  txns: ConnectorNormalizedTxn[];
  totalRows: number;
  skippedRows: number;
  resolvedDelimiter: ',' | ';' | '\t';
  resolvedHeaders: string[];
  effectiveMapping: ColumnMapping;
}

const ALIASES: Record<keyof ColumnMapping, string[]> = {
  date: ['data', 'date', 'dt_transacao', 'data_transacao', 'data_movimento', 'posted_at', 'data_lancamento'],
  amount: ['valor', 'amount', 'val', 'valor_bruto', 'valor_liquido', 'monto'],
  description: ['descricao', 'description', 'historico', 'memo', 'detalhe', 'desc'],
  document: ['cpf', 'cnpj', 'documento', 'cpf_cnpj', 'cnpj_cpf', 'cpf_cnpj_pagador'],
  name: ['nome', 'name', 'pagador', 'recebedor', 'cliente', 'razao_social', 'nome_pagador'],
  fitid: ['id', 'txid', 'transaction_id', 'fitid', 'nsu', 'autenticacao', 'codigo'],
  type: ['tipo', 'type', 'natureza', 'debito_credito', 'd_c'],
};

const DEFAULT_MAPPING: ColumnMapping = {
  date: 'data',
  amount: 'valor',
  description: 'descricao',
};

export class CsvParser {
  parse(raw: string, options: CsvParseOptions = {}): CsvParseResult {
    const trimmed = raw.trim();
    if (!trimmed) {
      throw ApiError.validation('Conteúdo CSV vazio.');
    }

    const lines = trimmed.split(/\r?\n/);
    const separator = this.resolveDelimiter(lines, options.delimiter);
    const skip = options.skipRows ?? 0;
    const startIndex = lines.findIndex((line, idx) => idx >= skip && line.trim().length > 0);
    if (startIndex < 0) {
      throw ApiError.validation('CSV sem conteúdo após skipRows.');
    }

    const headerLine = lines[startIndex] ?? '';
    const headers = this.parseLine(headerLine, separator).map((h) => h.trim().toLowerCase());
    const mapping = this.resolveMapping(options.mapping, headers);
    this.validateMapping(mapping, headers);

    const decimal: '.' | ',' = options.decimalSeparator && options.decimalSeparator !== 'AUTO'
      ? options.decimalSeparator
      : this.resolveDecimalSeparator(lines, separator);
    const txns: ConnectorNormalizedTxn[] = [];
    let skipped = 0;
    let totalRows = 0;

    for (let i = startIndex + 1; i < lines.length; i += 1) {
      const line = lines[i];
      if (!line || !line.trim()) continue;
      totalRows += 1;
      try {
        const fields = this.parseLine(line, separator);
        const row: Record<string, string> = {};
        for (let h = 0; h < headers.length; h += 1) {
          const hKey = headers[h];
          if (hKey) row[hKey] = (fields[h] ?? '').trim();
        }
        const txn = this.buildTxn(row, mapping, decimal, options.dateFormat ?? 'AUTO');
        txns.push(txn);
      } catch {
        skipped += 1;
      }
    }

    return {
      txns,
      totalRows,
      skippedRows: skipped,
      resolvedDelimiter: separator,
      resolvedHeaders: headers,
      effectiveMapping: mapping,
    };
  }

  private resolveDelimiter(lines: string[], requested?: CsvDelimiter): ',' | ';' | '\t' {
    if (requested && requested !== 'AUTO') return requested;
    const sample = lines.slice(0, 5).join('\n');
    const commaCount = (sample.match(/,/g) || []).length;
    const semiCount = (sample.match(/;/g) || []).length;
    const tabCount = (sample.match(/\t/g) || []).length;
    if (tabCount > commaCount && tabCount > semiCount) return '\t';
    if (semiCount > commaCount) return ';';
    return ',';
  }

  private resolveDecimalSeparator(lines: string[], delimiter: ',' | ';' | '\t'): '.' | ',' {
    // Se o delimitador é vírgula, o separador decimal provavelmente é ponto (US).
    if (delimiter === ',') return '.';

    // Amostra valores numéricos para detectar se usam vírgula como decimal.
    const sample = lines.slice(1, 10).join(' ');
    if (/\d+,\d{2}\b/.test(sample)) return ',';
    return '.';
  }

  private resolveMapping(explicit: Partial<ColumnMapping> | undefined, headers: string[]): ColumnMapping {
    const headerSet = new Set(headers);
    const build = (key: keyof ColumnMapping): string | undefined => {
      if (headerSet.has(key)) return key;
      for (const alias of ALIASES[key]) {
        if (headerSet.has(alias)) return alias;
      }
      return undefined;
    };

    const fromExplicit = explicit ?? DEFAULT_MAPPING;
    const resolvedDate = fromExplicit.date ?? DEFAULT_MAPPING.date;
    const resolvedAmount = fromExplicit.amount ?? DEFAULT_MAPPING.amount;
    const resolvedDesc = fromExplicit.description ?? DEFAULT_MAPPING.description;
    const resolvedDoc = fromExplicit.document ?? DEFAULT_MAPPING.document;
    const resolvedName = fromExplicit.name ?? DEFAULT_MAPPING.name;
    const resolvedFitid = fromExplicit.fitid ?? DEFAULT_MAPPING.fitid;
    const resolvedType = fromExplicit.type ?? DEFAULT_MAPPING.type;

    const result: ColumnMapping = {
      date: build('date') ?? resolvedDate,
      amount: build('amount') ?? resolvedAmount,
    };

    const desc = (build('description') ?? resolvedDesc);
    if (desc) result.description = desc;
    const doc = (build('document') ?? resolvedDoc);
    if (doc) result.document = doc;
    const nameVal = (build('name') ?? resolvedName);
    if (nameVal) result.name = nameVal;
    const fitidVal = (build('fitid') ?? resolvedFitid);
    if (fitidVal) result.fitid = fitidVal;
    const typeVal = (build('type') ?? resolvedType);
    if (typeVal) result.type = typeVal;

    return result;
  }

  private validateMapping(mapping: ColumnMapping, headers: string[]): void {
    if (!headers.includes(mapping.date)) {
      throw ApiError.validation(`Coluna de data "${mapping.date}" não encontrada no CSV.`);
    }
    if (!headers.includes(mapping.amount)) {
      throw ApiError.validation(`Coluna de valor "${mapping.amount}" não encontrada no CSV.`);
    }
  }

  private parseLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  }

  private buildTxn(
    row: Record<string, string>,
    mapping: ColumnMapping,
    decimal: '.' | ',',
    dateFormat: 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'AUTO',
  ): ConnectorNormalizedTxn {
    const rawDate = row[mapping.date];
    const rawAmount = row[mapping.amount];
    if (!rawDate || !rawAmount) {
      throw new Error('Data ou valor ausente na linha.');
    }

    const isoDate = parseDateString(rawDate, dateFormat);
    if (!isoDate) {
      throw new Error(`Data inválida: ${rawDate}`);
    }

    const parsedAmount = parseAmountString(rawAmount, decimal);
    if (Number.isNaN(parsedAmount) || parsedAmount === 0) {
      throw new Error(`Valor inválido: ${rawAmount}`);
    }

    const rawType = mapping.type ? row[mapping.type] : undefined;
    let isCredit = parsedAmount > 0;
    if (rawType) {
      const t = rawType.toUpperCase();
      if (t.includes('CRED') || t === 'C' || t === '+') isCredit = true;
      if (t.includes('DEB') || t === 'D' || t === '-') isCredit = false;
    }

    const desc = (mapping.description ? row[mapping.description] : undefined) || 'Lançamento CSV';
    const doc = mapping.document ? row[mapping.document] : undefined;
    const name = mapping.name ? row[mapping.name] : undefined;
    const fitid = mapping.fitid ? row[mapping.fitid] : undefined;

    return {
      transaction_date: isoDate,
      amount: Math.abs(parsedAmount),
      type: isCredit ? 'CREDIT' : 'DEBIT',
      description: desc,
      bank_transaction_id: fitid ? fitid : null,
      payer_document: doc ? doc.replace(/\D/g, '') : null,
      payer_name: name ? name : null,
      source: 'csv',
      reconciliation_status: 'PENDING',
      raw_payload: row,
    };
  }
}

function parseAmountString(raw: string, decimal: '.' | ','): number {
  let cleaned = raw.trim().replace(/[R$\s]/g, '');
  const isNegative = cleaned.startsWith('-') || (cleaned.startsWith('(') && cleaned.endsWith(')'));
  cleaned = cleaned.replace(/[-()]/g, '');

  if (decimal === ',') {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    cleaned = cleaned.replace(/,/g, '');
  }

  const val = Number(cleaned);
  if (Number.isNaN(val)) return NaN;
  return isNegative ? -val : val;
}

function parseDateString(
  raw: string,
  requestedFormat: 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'AUTO',
): string | null {
  const clean = raw.trim();
  if (requestedFormat !== 'AUTO') {
    return parseFormattedDate(clean, requestedFormat);
  }

  // Heurística de autofiltro
  if (/^\d{4}-\d{2}-\d{2}/.test(clean)) {
    return parseFormattedDate(clean, 'YYYY-MM-DD');
  }
  if (/^\d{2}\/\d{2}\/\d{4}/.test(clean)) {
    return parseFormattedDate(clean, 'DD/MM/YYYY');
  }
  if (/^\d{2}-\d{2}-\d{4}/.test(clean)) {
    return parseFormattedDate(clean.replace(/-/g, '/'), 'DD/MM/YYYY');
  }
  return null;
}

function parseFormattedDate(raw: string, fmt: 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'MM/DD/YYYY'): string | null {
  const sepRegex = /[/.-]/;
  const parts = raw.split(sepRegex);
  if (parts.length !== 3) return null;

  const a = parts[0];
  const b = parts[1];
  const c = parts[2];
  if (!a || !b || !c) return null;

  let year: string;
  let month: string;
  let day: string;

  if (fmt === 'YYYY-MM-DD') {
    if (a.length !== 4) return null;
    year = a; month = b; day = c;
  } else if (fmt === 'DD/MM/YYYY') {
    if (c.length !== 4) return null;
    day = a; month = b; year = c;
  } else {
    if (c.length !== 4) return null;
    month = a; day = b; year = c;
  }

  if (!isValidYMD(year, month, day)) return null;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function isValidYMD(year: string, month: string, day: string): boolean {
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return false;
  if (y < 2000 || y > 2100) return false;
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  return true;
}
