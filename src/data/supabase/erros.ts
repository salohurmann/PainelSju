/**
 * Tradução dos erros do Supabase/Postgres para mensagens que o servidor
 * entende. As regras de negócio do banco já lançam mensagens em português
 * (código P0001/42501/23P01); erros técnicos viram mensagens genéricas.
 */
export class ErroPainel extends Error {
  readonly codigo: string;
  readonly tipo: 'negocio' | 'permissao' | 'conflito' | 'nao_encontrado' | 'sessao' | 'rede' | 'tecnico';

  constructor(mensagem: string, codigo: string, tipo: ErroPainel['tipo']) {
    super(mensagem);
    this.name = 'ErroPainel';
    this.codigo = codigo;
    this.tipo = tipo;
  }
}

interface ErroBruto {
  code?: string;
  message?: string;
  details?: string | null;
  hint?: string | null;
  status?: number;
  name?: string;
}

const RESTRICOES: Record<string, string> = {
  reservas_sem_sobreposicao: 'Esta sala já está reservada nesse horário.',
  reservas_intervalo_valido: 'O horário de término deve ser depois do início (máximo 12 horas).',
  vistorias_quatro_fotos: 'A vistoria exige as 4 fotos: frente, traseira e as duas laterais.',
  diarias_periodo_valido: 'A data de volta não pode ser anterior à de ida.',
  agendamentos_protocolo_key: 'Conflito ao gerar o protocolo. Tente novamente.',
  cense_notas_chave_acesso_key: 'Esta nota fiscal já foi lançada.',
  cense_notas_chave_acesso_check: 'Chave de acesso inválida (confira os 44 dígitos).',
  cense_notas_cnpj_check: 'CNPJ inválido.',
};

export function traduzirErro(erro: unknown): ErroPainel {
  if (erro instanceof ErroPainel) return erro;
  const e = (erro ?? {}) as ErroBruto;
  const codigo = e.code ?? (e.status ? `HTTP_${e.status}` : 'DESCONHECIDO');
  const msg = e.message ?? '';

  for (const [restricao, texto] of Object.entries(RESTRICOES)) {
    if (msg.includes(restricao) || (e.details ?? '').includes(restricao)) {
      const tipo = codigo === '23P01' || codigo === '23505' ? 'conflito' : 'negocio';
      return new ErroPainel(texto, codigo, tipo);
    }
  }

  switch (codigo) {
    case 'P0001':
      return new ErroPainel(msg, codigo, 'negocio');
    case 'P0002':
      return new ErroPainel(msg || 'Registro não encontrado.', codigo, 'nao_encontrado');
    case '23P01':
      return new ErroPainel(msg, codigo, 'conflito');
    case '23505':
      return new ErroPainel('Este registro já existe.', codigo, 'conflito');
    case '23514':
    case '22023':
    case '22P02':
      return new ErroPainel('Algum dado informado é inválido. Revise o formulário.', codigo, 'negocio');
    case '42501':
      return new ErroPainel(
        msg && !/row-level security|permission denied/i.test(msg) ? msg : 'Você não tem permissão para esta ação.',
        codigo,
        'permissao',
      );
    case 'PGRST301':
    case 'HTTP_401':
      return new ErroPainel('Sua sessão expirou. Entre novamente.', codigo, 'sessao');
    case 'invalid_credentials':
      return new ErroPainel('E-mail ou senha incorretos.', codigo, 'sessao');
  }

  if (/invalid login credentials/i.test(msg)) {
    return new ErroPainel('E-mail ou senha incorretos.', 'invalid_credentials', 'sessao');
  }
  if (/failed to fetch|network|fetch failed/i.test(msg) || e.name === 'TypeError') {
    return new ErroPainel('Sem conexão com o servidor. Verifique a rede e tente novamente.', codigo, 'rede');
  }
  return new ErroPainel('Não foi possível concluir a operação. Tente novamente.', codigo, 'tecnico');
}

/** Lança ErroPainel se a resposta do Supabase trouxer erro; senão devolve os dados. */
export function exigir<T>(resposta: { data: T | null; error: unknown }): T {
  if (resposta.error) throw traduzirErro(resposta.error);
  return resposta.data as T;
}
