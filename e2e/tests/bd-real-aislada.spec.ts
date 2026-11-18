import { expect, test, type Page } from '@playwright/test';

// Datos únicos por test: no dependen de lo que dejó otra corrida
const unico = () => String(Date.now() * 10 + Math.floor(Math.random() * 10));

async function entrarComoEmpresa(page: Page) {
  await page.goto('/login');
  await page.locator('#login-email').fill('contacto@constructora-andina.com');
  await page.locator('#login-password').fill('empresa123');
  await page.getByRole('button', { name: 'Ingresar al sistema' }).click();
  await expect(page).toHaveURL(/empresa\/trabajadores/);
}

async function llenarTrabajador(page: Page, nombre: string, documento: string) {
  await page.locator('label:has-text("Nombre") + input').fill(nombre);
  await page.locator('label:has-text("Apellido") + input').fill('Prueba');
  await page.locator('label:has-text("Tipo de documento") + select').selectOption({ label: 'CC' });
  await page.locator('label:has-text("Número de documento") + input').fill(documento);
}

test('un trabajador registrado queda guardado en la BD real y no tiene certificados', async ({ page }) => {
  // Arrange
  const nombre = `Persist${unico()}`;
  const documento = unico();
  await entrarComoEmpresa(page);

  // Act: registrar por la UI y recargar la página (lee de la BD, no de la memoria)
  await llenarTrabajador(page, nombre, documento);
  await page.getByRole('button', { name: 'Registrar trabajador' }).click();
  await expect(page.getByText(`Trabajador ${nombre} registrado correctamente.`)).toBeVisible();
  await page.reload();

  // Assert 1: sigue en la lista después de recargar
  await expect(page.getByRole('table')).toContainText(nombre);

  // Assert 2: la consulta pública no le encuentra certificados
  await page.goto('/certificados');
  await expect(page.getByRole('option', { name: 'CC', exact: true })).toBeAttached();
  await page.getByLabel('Tipo de documento').selectOption('CC');
  await page.getByLabel('Número de documento').fill(documento);
  await page.getByRole('button', { name: /buscar certificados/i }).click();
  await expect(page.getByText('No se encontraron certificados para ese documento.')).toBeVisible();
});

// HALLAZGO: ni la BD (sin UNIQUE en numero_identificacion) ni el API validan documentos repetidos.
// test.fail() = se espera que falle; cuando se corrija la regla, este test avisará para quitar la marca.
test.fail('HALLAZGO: un documento repetido debería rechazarse con 4xx', async ({ page }) => {
  // Arrange: el primero se registra bien
  const documento = unico();
  const primero = `Primero${unico()}`;
  const segundo = `Segundo${unico()}`;
  await entrarComoEmpresa(page);
  await llenarTrabajador(page, primero, documento);
  await page.getByRole('button', { name: 'Registrar trabajador' }).click();
  await expect(page.getByText(`Trabajador ${primero} registrado correctamente.`)).toBeVisible();

  // Act: el segundo usa el mismo documento (la BD tiene la restricción)
  await llenarTrabajador(page, segundo, documento);
  const [respuesta] = await Promise.all([
    page.waitForResponse((r) => r.request().method() === 'POST' && r.url().includes('/trabajadores')),
    page.getByRole('button', { name: 'Registrar trabajador' }).click(),
  ]);

  // Assert: error del cliente (4xx), nunca 500, y el segundo no aparece en la lista
  expect(respuesta.status()).toBeGreaterThanOrEqual(400);
  expect(respuesta.status()).toBeLessThan(500);
  await expect(page.getByRole('table')).not.toContainText(segundo);
  await expect(page.getByRole('table')).toContainText(primero);
});

test('con contraseña incorrecta no entra al panel y no guarda sesión', async ({ page }) => {
  // Arrange
  await page.goto('/login');

  // Act
  await page.locator('#login-email').fill('contacto@constructora-andina.com');
  await page.locator('#login-password').fill('clave-incorrecta-999');
  await page.getByRole('button', { name: 'Ingresar al sistema' }).click();

  // Assert: sigue en el login, el botón vuelve a estar disponible y no hay token guardado
  await expect(page.getByRole('button', { name: 'Ingresar al sistema' })).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
  expect(await page.evaluate(() => localStorage.getItem('titan_token'))).toBeNull();
});
