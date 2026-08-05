import { describe, expect, it } from 'vitest';
import { ReconciliationEngine } from '../../api/src/domains/finance/reconciliation-engine';
import type { BankStatementRecord, LedgerEntryRecord } from '../../api/src/domains/finance/types';

const makeStatement = (overrides: Partial<BankStatementRecord> = {}): BankStatementRecord => ({
  id: 'stmt-1',
  amount: 1000,
  transaction_date: '2024-01-15',
  type: 'CREDIT',
  description: 'Test transaction',
  source: 'test',
  reconciliation_status: 'PENDING',
  created_at: '2024-01-15',
  updated_at: '2024-01-15',
  ...overrides,
});

const makeLedger = (overrides: Partial<LedgerEntryRecord> = {}): LedgerEntryRecord => ({
  id: 'led-1',
  category: 'services_revenue',
  cost_center: 'default',
  description: 'Test ledger entry',
  amount: 1000,
  competence_date: '2024-01-15',
  is_paid: false,
  created_at: '2024-01-15',
  updated_at: '2024-01-15',
  ...overrides,
});

describe('ReconciliationEngine', () => {
  const engine = new ReconciliationEngine();

  describe('Rule 1: Exact TxID / PixKey / Invoice ID', () => {
    it('matcha por bank_transaction_id com 100% de score', () => {
      const statement = makeStatement({ bank_transaction_id: 'tx-123', amount: 1000 });
      const ledger = [makeLedger({ id: 'led-1', amount: 1000, description: 'tx-123' })];

      const result = engine.evaluateMatch(statement, ledger, []);

      expect(result).not.toBeNull();
      expect(result?.match_score).toBe(100);
      expect(result?.ledger_entry?.id).toBe('led-1');
    });

    it('não matcha se tx_id não existir no ledger', () => {
      const statement = makeStatement({ bank_transaction_id: 'tx-999', amount: 1000 });
      const ledger = [makeLedger({ id: 'led-1', amount: 1000, description: 'tx-123' })];

      const result = engine.evaluateMatch(statement, ledger, []);

      expect(result).toBeNull();
    });
  });

  describe('Rule 2: CNPJ/CPF + Amount + Date Window', () => {
    it('matcha por documento no description + valor dentro de D+2', () => {
      const statement = makeStatement({ payer_document: '12345678901', amount: 5000, transaction_date: '2024-01-15' });
      // Documento no description da ledger entry satisfaz a condição entry.description.includes(cleanDoc)
      const ledger = [makeLedger({ id: 'led-1', amount: 5000, competence_date: '2024-01-17', description: 'Serviço para 12345678901' })];

      const result = engine.evaluateMatch(statement, ledger, []);

      expect(result).not.toBeNull();
      expect(result?.match_score).toBe(95);
    });

    it('não matcha se valor divergir', () => {
      const statement = makeStatement({ payer_document: '12345678901', amount: 5000 });
      const ledger = [makeLedger({ id: 'led-1', amount: 6000, description: 'Serviço para 12345678901' })];

      const result = engine.evaluateMatch(statement, ledger, []);

      expect(result).toBeNull();
    });
  });

  describe('Rule 3: Fuzzy Name + Amount', () => {
    it('matcha por nome similar com 80% de score', () => {
      const statement = makeStatement({ payer_name: 'Empresa ABC Ltda', amount: 10000 });
      const ledger = [makeLedger({ id: 'led-1', amount: 10000, description: 'ABC Empresa Ltda' })];

      const result = engine.evaluateMatch(statement, ledger, []);

      expect(result).not.toBeNull();
      expect(result?.match_score).toBe(80);
    });

    it('não matcha com nomes muito diferentes', () => {
      const statement = makeStatement({ payer_name: 'Empresa XYZ', amount: 1000 });
      const ledger = [makeLedger({ id: 'led-1', amount: 1000, description: 'João Silva' })];

      const result = engine.evaluateMatch(statement, ledger, []);

      expect(result).toBeNull();
    });
  });

  describe('Priority: Rule 1 > Rule 2 > Rule 3', () => {
    it('Rule 1 tem prioridade sobre Rule 2', () => {
      const statement = makeStatement({
        bank_transaction_id: 'tx-123',
        payer_document: '12345678901',
        amount: 1000,
      });
      const ledger = [makeLedger({ id: 'led-1', amount: 1000, description: 'tx-123' })];

      const result = engine.evaluateMatch(statement, ledger, []);

      expect(result).not.toBeNull();
      expect(result?.match_score).toBe(100);
    });
  });

  describe('Empty inputs', () => {
    it('retorna null para statement sem identificadores', () => {
      const statement = makeStatement({ bank_transaction_id: null, payer_document: null, payer_name: null });
      const ledger = [makeLedger({ id: 'led-1', amount: 1000 })];

      const result = engine.evaluateMatch(statement, ledger, []);

      expect(result).toBeNull();
    });
  });
});
