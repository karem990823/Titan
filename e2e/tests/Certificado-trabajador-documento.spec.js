import { expect, test } from '@playwright/test';

test('should show the certificate of a worker searched by document', async ({ page }) => {
  // Arrange: abrir la consulta pública (sin login)
  await page.goto('/certificados');

  // Act: buscar a Juan Perez por tipo y número de documento
  await page.getByRole('combobox').selectOption({ label: 'CC' });
  await page.getByPlaceholder('Ej: 1234567890').fill('1091111111');
  await page.getByRole('button', { name: 'Buscar certificados' }).click();

  // Assert: aparece su certificado
  await expect(page.getByText('CERT-002')).toBeVisible();
  await expect(page.getByText('Trabajador Autorizado')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Descargar PDF' })).toBeVisible();
});