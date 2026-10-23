import { describe, expect, it } from 'vitest';
import { hashDe, lerRota } from '../services/rota';

describe('rotas por hash', () => {
  it('lê módulo e subaba', () => {
    expect(lerRota('#/frota/aprovacoes')).toEqual({ app: 'frota', aba: 'aprovacoes' });
    expect(lerRota('#/votacao')).toEqual({ app: 'votacao', aba: undefined });
    expect(lerRota('#/mesa')).toEqual({ app: 'hub', aba: undefined });
  });
  it('cai na Mesa com endereço vazio ou desconhecido', () => {
    expect(lerRota('')).toEqual({ app: 'hub' });
    expect(lerRota('#/nao-existe')).toEqual({ app: 'hub' });
  });
  it('ignora subaba com caracteres estranhos', () => {
    expect(lerRota('#/admin/<script>').aba).toBeUndefined();
  });
  it('aceita o endereço antigo ?app=', () => {
    expect(lerRota('', '?app=salas')).toEqual({ app: 'salas' });
    expect(lerRota('#/chamados', '?app=salas').app).toBe('chamados');
  });
  it('monta o hash de volta', () => {
    expect(hashDe({ app: 'hub' })).toBe('#/');
    expect(hashDe({ app: 'frota', aba: 'consultar' })).toBe('#/frota/consultar');
    expect(lerRota(hashDe({ app: 'admin', aba: 'modulos' }))).toEqual({ app: 'admin', aba: 'modulos' });
  });
});
