import { expect, test } from '@playwright/test';
import { MisTrabajadoresPage } from '../pages/MisTrabajadoresPage.js';

const API_URL = process.env.API_URL ?? 'http://localhost:8000';

// Sesión de la empresa preparada por API en global-setup.js
test.use({ storageState: '.auth/empresa.json' });

// Únicos aunque corran en paralelo (--repeat-each): 13 dígitos de Date.now() + 3 al azar
const unico = () => `${Date.now()}${Math.floor(Math.random() * 1000)}`;

test('registra un trabajador nuevo y aparece en la tabla', async ({ page }) => {
  const nombre = `E2E${unico()}`;
  const trabajadores = new MisTrabajadoresPage(page);

  await trabajadores.abrir();
  await trabajadores.registrar({ nombre, documento: unico() });

  await expect(page.getByText(`Trabajador ${nombre} registrado correctamente.`)).toBeVisible();
  await expect(page.getByRole('table')).toContainText(nombre);
});

test('muestra un error al registrar un documento que ya existe', async ({ page, playwright }) => {
  const documento = unico();
  const trabajadores = new MisTrabajadoresPage(page);
  await trabajadores.abrir();

  // Dato preparado por API, no por la UI: ya existe un trabajador con ese documento
  const token = await page.evaluate(() => localStorage.getItem('titan_token'));
  const api = await playwright.request.newContext({
    baseURL: API_URL,
    extraHTTPHeaders: { Authorization: `Bearer ${token}` },
  });
  await api.post('/api/usuarios/trabajadores', {
    data: { nombre: 'Existente', apellido: 'Previo', id_tipo: 1, numero_identificacion: Number(documento) },
  });
  await api.dispose();

  await trabajadores.registrar({ nombre: `Duplicado${unico()}`, documento });

  await expect(page.getByText('Ya existe un trabajador registrado con ese documento')).toBeVisible();
});

test('un doble clic en Registrar envía una sola petición', async ({ page }) => {
  let envios = 0;
  await page.route('**/api/usuarios/trabajadores', async (route) => {
    if (route.request().method() === 'POST') {
      envios += 1;
      await new Promise((resolver) => setTimeout(resolver, 1000)); // respuesta lenta a propósito
    }
    await route.continue();
  });
  const trabajadores = new MisTrabajadoresPage(page);

  await trabajadores.abrir();
  await trabajadores.llenar({ nombre: `Doble${unico()}`, documento: unico() });
  await page.getByRole('button', { name: 'Registrar trabajador' }).dblclick();

  await expect(page.getByText(/registrado correctamente/)).toBeVisible();
  expect(envios).toBe(1);
});