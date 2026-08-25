from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from App.Modulo_Cursos.config.database import get_db
from App.Modulo_Cursos.controllers.usuario_controller import (
    actualizar_usuario,
    crear_trabajador_propio,
    crear_usuario,
    desactivar_usuario,
    listar_instructores,
    listar_trabajadores_propios,
    listar_usuarios,
)
from App.Modulo_Cursos.deps import get_current_user, require_admin, require_empresa
from App.Modulo_Cursos.models.usuario_model import Usuario
from App.Modulo_Cursos.schemas.usuario_schema import (
    TrabajadorSelfCreate,
    UsuarioCreate,
    UsuarioUpdate,
)

router = APIRouter(
    prefix="/api/usuarios",
    tags=["Usuarios"]
)


@router.get("/instructores")
def get_instructores(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    return listar_instructores(db)


# --- Gestión de cuentas (Administrador) ---

@router.post("/")
def crear(
    data: UsuarioCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin),
):
    return crear_usuario(db, data)


@router.get("/")
def listar(
    tipo_registro: str | None = None,
    id_rol: int | None = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin),
):
    return listar_usuarios(db, tipo_registro, id_rol)


@router.put("/{id_usuario}")
def actualizar(
    id_usuario: int,
    data: UsuarioUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin),
):
    return actualizar_usuario(db, id_usuario, data)


@router.patch("/{id_usuario}/desactivar")
def desactivar(
    id_usuario: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_admin),
):
    return desactivar_usuario(db, id_usuario)


# --- Auto-registro de trabajadores (Empresa) ---

@router.post("/trabajadores")
def crear_trabajador(
    data: TrabajadorSelfCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_empresa),
):
    return crear_trabajador_propio(db, data, current_user)


@router.get("/trabajadores")
def listar_trabajadores(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_empresa),
):
    return listar_trabajadores_propios(db, current_user)
