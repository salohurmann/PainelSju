import { expect, type Page } from '@playwright/test';

/** Abre o Painel do zero (sem dados salvos) e entra com um perfil da demonstração. */
export async function abrirComo(page: Page, perfil: string, rota = '') {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await trocarPerfil(page, perfil);
  if (rota) await page.goto('./#/' + rota);
}

export async function trocarPerfil(page: Page, perfil: string) {
  await page.getByRole('button', { name: /Abrir menu da conta/ }).click();
  await page.getByText('Perfis da demonstração').locator('..').getByRole('button', { name: new RegExp(perfil) }).click();
  await expect(page.getByRole('button', { name: new RegExp(`${perfil.replace(/^(Dra?|Sra?)\.\s+/, '').split(' ')[0]}.*Abrir menu da conta`) })).toBeVisible();
}

/** Nomes das abas visíveis na barra do topo. */
export async function abas(page: Page) {
  const nav = page.getByRole('navigation', { name: 'Módulos' });
  const textos = await nav.getByRole('button').allInnerTexts();
  return textos.map(t => t.split('\n')[0].trim());
}
