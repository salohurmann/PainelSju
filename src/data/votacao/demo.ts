/**
 * Votação no MODO DEMONSTRAÇÃO: guarda no navegador e aplica as mesmas regras
 * da função vot_votar() do banco. Entidades e eleições são fictícias.
 */
import { ErroPainel } from '../supabase/erros';
import { temPermissao } from '../../services/rbac';
import type { Usuario } from '../../types';
import { situacaoDe, type ApiVotacao, type Eleicao, type Entidade } from './tipos';

interface EleicaoGuardada {
  id: string;
  titulo: string;
  abre_em: string;
  fecha_em: string;
  votos_por_entidade: number;
  candidatas: string[];
}
interface Voto {
  eleicao: string;
  eleitora: string;
  candidata: string;
}
interface Banco {
  entidades: Entidade[];
  eleicoes: EleicaoGuardada[];
  votos: Voto[];
}

const CHAVE = 'seju_votacao_demo_v1';
const dias = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString();

function inicial(): Banco {
  const ent = (id: string, nome: string, responsavel: string, perfil_id: string | null = null): Entidade => ({
    id, nome, responsavel, perfil_id, ativa: true, pode_votar: true, pode_ser_candidata: true,
  });
  const entidades = [
    ent('e1', 'Associação Paranaense de Apoio à Infância', 'Rosana Telles', 'u-entidade'),
    ent('e2', 'Instituto Reconstruir Cidadania', 'Paulo Mendes'),
    ent('e3', 'Rede Mulheres do Litoral', 'Ivone Prado'),
    ent('e4', 'Coletivo Direitos no Campo', 'Jorge Albuquerque'),
    ent('e5', 'Fórum da Juventude de Londrina', 'Bianca Farias'),
    ent('e6', 'Centro de Defesa dos Direitos Humanos de Maringá', 'Hélio Ramos'),
  ];
  const todas = entidades.map(e => e.id);
  return {
    entidades,
    eleicoes: [
      { id: 'el1', titulo: 'Conselho Estadual · vagas da sociedade civil', abre_em: dias(-1), fecha_em: dias(6), votos_por_entidade: 3, candidatas: todas },
      { id: 'el2', titulo: 'Comissão de Ética dos Conselhos', abre_em: dias(-20), fecha_em: dias(-13), votos_por_entidade: 2, candidatas: ['e2', 'e3', 'e5', 'e6'] },
      { id: 'el3', titulo: 'Fórum Regional · Campos Gerais', abre_em: dias(9), fecha_em: dias(12), votos_por_entidade: 1, candidatas: ['e1', 'e4', 'e5'] },
    ],
    votos: [
      // eleição encerrada com votos de exemplo
      ...[['e1', 'e2', 'e3'], ['e2', 'e3', 'e6'], ['e3', 'e2', 'e5'], ['e4', 'e3', 'e6'], ['e5', 'e5', 'e2']].flatMap(([eleitora, a, b]) => [
        { eleicao: 'el2', eleitora, candidata: a },
        { eleicao: 'el2', eleitora, candidata: b },
      ]),
      // duas entidades já votaram na eleição aberta
      ...['e2', 'e4', 'e6'].map(c => ({ eleicao: 'el1', eleitora: 'e2', candidata: c })),
      ...['e3', 'e4', 'e5'].map(c => ({ eleicao: 'el1', eleitora: 'e3', candidata: c })),
    ],
  };
}

let banco: Banco = (() => {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE) ?? 'null');
    if (salvo?.entidades && salvo?.eleicoes && salvo?.votos) return salvo as Banco;
  } catch {
    /* usa os dados de exemplo */
  }
  return inicial();
})();

const salvar = () => {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(banco));
  } catch {
    /* segue só em memória */
  }
};
const erro = (m: string, tipo: ErroPainel['tipo'] = 'negocio') => new ErroPainel(m, 'DEMO', tipo);
const espera = <T,>(v: T) => new Promise<T>(r => setTimeout(() => r(v), 120));

export function apiVotacaoDemo(usuario: Usuario): ApiVotacao {
  const gerencia = () => temPermissao(usuario, 'votacao:gerenciar');
  const acessa = () => gerencia() || temPermissao(usuario, 'votacao:ver') || temPermissao(usuario, 'votacao:votar');
  const minha = () => banco.entidades.find(e => e.perfil_id === usuario.id) ?? null;
  const exigirGestao = () => {
    if (!gerencia()) throw erro('Só a gestão da votação pode fazer isso.', 'permissao');
  };
  const temVotos = (eleicao: string) => banco.votos.some(v => v.eleicao === eleicao);

  return {
    async listarEleicoes() {
      if (!acessa()) return espera([]);
      const eu = minha();
      const lista: Eleicao[] = banco.eleicoes
        .map(e => {
          const cands = banco.entidades.filter(en => e.candidatas.includes(en.id) && en.ativa && en.pode_ser_candidata);
          return {
            id: e.id,
            titulo: e.titulo,
            abre_em: e.abre_em,
            fecha_em: e.fecha_em,
            votos_por_entidade: e.votos_por_entidade,
            situacao: situacaoDe(e.abre_em, e.fecha_em),
            ja_votou: !!eu && banco.votos.some(v => v.eleicao === e.id && v.eleitora === eu.id),
            total_candidatas: e.candidatas.length,
            total_aptas: banco.entidades.filter(en => en.ativa && en.pode_votar).length,
            total_eleitoras_votaram: new Set(banco.votos.filter(v => v.eleicao === e.id).map(v => v.eleitora)).size,
            candidatas: cands.map(c => ({ id: c.id, nome: c.nome })).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
          };
        })
        .sort((a, b) => b.abre_em.localeCompare(a.abre_em));
      return espera(lista);
    },

    async minhaEntidade() {
      return espera(minha());
    },

    async votar(eleicaoId, candidatas) {
      if (!temPermissao(usuario, 'votacao:votar')) throw erro('Seu perfil não vota nesta seção.', 'permissao');
      const eu = minha();
      if (!eu) throw erro('Seu login não está ligado a uma entidade.', 'permissao');
      if (!eu.ativa || !eu.pode_votar) throw erro('Sua entidade não está habilitada para votar.', 'permissao');
      const e = banco.eleicoes.find(x => x.id === eleicaoId);
      if (!e) throw erro('Eleição não encontrada.', 'nao_encontrado');
      if (situacaoDe(e.abre_em, e.fecha_em) !== 'aberta') throw erro('Esta eleição não está aberta para votação.');
      if (banco.votos.some(v => v.eleicao === e.id && v.eleitora === eu.id)) throw erro('Sua entidade já votou nesta eleição.');
      if (candidatas.length !== e.votos_por_entidade) throw erro(`Escolha exatamente ${e.votos_por_entidade} candidata(s).`);
      if (new Set(candidatas).size !== candidatas.length) throw erro('Não é permitido votar mais de uma vez na mesma entidade.');
      const validas = banco.entidades.filter(en => e.candidatas.includes(en.id) && en.ativa && en.pode_ser_candidata).map(en => en.id);
      if (candidatas.some(c => !validas.includes(c))) throw erro('Há uma candidata inválida na sua escolha.');
      banco = { ...banco, votos: [...banco.votos, ...candidatas.map(c => ({ eleicao: e.id, eleitora: eu.id, candidata: c }))] };
      salvar();
      await espera(null);
    },

    async resultado(eleicaoId) {
      const e = banco.eleicoes.find(x => x.id === eleicaoId);
      if (!e) throw erro('Eleição não encontrada.', 'nao_encontrado');
      const situacao = situacaoDe(e.abre_em, e.fecha_em);
      if (!gerencia()) {
        if (!acessa()) throw erro('Sem acesso à votação.', 'permissao');
        if (situacao !== 'encerrada') throw erro('O resultado sai quando a eleição encerrar.', 'permissao');
      }
      const votos = banco.votos.filter(v => v.eleicao === e.id);
      const votaram = new Set(votos.map(v => v.eleitora)).size;
      const candidatas = banco.entidades
        .filter(en => e.candidatas.includes(en.id))
        .map(en => ({ id: en.id, nome: en.nome, votos: votos.filter(v => v.candidata === en.id).length }))
        .sort((a, b) => b.votos - a.votos || a.nome.localeCompare(b.nome, 'pt-BR'));
      const aptas = banco.entidades.filter(en => en.ativa && en.pode_votar).length;
      return espera({
        eleicao: { id: e.id, titulo: e.titulo, abre_em: e.abre_em, fecha_em: e.fecha_em, votos_por_entidade: e.votos_por_entidade, situacao },
        total_entidades: aptas,
        total_votaram: votaram,
        participacao: aptas ? Math.round((votaram * 1000) / aptas) / 10 : 0,
        candidatas,
      });
    },

    async listarEntidades() {
      if (!acessa()) return espera([]);
      return espera(
        [...banco.entidades]
          .filter(e => gerencia() || e.ativa || e.perfil_id === usuario.id)
          .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
      );
    },

    async salvarEntidade(e) {
      exigirGestao();
      if (e.nome.trim().length < 2) throw erro('Informe o nome da entidade.');
      if (e.perfil_id && banco.entidades.some(x => x.perfil_id === e.perfil_id && x.id !== e.id)) {
        throw erro('Esse login já está ligado a outra entidade.');
      }
      banco = e.id
        ? { ...banco, entidades: banco.entidades.map(x => (x.id === e.id ? { ...x, ...e, id: x.id } : x)) }
        : { ...banco, entidades: [...banco.entidades, { ...e, id: 'e-' + Date.now() }] };
      salvar();
      await espera(null);
    },

    async excluirEntidade(id) {
      exigirGestao();
      if (banco.votos.some(v => v.eleitora === id || v.candidata === id)) {
        throw erro('Esta entidade já participou de uma votação: desative em vez de apagar.');
      }
      banco = { ...banco, entidades: banco.entidades.filter(x => x.id !== id), eleicoes: banco.eleicoes.map(el => ({ ...el, candidatas: el.candidatas.filter(c => c !== id) })) };
      salvar();
      await espera(null);
    },

    async salvarEleicao(e) {
      exigirGestao();
      if (e.titulo.trim().length < 3) throw erro('Dê um título à eleição.');
      if (new Date(e.fecha_em) <= new Date(e.abre_em)) throw erro('O encerramento precisa ser depois da abertura.');
      if (e.votos_por_entidade < 1) throw erro('Cada entidade precisa ter pelo menos 1 voto.');
      if (e.candidatas.length < e.votos_por_entidade) throw erro(`Escolha pelo menos ${e.votos_por_entidade} candidatas.`);
      const invalidas = e.candidatas.filter(c => !banco.entidades.some(x => x.id === c && x.ativa && x.pode_ser_candidata));
      if (invalidas.length) throw erro('Só entidades ativas e habilitadas podem ser candidatas.');
      if (e.id) {
        const atual = banco.eleicoes.find(x => x.id === e.id);
        if (!atual) throw erro('Eleição não encontrada.', 'nao_encontrado');
        if (temVotos(e.id)) {
          const mudouRegra =
            atual.votos_por_entidade !== e.votos_por_entidade ||
            new Date(atual.abre_em).getTime() !== new Date(e.abre_em).getTime() ||
            [...atual.candidatas].sort().join() !== [...e.candidatas].sort().join();
          if (mudouRegra) throw erro('Esta eleição já recebeu votos: só dá para mudar o título ou adiar o encerramento.');
          if (new Date(e.fecha_em) < new Date(atual.fecha_em)) throw erro('Esta eleição já recebeu votos: o encerramento só pode ser adiado.');
        }
        banco = { ...banco, eleicoes: banco.eleicoes.map(x => (x.id === e.id ? { ...x, ...e, id: x.id } : x)) };
      } else {
        banco = { ...banco, eleicoes: [...banco.eleicoes, { ...e, id: 'el-' + Date.now() }] };
      }
      salvar();
      await espera(null);
    },

    async excluirEleicao(id) {
      exigirGestao();
      if (temVotos(id)) throw erro('Esta eleição já recebeu votos e não pode ser apagada.');
      banco = { ...banco, eleicoes: banco.eleicoes.filter(x => x.id !== id) };
      salvar();
      await espera(null);
    },
  };
}

export function restaurarVotacaoDemo() {
  banco = inicial();
  salvar();
}
