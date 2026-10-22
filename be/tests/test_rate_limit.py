from types import SimpleNamespace

import pytest

from App.Modulo_Cursos.utils import rate_limit
from App.Modulo_Cursos.utils.rate_limit import (
    MAX_INTENTOS,
    VENTANA_SEGUNDOS,
    limite_excedido,
    limpiar_intentos,
    registrar_intento_fallido,
)


@pytest.fixture(autouse=True)
def reloj(monkeypatch):
    """Reloj falso y estado limpio: cada test empieza desde cero (Isolated, Repeatable)."""
    estado = {"t": 1000.0}
    monkeypatch.setattr(rate_limit, "time", SimpleNamespace(monotonic=lambda: estado["t"]))
    rate_limit._intentos.clear()
    yield estado
    rate_limit._intentos.clear()


def _fallar(clave: str, veces: int) -> None:
    for _ in range(veces):
        registrar_intento_fallido(clave)


def test_limite_excedido_returns_false_when_attempts_are_below_the_maximum():
    # Arrange: un intento menos que el máximo
    _fallar("juan@correo.com", MAX_INTENTOS - 1)

    # Act
    resultado = limite_excedido("juan@correo.com")

    # Assert
    assert resultado is False


def test_limite_excedido_returns_true_when_attempts_reach_the_maximum():
    # Arrange: justo el máximo (el borde de la regla)
    _fallar("juan@correo.com", MAX_INTENTOS)

    # Act
    resultado = limite_excedido("juan@correo.com")

    # Assert
    assert resultado is True


@pytest.mark.parametrize(
    ("segundos", "esperado"),
    [
        (VENTANA_SEGUNDOS - 1, True),   # el intento todavía cuenta
        (VENTANA_SEGUNDOS, False),      # justo en el borde: ya no cuenta
        (VENTANA_SEGUNDOS + 1, False),  # ya venció
    ],
)
def test_limite_excedido_depends_on_the_time_window(reloj, segundos, esperado):
    # Arrange: el usuario agotó sus intentos
    _fallar("juan@correo.com", MAX_INTENTOS)

    # Act: pasa el tiempo
    reloj["t"] += segundos

    # Assert
    assert limite_excedido("juan@correo.com") is esperado


def test_limpiar_intentos_unblocks_the_user():
    _fallar("juan@correo.com", MAX_INTENTOS)

    limpiar_intentos("juan@correo.com")

    assert limite_excedido("juan@correo.com") is False


def test_limite_excedido_counts_each_key_separately():
    _fallar("juan@correo.com", MAX_INTENTOS)

    assert limite_excedido("laura@correo.com") is False