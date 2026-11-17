import { mkdirSync, writeFileSync } from 'node:fs';
import { request } from '@playwright/test';

const API_URL = process.env.API_URL ?? 'http://localhost:8000';

// Inicia sesión UNA vez por API y deja el token donde la app lo busca (localStorage).
export default async function globalSetup(config) {
  const baseURL = config.projects[0].use.baseURL;
  const api = await request.newContext({ baseURL: API_URL });
  const res = await api.post('/api/auth/login', {
    // Credenciales de la semilla (base/inserts.sql)
    data: { correo: 'contacto@constructora-andina.com', password: 'empresa123' },
  });
  const token = (await res.json()).data.access_token;
  await api.dispose();

  mkdirSync('.auth', { recursive: true });
  writeFileSync(
    '.auth/empresa.json',
    JSON.stringify({
      cookies: [],
      origins: [{ origin: baseURL, localStorage: [{ name: 'titan_token', value: token }] }],
    }),
  );
}