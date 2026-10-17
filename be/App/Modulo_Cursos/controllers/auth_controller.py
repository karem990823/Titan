from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from App.Modulo_Cursos.models.usuario_model import Usuario
from App.Modulo_Cursos.utils.email import enviar_correo_restablecer_password
from App.Modulo_Cursos.utils.password_reset import consumir_token, generar_enlace_password
from App.Modulo_Cursos.utils.rate_limit import (
    limite_excedido,
    limpiar_intentos,
    registrar_intento_fallido,
)
from App.Modulo_Cursos.utils.response import api_response
from App.Modulo_Cursos.utils.security import create_access_token, hash_password, verify_password

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


def _limite_excedido() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail=api_response(
            success=False,
            message="Demasiados intentos",
            error="Espera unos minutos antes de volver a intentar iniciar sesión"
        )
    )


def login(db: Session, data, ip: str = "desconocida") -> dict:
    clave_intentos = f"{ip}:{data.correo.lower()}"

    if limite_excedido(clave_intentos):
        raise _limite_excedido()

    usuario = db.query(Usuario).options(
        joinedload(Usuario.rol)
    ).filter(Usuario.correo == data.correo).first()

    if not usuario or not usuario.password_hash:
        registrar_intento_fallido(clave_intentos)
        raise _credenciales_invalidas()

    if not verify_password(data.password, usuario.password_hash):
        registrar_intento_fallido(clave_intentos)
        raise _credenciales_invalidas()

    limpiar_intentos(clave_intentos)

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


_RESPUESTA_GENERICA_OLVIDE = api_response(
    success=True,
    message="Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña.",
    data=None
)


def olvide_password(db: Session, data, ip: str = "desconocida") -> dict:
    # Misma respuesta exista o no la cuenta, y con límite de intentos por
    # IP+correo: así nadie puede usar este endpoint para averiguar qué
    # correos están registrados en el sistema, ni para saturarlo de correos.
    clave_intentos = f"{ip}:{data.correo.lower()}"
    if limite_excedido(clave_intentos):
        return _RESPUESTA_GENERICA_OLVIDE
    registrar_intento_fallido(clave_intentos)

    usuario = db.query(Usuario).filter(Usuario.correo == data.correo).first()
    if usuario and usuario.estado_activo:
        enlace = generar_enlace_password(db, usuario.id_usuario)
        enviar_correo_restablecer_password(usuario.correo, usuario.nombre, enlace)

    return _RESPUESTA_GENERICA_OLVIDE


def restablecer_password(db: Session, data) -> dict:
    registro = consumir_token(db, data.token)
    if not registro:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=api_response(
                success=False,
                message="No se pudo restablecer la contraseña",
                error="El enlace no es válido o ya expiró. Solicita uno nuevo."
            )
        )

    usuario = db.query(Usuario).filter(Usuario.id_usuario == registro.id_usuario).first()
    usuario.password_hash = hash_password(data.password)
    registro.usado = True
    db.commit()

    return api_response(
        success=True,
        message="Contraseña actualizada correctamente. Ya puedes iniciar sesión.",
        data=None
    )


def get_me(current_user: Usuario) -> dict:
    return api_response(
        success=True,
        message="Usuario autenticado",
        data=_serializar_usuario(current_user)
    )
