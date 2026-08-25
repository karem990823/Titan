from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session, joinedload

from App.Modulo_Cursos.config.database import get_db
from App.Modulo_Cursos.models.usuario_model import Usuario
from App.Modulo_Cursos.utils.response import api_response
from App.Modulo_Cursos.utils.security import JWTError, decode_access_token

bearer_scheme = HTTPBearer(auto_error=False)


def _credenciales_invalidas() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=api_response(
            success=False,
            message="No autenticado",
            error="Token inválido, expirado o ausente"
        )
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Usuario:
    if credentials is None:
        raise _credenciales_invalidas()

    try:
        payload = decode_access_token(credentials.credentials)
    except JWTError:
        raise _credenciales_invalidas()

    id_usuario = payload.get("sub")
    if id_usuario is None:
        raise _credenciales_invalidas()

    usuario = db.query(Usuario).options(
        joinedload(Usuario.rol)
    ).filter(Usuario.id_usuario == int(id_usuario)).first()

    if not usuario or not usuario.estado_activo:
        raise _credenciales_invalidas()

    return usuario


def require_roles(*role_names: str):
    def dependency(current_user: Usuario = Depends(get_current_user)) -> Usuario:
        rol_actual = current_user.rol.nombre_rol if current_user.rol else None
        if rol_actual not in role_names:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=api_response(
                    success=False,
                    message="Acceso denegado",
                    error="Tu rol no tiene permiso para realizar esta acción"
                )
            )
        return current_user
    return dependency


require_admin = require_roles("Administrador")
require_instructor_or_admin = require_roles("Instructor", "Administrador")
require_empresa = require_roles("Empresa")
require_empresa_instructor_or_admin = require_roles("Empresa", "Instructor", "Administrador")
