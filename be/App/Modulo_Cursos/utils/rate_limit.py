import time
from collections import defaultdict
from threading import Lock

# Limitador en memoria (proceso único, sin dependencias nuevas). Suficiente
# para el alcance formativo del proyecto: si se despliega con varios workers
# o réplicas, cada uno lleva su propio conteo.
MAX_INTENTOS = 5
VENTANA_SEGUNDOS = 15 * 60

_intentos: dict[str, list[float]] = defaultdict(list)
_lock = Lock()


def registrar_intento_fallido(clave: str) -> None:
    with _lock:
        _intentos[clave].append(time.monotonic())


def limite_excedido(clave: str) -> bool:
    ahora = time.monotonic()
    with _lock:
        recientes = [t for t in _intentos[clave] if ahora - t < VENTANA_SEGUNDOS]
        _intentos[clave] = recientes
        return len(recientes) >= MAX_INTENTOS


def limpiar_intentos(clave: str) -> None:
    with _lock:
        _intentos.pop(clave, None)
