import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createHmac } from 'node:crypto';

import { StripeConnector } from '../../api/src/domains/finance/connectors/stripe-connector';
import { PluggyConnector, __resetPluggyTokenCacheForTests } from '../../api/src/domains/finance/connectors/pluggy-connector';
import { InfinitePayConnector } from '../../api/src/domains/finance/connectors/infinitepay-connector';
import { PagBankConnector } from '../../api/src/domains/finance/connectors/pagbank-connector';
import {
  credentialsDiagnostics,
  optionalSecret,
  requireSecret,
  hasSecret,
  __resetCredentialsCacheForTests,
} from '../../api/src/domains/finance/connectors/credentials';
import { OfxParser } from '../../api/src/domains/finance/parsers/ofx-parser';
import { CsvParser } from '../../api/src/domains/finance/parsers/csv-parser';

// ============================================================================
// Stripe Webhook Signature Verification
// ============================================================================

describe('StripeConnector.verifyWebhookSignature', () => {
  const SECRET = 'whsec_test_super_secret';
  const payload = JSON.stringify({ id: 'evt_123', type: 'charge.succeeded' });

  function sign(timestamp: number, body: string): string {
    const signed = `${timestamp}.${body}`;
    const v1 = createHmac('sha256', SECRET).update(signed, 'utf8').digest('hex');
    return `t=${timestamp},v1=${v1}`;
  }

  beforeEach(() => {
    process.env.STRIPE_WEBHOOK_SECRET = SECRET;
  });

  it('accepts a valid signature within tolerance', () => {
    const ts = Math.floor(Date.now() / 1000);
    const result = StripeConnector.verifyWebhookSignature(payload, sign(ts, payload));
    expect(result.valid).toBe(true);
  });

  it('rejects when timestamp is outside 5-minute tolerance', () => {
    const ts = Math.floor(Date.now() / 1000) - 600; // 10 min ago
    const result = StripeConnector.verifyWebhookSignature(payload, sign(ts, payload));
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('timestamp_outside_tolerance');
  });

  it('rejects tampered payload', () => {
    const ts = Math.floor(Date.now() / 1000);
    const tampered = payload.replace('charge.succeeded', 'charge.refunded');
    const result = StripeConnector.verifyWebhookSignature(tampered, sign(ts, payload));
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('signature_mismatch');
  });

  it('rejects missing signature header', () => {
    const result = StripeConnector.verifyWebhookSignature(payload, null);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('missing_signature_header');
  });

  it('rejects malformed header', () => {
    const result = StripeConnector.verifyWebhookSignature(payload, 'random_string');
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('malformed_signature_header');
  });

  it('accepts any one of multiple v1 signatures (Stripe convention)', () => {
    const ts = Math.floor(Date.now() / 1000);
    const valid = createHmac('sha256', SECRET).update(`${ts}.${payload}`, 'utf8').digest('hex');
    const header = `t=${ts},v1=${createHmac('sha256', 'wrong').update('x').digest('hex')},v1=${valid}`;
    expect(StripeConnector.verifyWebhookSignature(payload, header).valid).toBe(true);
  });
});

describe('StripeConnector.normalizeWebhookEvent', () => {
  it('normalizes charge.succeeded to CREDIT', () => {
    const event = {
      type: 'charge.succeeded',
      data: {
        object: {
          id: 'ch_123',
          amount: 15000, // R$ 150,00
          created: 1721000000,
          description: 'Pagamento RevHackers',
          billing_details: { name: 'Acme Corp' },
        },
      },
    };
    const txn = StripeConnector.normalizeWebhookEvent(event);
    expect(txn).not.toBeNull();
    expect(txn?.type).toBe('CREDIT');
    expect(txn?.amount).toBe(150);
    expect(txn?.bank_transaction_id).toBe('ch_123');
    expect(txn?.payer_name).toBe('Acme Corp');
    expect(txn?.source).toBe('stripe');
  });

  it('normalizes charge.refunded to DEBIT with negative amount', () => {
    const event = {
      type: 'charge.refunded',
      data: {
        object: {
          id: 'ch_999',
          amount_refunded: 5000,
          created: 1721000000,
        },
      },
    };
    const txn = StripeConnector.normalizeWebhookEvent(event);
    expect(txn?.type).toBe('DEBIT');
    expect(txn?.amount).toBe(50);
  });

  it('returns null for non-monetary events', () => {
    const event = { type: 'customer.created', data: { object: {} } };
    expect(StripeConnector.normalizeWebhookEvent(event)).toBeNull();
  });
});

// ============================================================================
// Pluggy Webhook Signature Verification
// ============================================================================

describe('PluggyConnector.verifyWebhookSignature', () => {
  const SECRET = 'pluggy_test_secret';
  const body = JSON.stringify({ event: 'transactions.updated', itemId: 'item-1' });

  beforeEach(() => {
    process.env.PLUGGY_WEBHOOK_SECRET = SECRET;
    __resetPluggyTokenCacheForTests();
  });

  it('accepts a valid HMAC signature', () => {
    const sig = createHmac('sha256', SECRET).update(body, 'utf8').digest('hex');
    expect(PluggyConnector.verifyWebhookSignature(body, sig).valid).toBe(true);
  });

  it('rejects a signature made with different secret', () => {
    const sig = createHmac('sha256', 'wrong').update(body, 'utf8').digest('hex');
    expect(PluggyConnector.verifyWebhookSignature(body, sig).valid).toBe(false);
  });

  it('rejects when header is missing', () => {
    expect(PluggyConnector.verifyWebhookSignature(body, null).valid).toBe(false);
  });
});

// ============================================================================
// InfinitePay + PagBank webhook signature
// ============================================================================

describe('InfinitePayConnector.verifyWebhookSignature', () => {
  const SECRET = 'infinitepay_secret';
  const body = '{"id":"inv_1"}';

  beforeEach(() => {
    process.env.INFINITEPAY_WEBHOOK_SECRET = SECRET;
  });

  it('accepts a valid HMAC', () => {
    const sig = createHmac('sha256', SECRET).update(body, 'utf8').digest('hex');
    expect(InfinitePayConnector.verifyWebhookSignature(body, sig).valid).toBe(true);
  });

  it('rejects a mismatched signature', () => {
    const sig = createHmac('sha256', 'wrong').update(body, 'utf8').digest('hex');
    expect(InfinitePayConnector.verifyWebhookSignature(body, sig).valid).toBe(false);
  });
});

describe('PagBankConnector.verifyWebhookSignature', () => {
  const SECRET = 'pagbank_secret';
  const body = '{"id":"ch_1"}';

  beforeEach(() => {
    process.env.PAGBANK_WEBHOOK_SECRET = SECRET;
  });

  it('accepts a valid HMAC', () => {
    const sig = createHmac('sha256', SECRET).update(body, 'utf8').digest('hex');
    expect(PagBankConnector.verifyWebhookSignature(body, sig).valid).toBe(true);
  });

  it('rejects a mismatched signature', () => {
    const sig = createHmac('sha256', 'wrong').update(body, 'utf8').digest('hex');
    expect(PagBankConnector.verifyWebhookSignature(body, sig).valid).toBe(false);
  });
});

// ============================================================================
// Credential Loader
// ============================================================================

describe('credentials loader', () => {
  afterEach(() => {
    __resetCredentialsCacheForTests();
    delete process.env.TEST_SECRET_FOO;
    delete process.env.STRIPE_WEBHOOK_SECRET;
  });

  it('resolves from process.env', () => {
    process.env.TEST_SECRET_FOO = 'env_value';
    expect(optionalSecret('TEST_SECRET_FOO')).toBe('env_value');
  });

  it('requireSecret throws when missing', () => {
    expect(() => requireSecret('NON_EXISTENT_SECRET_ABCDE_9999')).toThrow();
  });

  it('returns empty string for optional miss', () => {
    expect(optionalSecret('NON_EXISTENT_SECRET_ABCDE_9999')).toBe('');
  });

  it('hasSecret returns false when missing', () => {
    expect(hasSecret('NON_EXISTENT_SECRET_ABCDE_9999')).toBe(false);
  });

  it('exposes diagnostics without leaking values', () => {
    const diag = credentialsDiagnostics();
    expect(diag.path).toContain('credentials.json');
    expect(diag.allowed_keys).toContain('STRIPE_API_KEY');
    expect(diag.allowed_keys).toContain('PLUGGY_CLIENT_ID');
  });
});

// ============================================================================
// OFX Parser
// ============================================================================

describe('OfxParser', () => {
  const parser = new OfxParser();

  it('parses OFX 1.x SGML format (typical Itaú/Bradesco style)', () => {
    const ofx = `OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:USASCII
CHARSET:1252
COMPRESSION:NONE
OLDFILEUID:NONE
NEWFILEUID:NONE

<OFX>
<BANKMSGSRSV1>
<STMTTRNRS>
<TRNUID>1
<STATUS>
<CODE>0
<SEVERITY>INFO
</STATUS>
<STMTRS>
<CURDEF>BRL
<BANKACCTFROM>
<BANKID>341
<ACCTID>12345-6
<ACCTTYPE>CHECKING
</BANKACCTFROM>
<BANKTRANLIST>
<DTSTART>20260701
<DTEND>20260731
<STMTTRN>
<TRNTYPE>CREDIT
<DTPOSTED>20260705
<TRNAMT>15000.00
<FITID>PIX98420194
<NAME>Acme Corp
<MEMO>PIX RECEBIDO
</STMTTRN>
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>20260710
<TRNAMT>-250.50
<FITID>TX9876
<NAME>Fornecedor X
</STMTTRN>
</BANKTRANLIST>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>`;
    const result = parser.parse(ofx);
    expect(result.currency).toBe('BRL');
    expect(result.account_id).toBe('12345-6');
    expect(result.txns).toHaveLength(2);
    expect(result.txns[0]?.type).toBe('CREDIT');
    expect(result.txns[0]?.amount).toBe(15000);
    expect(result.txns[0]?.transaction_date).toBe('2026-07-05');
    expect(result.txns[0]?.bank_transaction_id).toBe('PIX98420194');
    expect(result.txns[1]?.type).toBe('DEBIT');
    expect(result.txns[1]?.amount).toBe(250.5);
  });

  it('parses OFX 2.x XML format', () => {
    const ofx = `<?xml version="1.0" encoding="UTF-8"?>
<OFX>
  <BANKMSGSRSV1>
    <STMTTRNRS>
      <STMTRS>
        <CURDEF>BRL</CURDEF>
        <BANKACCTFROM>
          <ACCTID>99999</ACCTID>
        </BANKACCTFROM>
        <BANKTRANLIST>
          <STMTTRN>
            <TRNTYPE>CREDIT</TRNTYPE>
            <DTPOSTED>20260715</DTPOSTED>
            <TRNAMT>8500.00</TRNAMT>
            <FITID>INV-9988</FITID>
            <NAME>Acme Industries</NAME>
            <MEMO>Setup Inicial</MEMO>
          </STMTTRN>
        </BANKTRANLIST>
      </STMTRS>
    </STMTTRNRS>
  </BANKMSGSRSV1>
</OFX>`;
    const result = parser.parse(ofx);
    expect(result.txns).toHaveLength(1);
    expect(result.txns[0]?.bank_transaction_id).toBe('INV-9988');
    expect(result.txns[0]?.amount).toBe(8500);
    expect(result.txns[0]?.payer_name).toBe('Acme Industries');
  });

  it('handles DTPOSTED with time component (YYYYMMDDHHMMSS)', () => {
    const ofx = `<OFX>
<STMTTRN>
<TRNTYPE>CREDIT</TRNTYPE>
<DTPOSTED>20260715143000</DTPOSTED>
<TRNAMT>100.00</TRNAMT>
<FITID>X1</FITID>
</STMTTRN>
</OFX>`;
    const result = parser.parse(ofx);
    expect(result.txns[0]?.transaction_date).toBe('2026-07-15');
  });
});

// ============================================================================
// CSV Parser
// ============================================================================

describe('CsvParser', () => {
  const parser = new CsvParser();

  it('parses a comma-separated CSV with English headers', () => {
    const csv = `date,amount,description,document,name,fitid
2026-07-01,15000.00,Setup Fee,12345678000190,Acme Corp,INV-001
2026-07-02,-250.50,Office rent,11111111000111,Imobiliária Y,TX-002
2026-07-03,500.00,Refund,12345678000190,Acme Corp,INV-003`;
    const result = parser.parse(csv);
    expect(result.totalRows).toBe(3);
    expect(result.skippedRows).toBe(0);
    expect(result.txns).toHaveLength(3);
    expect(result.txns[0]?.type).toBe('CREDIT');
    expect(result.txns[0]?.amount).toBe(15000);
    expect(result.txns[0]?.payer_document).toBe('12345678000190');
    expect(result.txns[1]?.type).toBe('DEBIT');
    expect(result.txns[1]?.amount).toBe(250.5);
  });

  it('parses a semicolon-separated CSV with Brazilian headers and decimal comma', () => {
    const csv = `data;valor;descricao;cnpj_cpf;nome;doc
01/07/2026;15.000,00;Setup Fee;12.345.678/0001-90;Acme Corp;INV-001
02/07/2026;-250,50;Aluguel;11.111.111/0001-11;Imob Y;TX-002`;
    const result = parser.parse(csv);
    expect(result.txns).toHaveLength(2);
    expect(result.txns[0]?.amount).toBe(15000);
    expect(result.txns[0]?.transaction_date).toBe('2026-07-01');
    expect(result.txns[0]?.payer_document).toBe('12345678000190');
    expect(result.txns[1]?.type).toBe('DEBIT');
    expect(result.txns[1]?.amount).toBe(250.5);
  });

  it('handles type column explicitly (C/D)', () => {
    const csv = `date,amount,type,description,fitid
2026-07-01,100.00,C,Payment in,INV-1
2026-07-02,50.00,D,Payment out,INV-2`;
    const result = parser.parse(csv);
    expect(result.txns[0]?.type).toBe('CREDIT');
    expect(result.txns[1]?.type).toBe('DEBIT');
  });

  it('skips invalid rows but keeps parsing the rest', () => {
    const csv = `date,amount,description
2026-07-01,100.00,Valid
INVALID_DATE,50.00,Broken
2026-07-03,75.00,Valid again`;
    const result = parser.parse(csv);
    expect(result.totalRows).toBe(3);
    expect(result.skippedRows).toBe(1);
    expect(result.txns).toHaveLength(2);
  });

  it('respects explicit column mapping override', () => {
    const csv = `dt_transacao;valor_transacao;historico
2026-07-01;100;Custom mapping`;
    const result = parser.parse(csv, {
      delimiter: ';',
      mapping: { date: 'dt_transacao', amount: 'valor_transacao', description: 'historico' },
    });
    expect(result.txns[0]?.amount).toBe(100);
    expect(result.txns[0]?.description).toBe('Custom mapping');
  });

  it('handles quoted fields with commas inside', () => {
    const csv = `date,amount,description
2026-07-01,100.00,"Transferência, ref 123"
2026-07-02,50.00,"Saída, doc 456"`;
    const result = parser.parse(csv);
    expect(result.txns[0]?.description).toBe('Transferência, ref 123');
    expect(result.txns[1]?.description).toBe('Saída, doc 456');
  });
});

// ============================================================================
// Connector.isConfigured()
// ============================================================================

describe('Connector isConfigured()', () => {
  beforeEach(() => {
    delete process.env.STRIPE_API_KEY;
    delete process.env.INFINITEPAY_API_KEY;
    delete process.env.PAGBANK_API_TOKEN;
    delete process.env.PLUGGY_CLIENT_ID;
    delete process.env.PLUGGY_CLIENT_SECRET;
    __resetCredentialsCacheForTests();
  });

  it('Stripe reports not configured when no key', () => {
    const c = new StripeConnector('');
    expect(c.isConfigured()).toBe(false);
  });

  it('Stripe reports configured when key provided', () => {
    const c = new StripeConnector('sk_test_123');
    expect(c.isConfigured()).toBe(true);
  });

  it('Pluggy requires both client_id and client_secret', () => {
    expect(new PluggyConnector('id', '').isConfigured()).toBe(false);
    expect(new PluggyConnector('', 'secret').isConfigured()).toBe(false);
    expect(new PluggyConnector('id', 'secret').isConfigured()).toBe(true);
  });

  it('InfinitePay reports configured when key provided', () => {
    const c = new InfinitePayConnector('sk_live_abc');
    expect(c.isConfigured()).toBe(true);
  });

  it('PagBank reports configured when token provided', () => {
    const c = new PagBankConnector('tok_abc');
    expect(c.isConfigured()).toBe(true);
  });
});
