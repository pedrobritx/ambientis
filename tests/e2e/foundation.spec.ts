import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("catalogue checkboxes align with titles and secondary actions look interactive on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 530, height: 932 });
  await page.goto('/#trabalho/industry-job/requisitos');
  await page.getByRole('button', { name: 'Adicionar requisito', exact: true }).click();
  const bounds = await page.locator('fieldset.choice-list .checkbox-line').first().evaluate(label => {
    const checkbox = label.querySelector('input')!.getBoundingClientRect();
    const title = label.querySelector('strong')!.getBoundingClientRect();
    return { x: checkbox.right <= title.left, y: Math.abs(checkbox.top-title.top) };
  });
  expect(bounds.x).toBe(true); expect(bounds.y).toBeLessThan(12);
  await page.getByRole('dialog').press('Escape');
  await page.getByRole('button', { name: /Identificação e documentos da unidade/ }).click();
  const style = await page.getByRole('button', { name: 'Editar requisito', exact: true }).evaluate(button => {
    const s = getComputedStyle(button); return { border: parseFloat(s.borderTopWidth), background: s.backgroundColor, padding: parseFloat(s.paddingLeft) };
  });
  expect(style.border).toBeGreaterThanOrEqual(1); expect(style.padding).toBeGreaterThan(10); expect(style.background).not.toBe('rgba(0, 0, 0, 0)');
});
test("connection screen keeps demo drafts separate and APIs reject unauthenticated access", async ({page, request}) => {
  await page.goto('/conexao');
  await expect(page.getByRole('heading', {name:'Conexão da equipe'})).toBeVisible();
  await expect(page.getByText('Primeira conexão em avaliação.', {exact:false})).toBeVisible();
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
  const response = await request.get('/api/v1/companies');
  expect(response.status()).toBe(401);
  expect(response.headers()['cache-control']).toContain('no-store');
  expect((await request.get('/api/v1/audit_events')).status()).toBe(404);
});
