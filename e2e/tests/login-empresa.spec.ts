import { test, expect } from '@playwright/test';

test('la empresa inicia sesión y llega a su panel', async ({ page }) => {
  // Arrange: abrir la página pública
  await page.goto('/');

  // Act: ir al login y entrar con la empresa de prueba
  await page.getByRole('link', { name: 'Iniciar Sesión' }).click();
  await page.getByRole('textbox', { name: 'Correo Electrónico' }).fill('contacto@constructora-andina.com');
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('empresa123');
  await page.getByRole('textbox', { name: 'Contraseña' }).press('Enter');

  // Assert: llegó al panel de la empresa
  await expect(page).toHaveURL(/\/empresa\/trabajadores/);
  await expect(page.getByRole('heading', { name: 'Mis trabajadores' })).toBeVisible();
  await expect(page.getByText('Constructora Andina SAS')).toBeVisible();
});