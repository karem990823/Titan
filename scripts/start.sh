#!/usr/bin/env bash
# ¿Qué? Script de arranque completo del proyecto TITAN.
# ¿Para qué? Levantar los 3 servicios (db, be, fe) con construcción de imágenes,
#            esperar sus healthchecks y reportar el estado final.
# ¿Impacto? Un único comando inicializa todo el entorno de desarrollo sin pasos manuales.
#
# Uso:
#   ./scripts/start.sh            # arranque normal
#   ./scripts/start.sh --no-build # omite --build (más rápido si no hay cambios en el código)

set -euo pipefail

# ─── Colores ────────────────────────────────────────────────────────────────
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
CYAN="\033[0;36m"
BOLD="\033[1m"
RESET="\033[0m"

# ─── Helpers ────────────────────────────────────────────────────────────────
info()    { echo -e "${CYAN}[INFO]${RESET}  $*"; }
success() { echo -e "${GREEN}[OK]${RESET}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${RESET}  $*"; }
error()   { echo -e "${RED}[ERROR]${RESET} $*" >&2; }
header()  { echo -e "\n${BOLD}${CYAN}$*${RESET}"; }

# ─── Directorio raíz del proyecto ───────────────────────────────────────────
# ¿Qué? Resuelve la ruta absoluta del directorio raíz sin importar desde dónde
#       se ejecute el script.
# ¿Para qué? docker compose necesita encontrar el docker-compose.yml.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${PROJECT_ROOT}"

# ─── Flags ──────────────────────────────────────────────────────────────────
BUILD_FLAG="--build"
if [[ "${1:-}" == "--no-build" ]]; then
  BUILD_FLAG=""
  warn "Modo --no-build: se usarán las imágenes existentes sin reconstruir."
fi

# ─── Verificar dependencias ──────────────────────────────────────────────────
header "Verificando dependencias..."
for cmd in docker; do
  if ! command -v "${cmd}" &>/dev/null; then
    error "Comando '${cmd}' no encontrado. Instálalo antes de continuar."
    exit 1
  fi
done

if ! docker info &>/dev/null; then
  error "Docker no está corriendo. Inicia Docker Desktop o el daemon y vuelve a intentarlo."
  exit 1
fi

success "Docker disponible."

# ─── Verificar / crear archivos de entorno ──────────────────────────────────
# ¿Qué? Si .env (raíz) o be/.env no existen, los crea automáticamente copiando
#       sus respectivos .env.example.
# ¿Para qué? docker-compose.yml lee ${DB_NAME}/${DB_USER}/... desde el .env de la
#            raíz, y el servicio "be" usa env_file: ./be/.env. Sin esos archivos
#            el comando falla antes de levantar cualquier contenedor.
# ¿Impacto? Los valores de los .env.example son consistentes entre sí (mismo
#           usuario/contraseña de MySQL) y seguros para desarrollo local, por lo
#           que el sistema arranca correctamente sin edición manual.
header "Verificando archivos de entorno..."

if [[ ! -f "${PROJECT_ROOT}/.env" ]]; then
  if [[ -f "${PROJECT_ROOT}/root.env.example" ]]; then
    cp "${PROJECT_ROOT}/root.env.example" "${PROJECT_ROOT}/.env"
    warn ".env (raíz) no existía — creado automáticamente desde root.env.example."
  else
    error "No se encontró .env ni root.env.example en la raíz. Créalo manualmente."
    exit 1
  fi
else
  success ".env (raíz) encontrado."
fi

if [[ ! -f "${PROJECT_ROOT}/be/.env" ]]; then
  if [[ -f "${PROJECT_ROOT}/be/.env.example" ]]; then
    cp "${PROJECT_ROOT}/be/.env.example" "${PROJECT_ROOT}/be/.env"
    # ¿Qué? be/.env.example trae un JWT_SECRET_KEY de ejemplo publicado en el
    #       repo. Si el arranque automatizado lo dejara tal cual, cualquiera que
    #       lea el código podría firmar un token de Administrador válido.
    # ¿Para qué? Generar un secreto real por instalación en cada arranque limpio.
    JWT_SECRET_GENERADO="$(openssl rand -hex 32)"
    sed -i.bak "s/^JWT_SECRET_KEY=.*/JWT_SECRET_KEY=${JWT_SECRET_GENERADO}/" "${PROJECT_ROOT}/be/.env"
    rm -f "${PROJECT_ROOT}/be/.env.bak"
    warn "be/.env no existía — creado automáticamente desde be/.env.example con un JWT_SECRET_KEY generado."
  else
    error "No se encontró be/.env ni be/.env.example. Crea be/.env manualmente."
    exit 1
  fi
else
  success "be/.env encontrado."
fi

# ─── Levantar servicios ──────────────────────────────────────────────────────
header "Levantando servicios..."
info "Ejecutando: docker compose up ${BUILD_FLAG} -d"
# shellcheck disable=SC2086
docker compose up ${BUILD_FLAG} -d

MAX_RETRIES=30
RETRY_INTERVAL=2

# ─── Esperar healthcheck de MySQL ───────────────────────────────────────────
header "Esperando MySQL (db)..."
# ¿Qué? Consulta el estado del healthcheck del contenedor titan_db hasta que sea
#       "healthy" o se agote el tiempo de espera.
# ¿Para qué? MySQL necesita unos segundos para inicializar (y ejecutar los scripts
#            de base/titan.sql y base/inserts.sql) antes de aceptar conexiones.
# ¿Impacto? Sin esta espera, el backend podría fallar al intentar crear las tablas.
attempt=0
until [[ "$(docker inspect --format='{{.State.Health.Status}}' titan_db 2>/dev/null)" == "healthy" ]]; do
  attempt=$(( attempt + 1 ))
  if (( attempt > MAX_RETRIES )); then
    error "MySQL no alcanzó estado 'healthy' después de $(( MAX_RETRIES * RETRY_INTERVAL ))s."
    error "Revisa los logs: docker compose logs db"
    exit 1
  fi
  info "Esperando que db sea healthy... (intento ${attempt}/${MAX_RETRIES})"
  sleep "${RETRY_INTERVAL}"
done
success "MySQL está healthy."

# ─── Esperar que el backend responda ────────────────────────────────────────
header "Esperando Backend FastAPI (be)..."
# ¿Qué? Hace polling a la raíz de la API hasta recibir HTTP 200.
# ¿Para qué? Confirmar que FastAPI arrancó y logró conectarse a la base de datos.
# ¿Impacto? Si falla, muestra los logs para facilitar el diagnóstico.
BE_URL="http://localhost:8000/"
attempt=0

until curl -sf "${BE_URL}" &>/dev/null; do
  attempt=$(( attempt + 1 ))
  if (( attempt > MAX_RETRIES )); then
    error "El backend no respondió en ${BE_URL} después de $(( MAX_RETRIES * RETRY_INTERVAL ))s."
    error "Revisa los logs: docker compose logs be"
    exit 1
  fi
  info "Esperando que be responda en ${BE_URL}... (intento ${attempt}/${MAX_RETRIES})"
  sleep "${RETRY_INTERVAL}"
done
success "Backend respondiendo en ${BE_URL}."

# ─── Esperar que el frontend responda ───────────────────────────────────────
header "Esperando Frontend React/Nginx (fe)..."
FE_URL="http://localhost:5173"
attempt=0

until curl -sf "${FE_URL}" &>/dev/null; do
  attempt=$(( attempt + 1 ))
  if (( attempt > MAX_RETRIES )); then
    error "El frontend no respondió en ${FE_URL} después de $(( MAX_RETRIES * RETRY_INTERVAL ))s."
    error "Revisa los logs: docker compose logs fe"
    exit 1
  fi
  info "Esperando que fe responda en ${FE_URL}... (intento ${attempt}/${MAX_RETRIES})"
  sleep "${RETRY_INTERVAL}"
done
success "Frontend respondiendo en ${FE_URL}."

# ─── Resumen final ──────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}╔══════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${GREEN}║          TITAN — TODOS LOS SERVICIOS OK              ║${RESET}"
echo -e "${BOLD}${GREEN}╚══════════════════════════════════════════════════════╝${RESET}"
echo ""
echo -e "  ${CYAN}Frontend${RESET}    →  http://localhost:5173"
echo -e "  ${CYAN}Backend API${RESET} →  http://localhost:8000"
echo -e "  ${CYAN}Swagger UI${RESET}  →  http://localhost:8000/docs"
echo -e "  ${CYAN}MySQL${RESET}       →  localhost:3306"
echo ""
echo -e "  Para detener todo: ${BOLD}./scripts/stop.sh${RESET}"
echo ""
