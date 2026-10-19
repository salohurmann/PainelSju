import { describe, it, expect } from 'vitest';

/**
 * Validador Oficial de CPF (Algoritmo Módulo 11 da Receita Federal do Brasil)
 */
export function validarCpfOficial(strCPF: string): boolean {
  const clean = strCPF.replace(/\D/g, '');
  if (clean.length !== 11) return false;
  // Rejeita sequências de dígitos idênticos (111.111.111-11, 222..., etc.)
  if (/^(\d)\1{10}$/.test(clean)) return false;

  let soma = 0;
  for (let i = 1; i <= 9; i++) {
    soma += parseInt(clean[i - 1], 10) * (11 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(clean[9], 10)) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(clean[i - 1], 10) * (12 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(clean[10], 10)) return false;

  return true;
}

/**
 * Calculadora Oficial de Diárias (Decreto Estadual nº 1.428/PR)
 */
export function calcularDiariaDecreto1428({
  nivel,
  dias,
  comPernoite
}: {
  nivel: 'medio' | 'superior' | 'direcao';
  dias: number;
  comPernoite: boolean;
}) {
  const valoresNivel = {
    medio: 280,
    superior: 380,
    direcao: 520
  };

  const valorUnitario = valoresNivel[nivel];
  const multiplicadorPernoite = comPernoite ? 1 : 0.5;
  const valorTotal = valorUnitario * dias * multiplicadorPernoite;

  const parcelaHospedagem = comPernoite ? valorTotal * 0.50 : 0;
  const parcelaAlimentacao = comPernoite ? valorTotal * 0.35 : valorTotal * 0.70;
  const parcelaLocomocao = comPernoite ? valorTotal * 0.15 : valorTotal * 0.30;

  return {
    valorUnitario,
    valorTotal,
    parcelaHospedagem,
    parcelaAlimentacao,
    parcelaLocomocao
  };
}

/**
 * Função de Anti-Colisão de Horários em Reserva de Salas
 */
export function checarColisaoHorario(
  reservasExistentes: Array<{ horaInicio: number; horaFim: number }>,
  novoInicio: number,
  novoFim: number
): boolean {
  if (novoInicio >= novoFim) return true; // Intervalo inválido

  return reservasExistentes.some(r => {
    // Choque se o intervalo proposto intercepta o intervalo existente
    return (
      (novoInicio >= r.horaInicio && novoInicio < r.horaFim) ||
      (novoFim > r.horaInicio && novoFim <= r.horaFim) ||
      (novoInicio <= r.horaInicio && novoFim >= r.horaFim)
    );
  });
}

describe('Regras Críticas de Negócio SEJU/PR', () => {
  describe('Validador Oficial de CPF (Receita Federal)', () => {
    it('deve validar CPFs matematicamente corretos com pontuação ou dígitos puros', () => {
      // CPFs válidos de teste
      expect(validarCpfOficial('52998224725')).toBe(true);
      expect(validarCpfOficial('529.982.247-25')).toBe(true);
    });

    it('deve rejeitar sequências inválidas com todos os dígitos iguais', () => {
      expect(validarCpfOficial('111.111.111-11')).toBe(false);
      expect(validarCpfOficial('000.000.000-00')).toBe(false);
      expect(validarCpfOficial('99999999999')).toBe(false);
    });

    it('deve rejeitar CPFs com dígitos verificadores incorretos', () => {
      expect(validarCpfOficial('123.456.789-00')).toBe(false);
      expect(validarCpfOficial('529.982.247-00')).toBe(false);
    });

    it('deve rejeitar CPFs com comprimento diferente de 11 dígitos', () => {
      expect(validarCpfOficial('123.456')).toBe(false);
      expect(validarCpfOficial('')).toBe(false);
      expect(validarCpfOficial('1234567890123')).toBe(false);
    });
  });

  describe('Cálculo de Diárias (Decreto Estadual nº 1.428/PR)', () => {
    it('deve calcular diária completa de Nível Superior com pernoite para 2 dias', () => {
      const res = calcularDiariaDecreto1428({
        nivel: 'superior',
        dias: 2,
        comPernoite: true
      });

      expect(res.valorUnitario).toBe(380);
      expect(res.valorTotal).toBe(760);
      expect(res.parcelaHospedagem).toBe(380); // 50%
      expect(res.parcelaAlimentacao).toBe(266); // 35%
      expect(res.parcelaLocomocao).toBe(114); // 15%
      expect(res.parcelaHospedagem + res.parcelaAlimentacao + res.parcelaLocomocao).toBe(760);
    });

    it('deve calcular 50% do valor total quando a viagem for sem pernoite (bate e volta)', () => {
      const res = calcularDiariaDecreto1428({
        nivel: 'direcao',
        dias: 1,
        comPernoite: false
      });

      expect(res.valorUnitario).toBe(520);
      expect(res.valorTotal).toBe(260); // 50% de 520
      expect(res.parcelaHospedagem).toBe(0); // Sem pousada
      expect(res.parcelaAlimentacao).toBe(182); // 70% de 260
      expect(res.parcelaLocomocao).toBe(78); // 30% de 260
    });
  });

  describe('Prevenção Anti-Colisão de Reserva de Salas', () => {
    const reservasExistentes = [
      { horaInicio: 9, horaFim: 11 },
      { horaInicio: 14, horaFim: 16 }
    ];

    it('deve permitir agendamento em horário livre contíguo (11h às 13h)', () => {
      const temColisao = checarColisaoHorario(reservasExistentes, 11, 13);
      expect(temColisao).toBe(false);
    });

    it('deve acusar colisão se o horário sobrepor o início da reserva existente (10h às 12h)', () => {
      const temColisao = checarColisaoHorario(reservasExistentes, 10, 12);
      expect(temColisao).toBe(true);
    });

    it('deve acusar colisão se o horário sobrepor o término da reserva existente (8h às 10h)', () => {
      const temColisao = checarColisaoHorario(reservasExistentes, 8, 10);
      expect(temColisao).toBe(true);
    });

    it('deve acusar colisão se o horário englobar totalmente a reserva existente (8h às 12h)', () => {
      const temColisao = checarColisaoHorario(reservasExistentes, 8, 12);
      expect(temColisao).toBe(true);
    });

    it('deve rejeitar horário onde o início é maior ou igual ao término', () => {
      expect(checarColisaoHorario(reservasExistentes, 15, 14)).toBe(true);
      expect(checarColisaoHorario(reservasExistentes, 14, 14)).toBe(true);
    });
  });
});
