import { expect, test } from '@playwright/test';

// Flujo crítico: HU 11 — Consulta de certificados por participante (página pública).
// Es la única pantalla sin login: la usan trabajadores y empresas que validan certificados.
test('should list the certificate of a worker searched by document', async ({ page }) => {
  // Arrange: Juan Perez (CC 1091111111) tiene el certificado CERT-002 en base/inserts.sql
  await page.goto('/certificados');

  // Act
  await page.getByLabel('Tipo de documento').selectOption({ label: 'CC' });
  await page.getByLabel('Número de documento').fill('1091111111');
  await page.getByRole('button', { name: 'Buscar certificados' }).click();

  // Assert
  const resultados = page.getByRole('list', { name: 'Certificados encontrados' });
  await expect(resultados).toContainText('Trabajador Autorizado');
  await expect(resultados).toContainText('CERT-002');
  await expect(resultados.getByRole('button', { name: 'Descargar PDF' })).toBeVisible();
});
