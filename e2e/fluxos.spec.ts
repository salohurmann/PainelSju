import { expect, test } from '@playwright/test';
import { abrirComo, trocarPerfil } from './ajuda';

test('pedido de veículo: servidora pede, chefia autoriza @celular', async ({ page }) => {
  await abrirComo(page, 'Lúcia Andrade Viana', 'frota/nova-solicitacao');
  await page.locator('#ns-tel').fill('41999990000');
  await page.locator('button[aria-pressed]').first().click(); // primeiro veículo
  await page.locator('button[aria-label^="Dia "]:not([disabled])').nth(3).click();
  await page.getByRole('button', { name: /Dia todo/ }).click();
  await page.getByRole('button', { name: /^Londrina/ }).click();
  await page.locator('#ns-destino').fill('Londrina/PR — reunião com a equipe regional.');
  await page.getByRole('button', { name: 'Enviar para a chefia' }).click();
  await expect(page.getByRole('heading', { name: 'Pedido enviado.' })).toBeVisible();
  const protocolo = (await page.getByRole('dialog').locator('strong').first().innerText()).trim();
  expect(protocolo).toMatch(/^AG-/);
  await page.getByRole('button', { name: 'Pronto' }).click();

  await trocarPerfil(page, 'Dra. Maria Helena');
  await page.goto('./#/frota/aprovacoes');
  const pedido = page.getByRole('listitem').filter({ hasText: protocolo });
  await pedido.getByRole('button', { name: 'Autorizar', exact: true }).click();
  await page.getByRole('tab', { name: /Autorizados/ }).click();
  await expect(page.getByRole('listitem').filter({ hasText: protocolo }).getByText(/Autorizado por/)).toBeVisible();
});

test('votação: entidade vota uma vez só @celular', async ({ page }) => {
  await abrirComo(page, 'Rosana Telles');
  await page.getByRole('button', { name: 'Votar' }).first().click();
  const opcoes = page.getByRole('checkbox');
  for (let i = 0; i < 3; i++) await opcoes.nth(i).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'Confirmar voto' }).click();
  await expect(page.getByText(/Voto registrado/).first()).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Votar' })).toHaveCount(0);
});

test('janela fecha com Esc e devolve o foco', async ({ page }) => {
  await abrirComo(page, 'Lúcia Andrade Viana');
  const busca = page.getByRole('button', { name: /Buscar/ }).first();
  await busca.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(busca).toBeFocused();
});
