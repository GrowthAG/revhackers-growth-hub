import { describe, expect, it } from 'vitest';
import { CsvParser } from '../../api/src/domains/finance/parsers/csv-parser';
import { ApiError } from '../../api/src/contracts/errors';

describe('CsvParser', () => {
  const parser = new CsvParser();

  describe('Básico: vírgula + formato US', () => {
    it('parseia CSV com delimitador vírgula e decimal ponto', () => {
      const csv = [
        'data,valor,descricao',
        '2024-01-15,1500.50,Pagamento cliente A',
        '2024-01-16,-200.00,Tarifa bancaria',
      ].join('\n');

      const result = parser.parse(csv);

      expect(result.resolvedDelimiter).toBe(',');
      expect(result.txns).toHaveLength(2);
      expect(result.totalRows).toBe(2);
      expect(result.skippedRows).toBe(0);

      const credit = result.txns[0];
      const debit = result.txns[1];
      expect(credit).toBeDefined();
      expect(credit!.transaction_date).toBe('2024-01-15');
      expect(credit!.amount).toBe(1500.5);
      expect(credit!.type).toBe('CREDIT');
      expect(credit!.description).toBe('Pagamento cliente A');

      expect(debit).toBeDefined();
      expect(debit!.transaction_date).toBe('2024-01-16');
      expect(debit!.amount).toBe(200); // Math.abs aplicado
      expect(debit!.type).toBe('DEBIT');
    });
  });

  describe('Formato brasileiro: ponto-e-vírgula + decimal vírgula', () => {
    it('parseia CSV BR com separador decimal vírgula', () => {
      const csv = [
        'data;valor;descricao',
        '15/01/2024;1.234,56;Recebimento PIX',
      ].join('\n');

      const result = parser.parse(csv);

      expect(result.resolvedDelimiter).toBe(';');
      expect(result.txns).toHaveLength(1);
      expect(result.txns[0]!.transaction_date).toBe('2024-01-15');
      expect(result.txns[0]!.amount).toBe(1234.56);
      expect(result.txns[0]!.type).toBe('CREDIT');
    });

    it('remove símbolo R$ do valor', () => {
      const csv = 'data;valor\n15/01/2024;R$ 99,90';
      const result = parser.parse(csv);

      expect(result.txns[0]!.amount).toBe(99.9);
    });
  });

  describe('Datas', () => {
    it('converte DD/MM/YYYY para ISO', () => {
      const csv = 'data;valor\n05/03/2024;100,00';
      const result = parser.parse(csv);
      expect(result.txns[0]!.transaction_date).toBe('2024-03-05');
    });

    it('aceita formato YYYY-MM-DD direto', () => {
      const csv = 'date,amount\n2024-03-05,100';
      const result = parser.parse(csv);
      expect(result.txns[0]!.transaction_date).toBe('2024-03-05');
    });

    it('respeita dateFormat explícito MM/DD/YYYY', () => {
      // 05/15/2024 só é válido como MM/DD (dia 15 > 12), prova que o formato foi aplicado
      const csv = 'data;valor\n05/15/2024;100,00';
      const result = parser.parse(csv, { dateFormat: 'MM/DD/YYYY' });
      expect(result.txns[0]!.transaction_date).toBe('2024-05-15');
    });

    it('pula linha com data inválida e conta em skippedRows', () => {
      const csv = 'data;valor\n32/13/2024;100,00\n15/01/2024;200,00';
      const result = parser.parse(csv);

      expect(result.txns).toHaveLength(1);
      expect(result.totalRows).toBe(2);
      expect(result.skippedRows).toBe(1);
      expect(result.txns[0]!.amount).toBe(200);
    });
  });

  describe('Mapeamento de colunas por alias', () => {
    it('detecta aliases comuns automaticamente', () => {
      const csv = [
        'dt_transacao;valor_bruto;historico;cpf_cnpj_pagador;nome_pagador;nsu',
        '15/01/2024;500,00;Venda;12.345.678/0001-90;Empresa ABC;NSU-789',
      ].join('\n');

      const result = parser.parse(csv);
      const txn = result.txns[0]!;

      expect(txn.amount).toBe(500);
      expect(txn.description).toBe('Venda');
      expect(txn.payer_document).toBe('12345678000190'); // só dígitos
      expect(txn.payer_name).toBe('Empresa ABC');
      expect(txn.bank_transaction_id).toBe('NSU-789');
      expect(txn.source).toBe('csv');
      expect(txn.reconciliation_status).toBe('PENDING');
    });

    it('usa mapping explícito quando fornecido', () => {
      const csv = 'quando;quanto\n15/01/2024;300,00';
      const result = parser.parse(csv, { mapping: { date: 'quando', amount: 'quanto' } });

      expect(result.txns).toHaveLength(1);
      expect(result.txns[0]!.amount).toBe(300);
      expect(result.effectiveMapping.date).toBe('quando');
    });
  });

  describe('Tipo crédito/débito', () => {
    it('usa coluna de tipo quando presente', () => {
      const csv = 'data;valor;tipo\n15/01/2024;100,00;DEBITO\n16/01/2024;100,00;CREDITO';
      const result = parser.parse(csv);

      expect(result.txns[0]!.type).toBe('DEBIT');
      expect(result.txns[1]!.type).toBe('CREDIT');
    });
  });

  describe('Campos com aspas', () => {
    it('parseia descrição com delimitador dentro de aspas', () => {
      const csv = 'data,valor,descricao\n2024-01-15,100,"Pagamento, parcial"';
      const result = parser.parse(csv);

      expect(result.txns[0]!.description).toBe('Pagamento, parcial');
    });

    it('parseia aspas escapadas com dupla aspas', () => {
      const csv = 'data,valor,descricao\n2024-01-15,100,"Valor ""total"" pago"';
      const result = parser.parse(csv);

      expect(result.txns[0]!.description).toBe('Valor "total" pago');
    });
  });

  describe('Opções e erros', () => {
    it('respeita skipRows', () => {
      const csv = [
        'Linha de lixo do banco',
        'Gerado em 15/01/2024',
        'data;valor',
        '15/01/2024;100,00',
      ].join('\n');

      const result = parser.parse(csv, { skipRows: 2 });

      expect(result.resolvedHeaders).toEqual(['data', 'valor']);
      expect(result.txns).toHaveLength(1);
    });

    it('lança erro de validação para CSV vazio', () => {
      expect(() => parser.parse('')).toThrow(ApiError);
      expect(() => parser.parse('   ')).toThrow('Conteúdo CSV vazio.');
    });

    it('lança erro de validação quando coluna de data não existe', () => {
      expect(() => parser.parse('foo,bar\n1,2')).toThrow('Coluna de data');
    });

    it('lança erro de validação quando coluna de valor não existe', () => {
      const csv = 'data,descricao\n15/01/2024,algo';
      expect(() => parser.parse(csv)).toThrow('Coluna de valor');
    });
  });
});
