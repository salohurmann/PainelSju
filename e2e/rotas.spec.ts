import { expect, test } from '@playwright/test';
import { abrirComo } from './ajuda';

test('cada tela tem endereço próprio e o voltar do navegador funciona', async ({ page }) => {
  await abrirComo(page, 'Administrador SEJU', 'frota/aprovacoes');
  await expect(page.getByRole('tab', { name: /Aprovações/ })).toHaveAttribute('aria-selected', 'true');
  await expect(page).toHaveTitle(/Frotas/);

  await page.getByRole('navigation', { name: 'Módulos' }).getByRole('button', { name: /^Salas/ }).click();
  await expect(page).toHaveURL(/#\/salas$/);
  await page.goBack();
  await expect(page).toHaveURL(/#\/frota\/aprovacoes$/);
  await expect(page.getByRole('tab', { name: /Aprovações/ })).toHaveAttribute('aria-selected', 'true');
});

test('endereço antigo ?app= continua funcionando', async ({ page }) => {
  await abrirComo(page, 'Lúcia Andrade Viana');
  await page.goto('./?app=ramais');
  await expect(page).toHaveURL(/#\/ramais$/);
  await expect(page.getByRole('heading', { level: 1, name: /Ramais/ })).toBeVisible();
});

test('busca (Ctrl+K) leva para a tela escolhida', async ({ page }) => {
  await abrirComo(page, 'Lúcia Andrade Viana');
  await page.keyboard.press('Control+k');
  await page.getByRole('combobox').fill('reservar sala');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#\/salas$/);
});

test('tema escuro continua escolhido depois de recarregar', async ({ page }) => {
  await abrirComo(page, 'Lúcia Andrade Viana');
  await page.getByRole('button', { name: 'Usar tema escuro' }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect(page.getByRole('button', { name: 'Usar tema claro' })).toBeVisible();
});
