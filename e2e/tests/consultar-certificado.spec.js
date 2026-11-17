import { expect, test } from '@playwright/test';
import { ConsultaCertificadoPage } from '../pages/ConsultaCertificadoPage.js';

// Juan Perez (CC 1091111111) y su certificado CERT-002 vienen de base/inserts.sql, que se carga
// en la BD de pruebas del E2E. Crear un certificado por API exige todo el flujo de evaluación,
// por eso este único dato sale de la semilla (queda anotado en el PR).
const DOCUMENTO_CON_CERTIFICADO = '1091111111';

test('lista el certificado de un trabajador y permite descargar el PDF', async ({ page }) => {
  const consulta = new ConsultaCertificadoPage(page);
  await consulta.abrir();

  await consulta.buscar({ numero: DOCUMENTO_CON_CERTIFICADO });

  const resultados = page.getByRole('list', { name: 'Certificados encontrados' });
  await expect(resultados).toContainText('Trabajador Autorizado');
  await expect(resultados).toContainText('CERT-002');

  const descarga = page.waitForEvent('download');
  await resultados.getByRole('button', { name: 'Descargar PDF' }).click();
  expect((await descarga).suggestedFilename()).toMatch(/^certificado-.*\.pdf$/);
});

test('avisa cuando el documento no tiene certificados', async ({ page }) => {
  const consulta = new ConsultaCertificadoPage(page);
  await consulta.abrir();

  // Documento único: no existe en la BD, así que no depende de datos previos
  await consulta.buscar({ numero: `9${Date.now()}` });

  await expect(page.getByText('No se encontraron certificados para ese documento.')).toBeVisible();
});

test('un doble clic en Buscar envía una sola consulta', async ({ page }) => {
  let consultas = 0;
  await page.route(/\/publico\/buscar/, async (route) => {
    consultas += 1;
    await new Promise((resolver) => setTimeout(resolver, 1000)); // respuesta lenta a propósito
    await route.continue();
  });
  const consulta = new ConsultaCertificadoPage(page);
  await consulta.abrir();

  await consulta.llenar({ numero: DOCUMENTO_CON_CERTIFICADO });
  await page.getByRole('button', { name: 'Buscar certificados' }).dblclick();

  await expect(page.getByText('CERT-002')).toBeVisible();
  expect(consultas).toBe(1);
});