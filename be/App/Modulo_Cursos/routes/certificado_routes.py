from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from App.Modulo_Cursos.config.database import get_db
from App.Modulo_Cursos.controllers.certificado_controller import (
    buscar_publico,
    descargar_certificado,
    descargar_publico,
    listar_certificados,
    listar_mis_trabajadores,
)
from App.Modulo_Cursos.deps import require_empresa, require_empresa_instructor_or_admin, require_instructor_or_admin
from App.Modulo_Cursos.models.usuario_model import Usuario

router = APIRouter(
    prefix="/api/certificados",
    tags=["Certificados"]
)


@router.get("/")
def listar(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_instructor_or_admin),
):
    return listar_certificados(db)


# --- Consulta pública (sin autenticación): página de descarga de certificado ---

@router.get("/publico/buscar")
def buscar(
    id_tipo: int = Query(...),
    numero_identificacion: int = Query(...),
    db: Session = Depends(get_db),
):
    return buscar_publico(db, id_tipo, numero_identificacion)


@router.get("/publico/{id_certificado}/descargar")
def descargar_desde_publico(
    id_certificado: int,
    id_tipo: int = Query(...),
    numero_identificacion: int = Query(...),
    db: Session = Depends(get_db),
):
    return descargar_publico(db, id_certificado, id_tipo, numero_identificacion)


# --- Empresa: certificados de sus propios trabajadores ---

@router.get("/mis-trabajadores")
def mis_trabajadores(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_empresa),
):
    return listar_mis_trabajadores(db, current_user)


@router.get("/{id_certificado}/descargar")
def descargar(
    id_certificado: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_empresa_instructor_or_admin),
):
    return descargar_certificado(db, id_certificado, current_user)
