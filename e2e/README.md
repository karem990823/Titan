# Pruebas E2E de TITAN (Playwright)

Semana 1 del Bootcamp Testing ADSO. Cada test recorre un flujo crítico de TITAN en un navegador real, igual que lo haría una persona usuaria.

## Cómo correrlas

Playwright levanta el **frontend** solo (Vite en el puerto 5173, con proxy de `/api` al backend). La **BD** y el **backend** los levantas tú antes.

```bash
# 1. BD (con datos semilla) + backend en Docker. NO levantes "fe": usaría el puerto 5173.
docker compose up -d --build db be

# 2. Dependencias del frontend (una vez)
cd fe/frontend-titan && pnpm install

# 3. Playwright y su navegador (una vez por equipo, ~110 MB)
cd ../../e2e
pnpm install
pnpm exec playwright install chromium

# 4. Correr la suite
pnpm test            # en la terminal
pnpm test:headed     # viendo el navegador
pnpm test:ui         # modo interactivo, paso a paso
pnpm report          # reporte HTML de la última corrida
pnpm codegen         # grabar un flujo nuevo (con "pnpm dev" del frontend corriendo)
```

Si ya tienes el stack completo con `./scripts/start.sh`, detén el frontend (`docker compose stop fe`) o usa otro puerto: `FRONT_PORT=5199 pnpm test`.

> ⚠️ Los tests usan las credenciales y datos de `base/inserts.sql`. No los corras contra una BD con datos reales.

## Los tests

Cada integrante del grupo agrega aquí el suyo (ver `docs/matriz-rotacion.md`). Por ahora:

| Test | Flujo | Arrange | Act | Assert | ¿Qué cambio lo rompe? |
|---|---|---|---|---|---|
| `consulta-certificado.spec.js` | Consulta pública con certificado | Ir a `/certificados` | Tipo CC, número 1091111111, clic en *Buscar* | La lista muestra *Trabajador Autorizado*, *CERT-002* y el botón *Descargar PDF* | Romper la búsqueda `/publico/buscar` o el filtro por tipo de documento |
| `consulta-sin-resultados.spec.js` | Consulta pública sin certificados | Ir a `/certificados` | Tipo CC, número inexistente, clic en *Buscar* | Mensaje *"No se encontraron certificados…"* y ninguna lista | Que la búsqueda devuelva certificados de otra persona, o quitar el mensaje |

**¿Por qué datos únicos?** La BD conserva los datos entre corridas. Los tests de consulta solo leen datos semilla existentes, así que no les hace falta.

**¿Por qué `getByLabel` y `getByRole`?** Buscan los elementos como los percibe la persona usuaria (por su etiqueta o su rol), no por clases CSS que cambian con el diseño. Tampoco hay `waitForTimeout`: cada `expect` reintenta solo hasta 5 segundos.

## Hallazgos de la semana 1

1. **Accesibilidad: las etiquetas de la consulta pública de certificados no estaban asociadas a sus campos.** `features/publico/ConsultaCertificado.tsx` tenía `<label>` sin `htmlFor`, así que ni los lectores de pantalla ni `getByLabel` encontraban el tipo o número de documento. Se asoció cada label con su control por `id`.
2. **Accesibilidad: el resultado de la consulta no se anunciaba ni tenía estructura semántica.** El aviso de "sin resultados" no tenía `role="status"`, y la lista de certificados encontrados era un `<div>` sin rol ni nombre accesible. Ahora el aviso lleva `role="status"` y los resultados son una `<ul aria-label="Certificados encontrados">`.
