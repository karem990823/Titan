import { expect, test } from '@playwright/test';

test('should show the new worker in the list after registering', async ({ page }) => {
  // Arrange: entrar como empresa y abrir "Mis trabajadores"
  const nombre = `Test${Date.now()}`;
  const documento = String(Date.now());

  await page.goto('/login');
  await page.locator('#login-email').fill('contacto@constructora-andina.com');
  await page.locator('#login-password').fill('empresa123');
  await page.getByRole('button', { name: 'Ingresar al sistema' }).click();
  await expect(page).toHaveURL(/empresa\/trabajadores/);

  // Act: llenar el formulario y registrar al trabajador
  await page.locator('label:has-text("Nombre") + input').fill(nombre);
  await page.locator('label:has-text("Apellido") + input').fill('Prueba');
  await page.locator('label:has-text("Tipo de documento") + select').selectOption({ label: 'CC' });
  await page.locator('label:has-text("Número de documento") + input').fill(documento);
  await page.getByRole('button', { name: 'Registrar trabajador' }).click();

  // Assert: aparece el aviso de éxito y la fila en la tabla
  await expect(page.getByText(`Trabajador ${nombre} registrado correctamente.`)).toBeVisible();
  await expect(page.getByRole('table')).toContainText(nombre);
});