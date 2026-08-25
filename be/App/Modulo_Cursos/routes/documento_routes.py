from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from App.Modulo_Cursos.config.database import get_db
from App.Modulo_Cursos.controllers.documento_controller import (
    descargar_documento,
    listar_documentos_por_usuario,
    subir_documento,
)
from App.Modulo_Cursos.deps import require_empresa_instructor_or_admin, require_roles
from App.Modulo_Cursos.models.usuario_model import Usuario

router = APIRouter(
    prefix="/api/documentos",
    tags=["Documentos"]
)

require_empresa_o_admin = require_roles("Empresa", "Administrador")


@router.post("/{id_usuario}")
def subir(
    id_usuario: int,
    file: UploadFile = File(...),
    nombre: str = Form(...),
    descripcion: str | None = Form(None),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_empresa_o_admin),
):
    return subir_documento(db, id_usuario, file, nombre, descripcion, current_user)


@router.get("/usuario/{id_usuario}")
def listar_por_usuario(
    id_usuario: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_empresa_instructor_or_admin),
):
    return listar_documentos_por_usuario(db, id_usuario, current_user)


@router.get("/{id_documento}/descargar")
def descargar(
    id_documento: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_empresa_instructor_or_admin),
):
    return descargar_documento(db, id_documento, current_user)
