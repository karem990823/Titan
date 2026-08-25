from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from App.Modulo_Cursos.models.usuario_model import Usuario
from App.Modulo_Cursos.utils.response import api_response
from App.Modulo_Cursos.utils.security import create_access_token, verify_password

# Roles que pueden iniciar sesión en el sistema. "Participante" existe en la
# tabla roles solo para categorizar trabajadores/estudiantes en reportes: nunca
# reciben credenciales, así que se rechazan explícitamente aquí.
ROLES_CON_ACCESO = {"Administrador", "Instructor", "Empresa"}


def _credenciales_invalidas() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=api_response(
            success=False,
            message="No se pudo iniciar sesión",
            error="Correo o contraseña incorrectos"
        )
    )


def _serializar_usuario(usuario: Usuario) -> dict:
    return {
        "id_usuario": usuario.id_usuario,
        "nombre": usuario.nombre,
        "apellido": usuario.apellido,
        "correo": usuario.correo,
        "tipo_registro": usuario.tipo_registro,
        "id_rol": usuario.id_rol,
        "rol_nombre": usuario.rol.nombre_rol if usuario.rol else None,
        "id_empresa": usuario.id_empresa,
    }


def login(db: Session, data) -> dict:
    usuario = db.query(Usuario).options(
        joinedload(Usuario.rol)
    ).filter(Usuario.correo == data.correo).first()

    if not usuario or not usuario.password_hash:
        raise _credenciales_invalidas()

    if not verify_password(data.password, usuario.password_hash):
        raise _credenciales_invalidas()

    rol_nombre = usuario.rol.nombre_rol if usuario.rol else None

    if rol_nombre not in ROLES_CON_ACCESO:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=api_response(
                success=False,
                message="Acceso no disponible",
                error=(
                    "Los participantes no tienen acceso al sistema. "
                    "Usa la página principal para descargar tu certificado."
                )
            )
        )

    if not usuario.estado_activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=api_response(
                success=False,
                message="Cuenta inactiva",
                error="Tu cuenta está desactivada. Contacta al administrador."
            )
        )

    token = create_access_token(data={"sub": str(usuario.id_usuario), "rol": rol_nombre})

    return api_response(
        success=True,
        message="Inicio de sesión exitoso",
        data={
            "access_token": token,
            "token_type": "bearer",
            "usuario": _serializar_usuario(usuario),
        }
    )


def get_me(current_user: Usuario) -> dict:
    return api_response(
        success=True,
        message="Usuario autenticado",
        data=_serializar_usuario(current_user)
    )
