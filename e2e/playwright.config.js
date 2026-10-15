import { defineConfig, devices } from '@playwright/test';

// Puerto del frontend. Cámbialo con FRONT_PORT si el 5173 ya está ocupado
// (por ejemplo, si tienes el stack de Docker corriendo: su "fe" usa el 5173).
const port = Number(process.env.FRONT_PORT ?? 5173);

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: `http://localhost:${port}`,
    // Guarda la traza solo cuando un test falla y se reintenta: se abre con "pnpm report"
    trace: 'on-first-retry',
    // Opcional: usar un Chromium ya instalado en vez del que descarga Playwright.
    launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
  },
  // Lista en la terminal + reporte HTML que abres cuando quieras con "pnpm report"
  reporter: [['list'], ['html', { open: 'never' }]],
  retries: process.env.CI ? 1 : 0,
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Playwright levanta el frontend con Vite (modo dev), que redirige /api al
  // backend en http://localhost:8000 (ver fe/frontend-titan/vite.config.ts).
  // La BD y el backend los levantas tú antes (ver e2e/README.md).
  // Se lanza vite con node, sin pnpm de por medio, para que Playwright pueda
  // detenerlo al terminar.
  webServer: {
    command: `node node_modules/vite/bin/vite.js --port ${port} --strictPort`,
    cwd: '../fe/frontend-titan',
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
  },
});
