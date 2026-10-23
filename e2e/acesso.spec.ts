import { expect, test } from '@playwright/test';
import { abas, abrirComo, trocarPerfil } from './ajuda';

test.describe('Abas por setor', () => {
  test('servidora de outro setor não vê CENSE nem Votação', async ({ page }) => {
    await abrirComo(page, 'Lúcia Andrade Viana');
    const visiveis = await abas(page);
    expect(visiveis).toEqual(expect.arrayContaining(['Mesa', 'Frotas', 'Chamados', 'Salas', 'Diárias', 'Ramais']));
    expect(visiveis).not.toContain('CENSE');
    expect(visiveis).not.toContain('Votação');
    expect(visiveis).not.toContain('Admin');
  });

  test('financeiro (NFS) vê CENSE e não vê Votação', async ({ page }) => {
    await abrirComo(page, 'Renata Coelho');
    const visiveis = await abas(page);
    expect(visiveis).toContain('CENSE');
    expect(visiveis).not.toContain('Votação');
  });

  test('UTSC vê Votação; entidade vê só a Votação', async ({ page }) => {
    await abrirComo(page, 'Fernanda Rocha');
    expect(await abas(page)).toContain('Votação');
    await trocarPerfil(page, 'Rosana Telles');
    expect(await abas(page)).toEqual(['Votação']);
  });

  test('link direto para aba bloqueada mostra aviso, não a tela', async ({ page }) => {
    await abrirComo(page, 'Lúcia Andrade Viana', 'cense');
    await expect(page.getByText('Esta aba não está liberada para você.')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Fundo rotativo/i })).toHaveCount(0);
  });

  test('admin muda o setor de uma pessoa e a aba aparece para ela', async ({ page }) => {
    await abrirComo(page, 'Administrador SEJU', 'admin');
    const linha = page.locator('li, div').filter({ has: page.getByText('Lúcia Andrade Viana', { exact: true }) }).filter({ has: page.locator('select') }).last();
    await linha.locator('select').first().selectOption('UTSC');
    await trocarPerfil(page, 'Lúcia Andrade Viana');
    expect(await abas(page)).toContain('Votação');
  });
});
