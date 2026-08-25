from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from App.Modulo_Cursos.config.database import get_db
from App.Modulo_Cursos.schemas.certificado_indumentaria_schema import (
    CertificadoIndumentariaCreate,
    CertificadoIndumentariaUpdate
)
from App.Modulo_Cursos.controllers.certificado_indumentaria_controller import (
    listar_certificados_indumentaria,
    obtener_certificado_indumentaria,
    crear_certificado_indumentaria,
    actualizar_certificado_indumentaria,
    eliminar_certificado_indumentaria
)
from App.Modulo_Cursos.deps import require_admin
from App.Modulo_Cursos.models.usuario_model import Usuario

router = APIRouter(
    prefix="/api/certificados-indumentaria",
    tags=["Certificados Indumentaria"]
)


@router.get("/")
def listar(db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    return listar_certificados_indumentaria(db)


@router.get("/{id_certificado_equipo}")
def obtener(id_certificado_equipo: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    return obtener_certificado_indumentaria(db, id_certificado_equipo)


@router.post("/")
def crear(data: CertificadoIndumentariaCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    return crear_certificado_indumentaria(db, data)


@router.put("/{id_certificado_equipo}")
def actualizar(id_certificado_equipo: int, data: CertificadoIndumentariaUpdate, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    return actualizar_certificado_indumentaria(db, id_certificado_equipo, data)


@router.delete("/{id_certificado_equipo}")
def eliminar(id_certificado_equipo: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    return eliminar_certificado_indumentaria(db, id_certificado_equipo)
