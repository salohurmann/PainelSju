import { describe, it, expect } from 'vitest';
import { traduzirErro, ErroPainel, exigir } from '../data/supabase/erros';
import { chaveNfeValida, cnpjValido } from '../data/supabase/cense';
import { validarSenha } from '../data/supabase/sessao';
import { horarioBrasilia } from '../data/supabase/salas';
import { paraUsuarioLegado } from '../auth/contexto';
import type { ContextoSessao } from '../data/supabase/tipos';

describe('traduzirErro', () => {
  it('mantém a mensagem de regra de negócio vinda do banco', () => {
    const e = traduzirErro({ code: 'P0001', message: 'Não é possível solicitar veículo para data passada.' });
    expect(e).toBeInstanceOf(ErroPainel);
    expect(e.tipo).toBe('negocio');
    expect(e.message).toBe('Não é possível solicitar veículo para data passada.');
  });

  it('traduz a restrição de anti-colisão de salas', () => {
    const e = traduzirErro({ code: '23P01', message: 'conflicting key value violates exclusion constraint "reservas_sem_sobreposicao"' });
    expect(e.tipo).toBe('conflito');
    expect(e.message).toBe('Esta sala já está reservada nesse horário.');
  });

  it('esconde mensagens técnicas de permissão do Postgres', () => {
    const e = traduzirErro({ code: '42501', message: 'new row violates row-level security policy for table "agendamentos"' });
    expect(e.tipo).toBe('permissao');
    expect(e.message).toBe('Você não tem permissão para esta ação.');
  });

  it('mantém mensagens de permissão escritas em português pelo banco', () => {
    const e = traduzirErro({ code: '42501', message: 'Segregação de funções: você não pode decidir a sua própria solicitação.' });
    expect(e.message).toContain('Segregação de funções');
  });

  it('reconhece credenciais inválidas e falha de rede', () => {
    expect(traduzirErro({ message: 'Invalid login credentials' }).message).toBe('Setor (ou e-mail) ou senha incorretos.');
    expect(traduzirErro({ name: 'TypeError', message: 'Failed to fetch' }).tipo).toBe('rede');
  });

  it('erro desconhecido vira mensagem genérica, sem vazar detalhes', () => {
    const e = traduzirErro({ code: 'XX000', message: 'internal: relation foo at 0x7f…' });
    expect(e.tipo).toBe('tecnico');
    expect(e.message).not.toContain('0x7f');
  });

  it('exigir devolve os dados ou lança ErroPainel', () => {
    expect(exigir({ data: [1, 2], error: null })).toEqual([1, 2]);
    expect(() => exigir({ data: null, error: { code: 'P0002', message: 'Solicitação não encontrada.' } })).toThrow('Solicitação não encontrada.');
  });
});

describe('validações fiscais (iguais às do banco)', () => {
  it('valida o dígito verificador da chave NF-e', () => {
    expect(chaveNfeValida('4126 1011 2223 3300 0181 5500 1000 0012 3411 2345 6784')).toBe(true);
    expect(chaveNfeValida('41261011222333000181550010000012341123456785')).toBe(false);
    expect(chaveNfeValida('123')).toBe(false);
  });

  it('valida CNPJ', () => {
    expect(cnpjValido('11.222.333/0001-81')).toBe(true);
    expect(cnpjValido('11.222.333/0001-82')).toBe(false);
    expect(cnpjValido('11111111111111')).toBe(false);
  });
});

describe('sessão', () => {
  it('aplica a política de senha do Supabase', () => {
    expect(validarSenha('curta1A')).toMatch(/10 caracteres/);
    expect(validarSenha('semnumerosaqui')).toMatch(/maiúsculas/);
    expect(validarSenha('SenhaForte2026')).toBeNull();
  });

  it('converte o perfil do banco para o formato das telas atuais, sem CPF', () => {
    const contexto: ContextoSessao = {
      perfil: {
        id: 'u1', nome: 'Pessoa Teste', email: 'pessoa@teste.gov', cargo: 'Analista', telefone: null,
        papel_id: 'tecnico_ti', ativo: true, setor: { id: 's1', sigla: 'UTEC', nome: 'Tecnologia' },
      },
      permissoes: ['chamados:atender'], modulos: [], notificacoes_nao_lidas: 0,
    };
    const u = paraUsuarioLegado(contexto);
    expect(u.role).toBe('tecnico_ti');
    expect(u.cpf).toBe('');
    expect(u.setor).toBe('Tecnologia');
    expect(u.setorSigla).toBe('UTEC');
    expect(paraUsuarioLegado({ ...contexto, perfil: { ...contexto.perfil, papel_id: 'papel_novo' } }).role).toBe('servidor');
    expect(paraUsuarioLegado({ ...contexto, perfil: { ...contexto.perfil, papel_id: 'chefe_gabinete' } }).role).toBe('chefe_gabinete');
  });
});

describe('horários', () => {
  it('monta instantes no fuso de Brasília', () => {
    expect(horarioBrasilia('2026-11-03', 9)).toBe('2026-11-03T09:00:00-03:00');
    expect(new Date(horarioBrasilia('2026-11-03', 9, 30)).toISOString()).toBe('2026-11-03T12:30:00.000Z');
  });
});
