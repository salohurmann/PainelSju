import { useSessao } from '../auth/contexto';
import { temPermissao } from '../services/rbac';
import type { Usuario } from '../types';
import { MODULOS_REGISTRY } from './moduleRegistry';

/**
 * Módulos que o usuário pode abrir. Com login real vem do banco (permissão +
 * módulo liberado para o setor); no modo demonstração, do perfil local.
 */
export function useModulosPermitidos(usuario: Usuario) {
  const { estado } = useSessao();
  return estado.fase === 'autenticado'
    ? MODULOS_REGISTRY.filter(m => estado.contexto.modulos.some(x => x.id === m.id))
    : MODULOS_REGISTRY.filter(m => temPermissao(usuario, m.permissaoMinima));
}
