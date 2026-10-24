import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { definirFontePermissoes } from '../services/rbac';
import { iniciarSupabase, supabaseConfigurado, tipoLinkDeAcesso } from '../lib/supabase';
import * as sessaoApi from '../data/supabase/sessao';
import { ContextoSessaoReact, paraUsuarioLegado, type EstadoSessao, type ValorSessao } from './contexto';

export const SessaoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [estado, setEstado] = useState<EstadoSessao>(() =>
    supabaseConfigurado ? { fase: 'carregando' } : { fase: 'demo' },
  );

  const carregar = useCallback(async () => {
    try {
      await iniciarSupabase();
      const contexto = await sessaoApi.carregarContexto();
      if (!contexto) {
        setEstado({ fase: 'anonimo' });
      } else if (!contexto.perfil.ativo) {
        setEstado({ fase: 'inativo' });
      } else if (contexto.perfil.trocar_senha) {
        // Senha inicial ou provisória: só entra depois de criar a própria.
        setEstado({ fase: 'definir_senha', motivo: 'primeiro_acesso' });
      } else {
        setEstado({ fase: 'autenticado', contexto });
      }
    } catch (e) {
      setEstado({ fase: 'erro', mensagem: e instanceof Error ? e.message : 'Falha ao carregar a sessão.' });
    }
  }, []);

  useEffect(() => {
    if (!supabaseConfigurado) return;
    let ativo = true;
    let cancelarInscricao = () => {};

    iniciarSupabase().then(
      cliente => {
        if (!ativo) return;
        cliente.auth.getSession().then(({ data }) => {
          if (!ativo) return;
          if (!data.session) {
            setEstado({ fase: 'anonimo' });
          } else if (tipoLinkDeAcesso) {
            setEstado({ fase: 'definir_senha', motivo: tipoLinkDeAcesso });
          } else {
            void carregar();
          }
        });

        const { data: inscricao } = cliente.auth.onAuthStateChange((evento, session) => {
          if (!ativo) return;
          if (evento === 'PASSWORD_RECOVERY') {
            setEstado({ fase: 'definir_senha', motivo: 'recovery' });
          } else if (evento === 'SIGNED_OUT' || !session) {
            setEstado({ fase: 'anonimo' });
          } else if (evento === 'SIGNED_IN' && !tipoLinkDeAcesso) {
            void carregar();
          }
        });
        cancelarInscricao = () => inscricao.subscription.unsubscribe();
      },
      () => {
        if (ativo) setEstado({ fase: 'erro', mensagem: 'Não foi possível conectar ao banco. Verifique a internet e tente de novo.' });
      },
    );

    return () => {
      ativo = false;
      cancelarInscricao();
    };
  }, [carregar]);

  const valor = useMemo<ValorSessao>(() => {
    const contexto = estado.fase === 'autenticado' ? estado.contexto : null;
    const permissoes = new Set(contexto?.permissoes ?? []);
    const pode = (p: string) => contexto?.perfil.papel_id === 'admin' || permissoes.has(p as never);
    // As telas consultam rbac.temPermissao(): com login real, ele passa a responder pelo banco.
    definirFontePermissoes(contexto ? { usuarioId: contexto.perfil.id, pode } : null);
    return {
      estado,
      usuario: contexto ? paraUsuarioLegado(contexto) : null,
      pode,
      entrar: async (email, senha) => {
        await sessaoApi.entrar(email, senha);
        await carregar();
      },
      sair: async () => {
        await sessaoApi.sair();
        setEstado({ fase: 'anonimo' });
      },
      recarregar: carregar,
      senhaDefinida: async () => {
        // Remove o token do endereço e segue para o painel
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
        await carregar();
      },
    };
  }, [estado, carregar]);

  return <ContextoSessaoReact.Provider value={valor}>{children}</ContextoSessaoReact.Provider>;
};
