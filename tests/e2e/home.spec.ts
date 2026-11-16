import { expect, test } from '@playwright/test';

test('home page renders the pitch and the menu', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vai alagar na minha rua?');
  await expect(page.getByRole('navigation', { name: 'Principal' }).getByRole('link')).toHaveCount(5);
});

test('sign-up form shows inline errors instead of an alert', async ({ page }) => {
  await page.goto('/#/alertas');
  await page.getByRole('button', { name: 'Quero receber alertas' }).click();
  await expect(page.getByText('Informe um e-mail válido.')).toBeVisible();
});
