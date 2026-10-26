import pytest
from pydantic import ValidationError

from App.Modulo_Cursos.schemas.usuario_schema import UsuarioCreate


def _datos(**overrides) -> dict:
    base = {
        "tipo_registro": "empresa",
        "nombre": "Constructora Andina",
        "correo": "contacto@andina.com",
        "id_rol": 4,
    }
    base.update(overrides)
    return base


def test_empresa_con_nit_es_valida():
    # Arrange / Act: una empresa real solo necesita su NIT
    usuario = UsuarioCreate(**_datos(nit=900123456))

    # Assert
    assert usuario.nit == 900123456


def test_empresa_independiente_con_documento_es_valida():
    # Arrange / Act: un independiente no tiene NIT, pero sí documento completo
    usuario = UsuarioCreate(**_datos(id_tipo=1, numero_identificacion=1091111111))

    # Assert
    assert usuario.numero_identificacion == 1091111111


def test_empresa_sin_nit_ni_documento_es_invalida():
    # Arrange: no hay ninguna identificación
    datos = _datos()

    # Act / Assert
    with pytest.raises(ValidationError, match="NIT"):
        UsuarioCreate(**datos)


@pytest.mark.parametrize(
    "overrides",
    [
        {"id_tipo": 1},  # tipo de documento sin número: documento incompleto
        {"numero_identificacion": 1091111111},  # número sin tipo: documento incompleto
    ],
)
def test_empresa_con_documento_incompleto_es_invalida(overrides):
    # Arrange: el borde de la regla, falta una mitad del documento
    datos = _datos(**overrides)

    # Act / Assert
    with pytest.raises(ValidationError, match="NIT"):
        UsuarioCreate(**datos)


@pytest.mark.parametrize("tipo_registro", ["trabajador", "usuario"])
def test_tipos_distintos_de_empresa_no_requieren_identificacion(tipo_registro):
    # Arrange / Act: la regla de NIT/documento es exclusiva de "empresa"
    usuario = UsuarioCreate(**_datos(tipo_registro=tipo_registro))

    # Assert
    assert usuario.nit is None
    assert usuario.numero_identificacion is None
