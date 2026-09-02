from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from App.Modulo_Cursos.config.database import get_db
from App.Modulo_Cursos.schemas.consolidado_mensual_schema import CierreMesRequest
from App.Modulo_Cursos.controllers.reporte_controller import (
    descargar_pdf_reporte,
    generar_reporte_diario,
    listar_reportes,
    obtener_reporte,
)
from App.Modulo_Cursos.controllers.consolidado_mensual_controller import (
    ejecutar_cierre_mes,
    listar_consolidados,
)
from App.Modulo_Cursos.deps import require_instructor_or_admin
from App.Modulo_Cursos.models.usuario_model import Usuario

router = APIRouter(
    prefix="/api/reportes",
    tags=["Reportes"]
)


@router.post("/diario")
def generar_diario(db: Session = Depends(get_db), current_user: Usuario = Depends(require_instructor_or_admin)):
    return generar_reporte_diario(db, current_user)


@router.get("/")
def listar(tipo: str | None = Query(None), db: Session = Depends(get_db), current_user: Usuario = Depends(require_instructor_or_admin)):
    return listar_reportes(db, tipo)


@router.get("/consolidados")
def listar_consolidados_mensuales(db: Session = Depends(get_db), current_user: Usuario = Depends(require_instructor_or_admin)):
    return listar_consolidados(db)


@router.post("/cierre-mes")
def cierre_mes(data: CierreMesRequest, db: Session = Depends(get_db), current_user: Usuario = Depends(require_instructor_or_admin)):
    return ejecutar_cierre_mes(db, data.mes, data.anio, current_user)


@router.get("/{id_reporte}/pdf")
def descargar_pdf(id_reporte: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_instructor_or_admin)):
    return descargar_pdf_reporte(db, id_reporte)


@router.get("/{id_reporte}")
def obtener(id_reporte: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_instructor_or_admin)):
    return obtener_reporte(db, id_reporte)
