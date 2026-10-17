import json
from datetime import date

from fastapi import HTTPException, Response, status
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from App.Modulo_Cursos.models.accidente_model import Accidente
from App.Modulo_Cursos.models.asistencia_model import Asistencia
from App.Modulo_Cursos.models.certificado_model import Certificado
from App.Modulo_Cursos.models.programacion_model import ProgramacionCurso
from App.Modulo_Cursos.models.reporte_model import Reporte
from App.Modulo_Cursos.models.usuario_model import Usuario
from App.Modulo_Cursos.utils.pdf_reporte import generar_pdf_reporte_diario
from App.Modulo_Cursos.utils.response import api_response


def _serializar(item: Reporte) -> dict:
    return {
        "id_reporte": item.id_reporte,
        "tipo": item.tipo,
        "fecha": item.fecha.strftime("%Y-%m-%d") if item.fecha else None,
        "contenido_json": item.contenido_json,
        "generado_por": item.generado_por,
        "fecha_creacion": item.fecha_creacion.strftime("%Y-%m-%d %H:%M") if item.fecha_creacion else None,
    }


def generar_reporte_diario(db: Session, current_user: Usuario) -> dict:
    hoy = date.today()

    programaciones = db.query(ProgramacionCurso).options(joinedload(ProgramacionCurso.curso)).filter(
        ProgramacionCurso.fecha == hoy
    ).all()

    asistencias = db.query(Asistencia).filter(
        func.date(Asistencia.fecha_registro) == hoy
    ).all()

    incidentes = db.query(Accidente).filter(Accidente.fecha == hoy).all()

    certificados = db.query(Certificado).options(joinedload(Certificado.curso)).filter(
        Certificado.fecha_emision == hoy
    ).all()

    contenido = {
        "cursos_programados": [
            {"id_programacion": p.id_programacion, "curso": p.curso.nombre_curso if p.curso else None, "hora": p.hora.strftime("%H:%M") if p.hora else None}
            for p in programaciones
        ],
        "asistencias_marcadas": len(asistencias),
        "incidentes_registrados": [
            {"id_accidente": a.id_accidente, "lugar": a.lugar} for a in incidentes
        ],
        "certificados_emitidos": [
            {"codigo": c.codigo, "curso": c.curso.nombre_curso if c.curso else None} for c in certificados
        ],
    }

    nuevo = Reporte(
        tipo="diario",
        fecha=hoy,
        contenido_json=json.dumps(contenido, ensure_ascii=False),
        generado_por=current_user.id_usuario,
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    return api_response(
        success=True,
        message="Reporte diario generado correctamente",
        data=_serializar(nuevo)
    )


def listar_reportes(db: Session, tipo: str | None = None) -> dict:
    query = db.query(Reporte)
    if tipo:
        query = query.filter(Reporte.tipo == tipo)
    items = query.order_by(Reporte.fecha_creacion.desc()).all()

    return api_response(
        success=True,
        message="Reportes obtenidos correctamente",
        data=[_serializar(i) for i in items]
    )


def obtener_reporte(db: Session, id_reporte: int) -> dict:
    item = db.query(Reporte).filter(Reporte.id_reporte == id_reporte).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=api_response(
                success=False,
                message="Reporte no encontrado",
                error="No existe un reporte con ese ID"
            )
        )

    return api_response(
        success=True,
        message="Reporte obtenido correctamente",
        data=_serializar(item)
    )


def descargar_pdf_reporte(db: Session, id_reporte: int) -> Response:
    item = db.query(Reporte).options(joinedload(Reporte.usuario)).filter(
        Reporte.id_reporte == id_reporte
    ).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=api_response(
                success=False,
                message="Reporte no encontrado",
                error="No existe un reporte con ese ID"
            )
        )

    pdf_bytes = generar_pdf_reporte_diario(item)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="reporte-diario-{item.fecha}.pdf"'
        }
    )
