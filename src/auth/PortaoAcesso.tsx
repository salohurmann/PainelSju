import React from 'react';
import App from '../App';
import { useSessao } from './contexto';
import { TelaAviso, TelaCarregando, TelaDefinirSenha, TelaLogin } from './TelasAcesso';

/**
 * Decide o que mostrar conforme a sessão:
 * - Supabase não configurado → painel no modo demonstração local (como antes).
 * - Supabase configurado → exige login; o perfil real substitui o seletor de perfis.
 */
export const PortaoAcesso: React.FC = () => {
  const { estado, usuario, sair, recarregar } = useSessao();

  switch (estado.fase) {
    case 'demo':
      return <App />;
    case 'carregando':
      return <TelaCarregando />;
    case 'anonimo':
      return <TelaLogin />;
    case 'definir_senha':
      return <TelaDefinirSenha motivo={estado.motivo} />;
    case 'inativo':
      return (
        <TelaAviso
          titulo="Conta desativada"
          mensagem="Seu acesso ao painel está desativado. Procure a administração se acredita que isso é um engano."
          acao={{ rotulo: 'Sair', aoClicar: () => void sair() }}
        />
      );
    case 'erro':
      return (
        <TelaAviso
          titulo="Não foi possível carregar o painel"
          mensagem={estado.mensagem}
          acao={{ rotulo: 'Tentar novamente', aoClicar: () => void recarregar() }}
        />
      );
    case 'autenticado':
      return usuario ? <App sessao={{ usuario, sair }} /> : <TelaCarregando />;
  }
};
