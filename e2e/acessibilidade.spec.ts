import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { abrirComo } from './ajuda';

/** Telas varridas pelo axe (WCAG 2.1 A e AA), no tema claro e no escuro. */
const TELAS = ['', 'frota/nova-solicitacao', 'frota/aprovacoes', 'frota/checkin-checkout', 'frota/frota', 'frota/consultar', 'chamados', 'salas', 'diarias', 'cense', 'ramais', 'votacao', 'votacao/entidades', 'admin/pessoas', 'admin/modulos', 'admin/papeis', 'auditoria'];

async function varrer(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  return r.violations.map(v => ({
    regra: v.id,
    impacto: v.impact,
    quantos: v.nodes.length,
    exemplo: v.nodes[0]?.target.join(' ') + ' :: ' + (v.nodes[0]?.failureSummary ?? '').split('\n')[1]?.trim(),
  }));
}

for (const tema of ['claro', 'escuro'] as const) {
  test(`acessibilidade de todas as telas (tema ${tema})`, async ({ page }) => {
    test.setTimeout(120_000);
    await abrirComo(page, 'Administrador SEJU');
    if (tema === 'escuro') await page.getByRole('button', { name: /tema escuro|modo escuro/i }).click();
    const problemas: Record<string, unknown> = {};
    for (const tela of TELAS) {
      await page.goto('./#/' + tela);
      await page.locator('main h1').first().waitFor();
      await page.waitForTimeout(250); // animações de entrada
      const v = await varrer(page);
      if (v.length) problemas[tela || 'mesa'] = v;
    }
    expect(problemas, JSON.stringify(problemas, null, 2)).toEqual({});
  });
}
