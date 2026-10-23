import { useSessao } from '../auth/contexto';
import { temPermissao } from '../services/rbac';
import { PERMISSOES, moduloVisivelDemo, useAcessoDemo } from '../services/acessoDemo';
import type { Usuario } from '../types';
import { MODULOS_REGISTRY } from './moduleRegistry';

/**
 * Módulos que o usuário pode abrir — a mesma regra do banco (meus_modulos):
 * o módulo está liberado para o setor da pessoa E o papel dela tem alguma
 * permissão desse módulo. Com login real, a lista vem do banco.
 */
export function useModulosPermitidos(usuario: Usuario) {
  const { estado } = useSessao();
  const acesso = useAcessoDemo();
  if (estado.fase === 'autenticado') {
    return MODULOS_REGISTRY.filter(m => estado.contexto.modulos.some(x => x.id === m.id));
  }
  return MODULOS_REGISTRY.filter(
    m => moduloVisivelDemo(m.id, usuario, acesso) && PERMISSOES.some(p => p.modulo === m.id && temPermissao(usuario, p.id)),
  );
}
