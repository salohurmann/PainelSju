import { describe, it, expect, beforeEach } from 'vitest';
import { mudarAcesso, restaurarAcessoPadrao } from '../services/acessoDemo';
import { temPermissao, podeAprovarSolicitacao } from '../services/rbac';
import { Usuario } from '../types';

describe('Matriz RBAC · Controle de Acesso SEJU/PR', () => {
  const usuarioServidor: Usuario = {
    id: 'u-1',
    nome: 'Carlos Silva',
    username: 'carlos.silva',
    role: 'servidor',
    email: 'carlos.silva@seju.pr.gov.br',
    cpf: '123.456.789-01',
    setor: 'Departamento de Cidadania',
    cargo: 'Analista de Gestão Pública'
  };

  const usuarioChefe: Usuario = {
    id: 'u-2',
    nome: 'Mariana Duarte',
    username: 'mariana.duarte',
    role: 'chefe_gabinete',
    email: 'mariana.duarte@seju.pr.gov.br',
    cpf: '987.654.321-09',
    setor: 'Chefia de Gabinete',
    cargo: 'Chefe de Gabinete'
  };

  const usuarioAdmin: Usuario = {
    id: 'u-3',
    nome: 'Administrador Celepar',
    username: 'admin.celepar',
    role: 'admin',
    email: 'admin@celepar.pr.gov.br',
    cpf: '111.222.333-44',
    setor: 'Núcleo de TIC',
    cargo: 'Administrador de Sistemas'
  };

  it('servidor comum deve poder solicitar viaturas mas NÃO pode aprovar missões', () => {
    expect(temPermissao(usuarioServidor, 'frotas:solicitar')).toBe(true);
    expect(temPermissao(usuarioServidor, 'frotas:aprovar')).toBe(false);
  });

  it('chefe de gabinete deve ter permissão de despacho e aprovação de frotas e diárias', () => {
    expect(temPermissao(usuarioChefe, 'frotas:aprovar')).toBe(true);
    expect(temPermissao(usuarioChefe, 'diarias:aprovar')).toBe(true);
    // CENSE é só do financeiro (NFS): a chefia fiscaliza se o admin liberar o setor dela.
    expect(temPermissao(usuarioChefe, 'cense:fiscalizar')).toBe(false);
  });

  it('admin possui todas as permissões do sistema', () => {
    expect(temPermissao(usuarioAdmin, 'frotas:gerenciar')).toBe(true);
    expect(temPermissao(usuarioAdmin, 'chamados:gerenciar')).toBe(true);
    expect(temPermissao(usuarioAdmin, 'seguranca:administrar')).toBe(true);
  });

  it('usuário nulo ou indefinido não possui nenhuma permissão', () => {
    expect(temPermissao(null, 'frotas:ver')).toBe(false);
    expect(temPermissao(undefined, 'chamados:ver')).toBe(false);
  });

  describe('Regra de Ouro da Governança: Segregação de Funções', () => {
    it('chefe NÃO pode aprovar sua própria solicitação (mesmo CPF)', () => {
      const resultado = podeAprovarSolicitacao(usuarioChefe, '987.654.321-09', 'frotas');
      expect(resultado.permitido).toBe(false);
      expect(resultado.motivo).toContain('Conflito de interesse (Segregação de Funções)');
    });

    it('chefe pode aprovar solicitação de outro servidor (CPFs distintos)', () => {
      const resultado = podeAprovarSolicitacao(usuarioChefe, '123.456.789-01', 'frotas');
      expect(resultado.permitido).toBe(true);
      expect(resultado.motivo).toBeUndefined();
    });

    it('servidor sem perfil de aprovação é bloqueado mesmo para terceiros', () => {
      const resultado = podeAprovarSolicitacao(usuarioServidor, '999.888.777-66', 'frotas');
      expect(resultado.permitido).toBe(false);
      expect(resultado.motivo).toContain('Seu perfil não possui atribuição de despacho');
    });
  });

  describe('acesso por setor (mesma regra do banco)', () => {
    const pessoa = (role: Usuario['role'], setorSigla: string, id = `t-${role}-${setorSigla}`): Usuario => ({
      id, nome: 'Teste', username: 't', role, email: 't@t', cpf: '', setor: setorSigla, setorSigla, cargo: '',
    });

    beforeEach(() => restaurarAcessoPadrao());

    it('CENSE aparece só para o financeiro (NFS)', () => {
      expect(temPermissao(pessoa('servidor', 'NAS'), 'cense:ver')).toBe(false);
      expect(temPermissao(pessoa('servidor', 'NFS'), 'cense:ver')).toBe(true);
      expect(temPermissao(pessoa('diretor_cense', 'NFS'), 'cense:lancar_nfe')).toBe(true);
      expect(temPermissao(pessoa('diretor_cense', 'CGS'), 'cense:lancar_nfe')).toBe(false);
    });

    it('Votação aparece só para a UTSC', () => {
      expect(temPermissao(pessoa('servidor', 'NAS'), 'votacao:ver')).toBe(false);
      expect(temPermissao(pessoa('servidor', 'UTSC'), 'votacao:ver')).toBe(true);
      expect(temPermissao(pessoa('gestor_votacao', 'UTSC'), 'votacao:gerenciar')).toBe(true);
    });

    it('login de entidade só vota e não vê mais nada', () => {
      const ent = pessoa('entidade_votante', 'UTSC');
      expect(temPermissao(ent, 'votacao:votar')).toBe(true);
      expect(temPermissao(ent, 'frotas:solicitar')).toBe(false);
      expect(temPermissao(ent, 'ramais:ver')).toBe(false);
    });

    it('o admin libera um setor e muda o papel de alguém', () => {
      mudarAcesso(c => ({ ...c, moduloSetores: { ...c.moduloSetores, cense: ['NFS', 'GS'] } }));
      expect(temPermissao(usuarioChefe, 'cense:fiscalizar')).toBe(false); // sem sigla ainda
      const chefe = { ...usuarioChefe, setorSigla: 'GS' };
      expect(temPermissao(chefe, 'cense:fiscalizar')).toBe(true);
      mudarAcesso(c => ({ ...c, pessoas: { ...c.pessoas, [chefe.id]: { role: 'servidor' } } }));
      expect(temPermissao(chefe, 'frotas:aprovar')).toBe(false);
      mudarAcesso(c => ({ ...c, pessoas: { ...c.pessoas, [chefe.id]: { ativo: false } } }));
      expect(temPermissao(chefe, 'frotas:ver')).toBe(false);
    });
  });
});
