import { expect, test } from '@playwright/test';

// Flujo crítico: HU 11 — si el documento no tiene certificados, la persona
// debe recibir un mensaje claro (no una pantalla vacía ni un error).
test('should tell the user when a document has no certificates', async ({ page }) => {
  // Arrange: un número que no existe en los datos semilla
  await page.goto('/certificados');

  // Act
  await page.getByLabel('Tipo de documento').selectOption({ label: 'CC' });
  await page.getByLabel('Número de documento').fill('1000000001');
  await page.getByRole('button', { name: 'Buscar certificados' }).click();

  // Assert
  await expect(page.getByRole('status')).toHaveText('No se encontraron certificados para ese documento.');
  await expect(page.getByRole('list', { name: 'Certificados encontrados' })).toHaveCount(0);
});
