import pytest
from pydantic import ValidationError

from App.Modulo_Cursos.schemas.usuario_schema import BIGINT_MAX, UsuarioCreate


def _datos(**cambios) -> dict:
    base = {"tipo_registro": "usuario", "nombre": "Laura", "correo": "laura@test.com", "id_rol": 2}
    return {**base, **cambios}


@pytest.mark.parametrize(("campo", "limite"), [("nombre", 150), ("apellido", 150), ("direccion", 200)])
def test_usuario_create_acepta_el_largo_maximo_y_rechaza_uno_mas(campo, limite):
    UsuarioCreate(**_datos(**{campo: "a" * limite}))  # el límite exacto: no lanza

    with pytest.raises(ValidationError):
        UsuarioCreate(**_datos(**{campo: "a" * (limite + 1)}))


def test_usuario_create_acepta_un_correo_de_100_caracteres_y_rechaza_101():
    # 60 + "@" + 35 + ".com" = 100 caracteres
    UsuarioCreate(**_datos(correo="a" * 60 + "@" + "b" * 35 + ".com"))

    with pytest.raises(ValidationError):
        UsuarioCreate(**_datos(correo="a" * 61 + "@" + "b" * 35 + ".com"))


@pytest.mark.parametrize("campo", ["numero_identificacion", "nit", "telefono"])
def test_usuario_create_acepta_el_maximo_de_bigint_y_rechaza_uno_mas(campo):
    UsuarioCreate(**_datos(**{campo: BIGINT_MAX}))

    with pytest.raises(ValidationError):
        UsuarioCreate(**_datos(**{campo: BIGINT_MAX + 1}))