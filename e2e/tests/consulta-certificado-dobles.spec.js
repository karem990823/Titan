import { expect, test } from '@playwright/test';

// Semana 5: estados del backend difíciles de provocar con datos reales
// (caído, vacío, inválido), simulados con page.route — un doble de tipo
// STUB: siempre devuelve la misma respuesta fija, sin importar cuántas
// veces se llame ni con qué parámetros.

const RUTA_BUSQUEDA = '**/api/certificados/publico/buscar**';

test('debería mostrar un error cuando el backend de certificados está caído', async ({ page }) => {
  // Arrange: el backend responde 500 sin cuerpo JSON (como un proxy caído)
  await page.route(RUTA_BUSQUEDA, (route) =>
    route.fulfill({ status: 500, contentType: 'text/plain', body: 'Internal Server Error' })
  );
  await page.goto('/certificados');

  // Act
  await page.getByLabel('Tipo de documento').selectOption({ label: 'CC' });
  await page.getByLabel('Número de documento').fill('1091111111');
  await page.getByRole('button', { name: 'Buscar certificados' }).click();

  // Assert: estado de la UI, el aviso de error se muestra (no se cuelga ni se cae)
  await expect(page.getByRole('alert')).toContainText('Error 500');
  await expect(page.getByRole('list', { name: 'Certificados encontrados' })).toHaveCount(0);
});

test('debería mostrar la lista vacía cuando el backend responde sin certificados', async ({ page }) => {
  // Arrange: STUB que siempre responde datos vacíos, sin depender de qué
  // documento exista realmente en la base de datos de pruebas
  let urlRecibida = null;
  await page.route(RUTA_BUSQUEDA, (route) => {
    urlRecibida = route.request().url();
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'ok', data: [] }),
    });
  });
  await page.goto('/certificados');

  // Act
  await page.getByLabel('Tipo de documento').selectOption({ label: 'CC' });
  await page.getByLabel('Número de documento').fill('9999999999');
  await page.getByRole('button', { name: 'Buscar certificados' }).click();

  // Assert (comportamiento): la petición sí se hizo con el documento ingresado
  await expect(page.getByRole('status')).toContainText('No se encontraron certificados');
  expect(urlRecibida).toContain('numero_identificacion=9999999999');
});

test('debería mostrar el mensaje de error cuando la consulta es inválida', async ({ page }) => {
  // Arrange: el backend rechaza la consulta (p. ej. documento mal formado)
  await page.route(RUTA_BUSQUEDA, (route) =>
    route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ detail: 'Número de documento inválido' }),
    })
  );
  await page.goto('/certificados');

  // Act
  await page.getByLabel('Tipo de documento').selectOption({ label: 'CC' });
  await page.getByLabel('Número de documento').fill('1');
  await page.getByRole('button', { name: 'Buscar certificados' }).click();

  // Assert: estado de la UI, muestra exactamente el mensaje del backend
  await expect(page.getByRole('alert')).toHaveText('Número de documento inválido');
});
