from datetime import date, timedelta

from fastapi import HTTPException, Response, status
from sqlalchemy.orm import Session, joinedload

from App.Modulo_Cursos.models.certificado_indumentaria_model import CertificadoIndumentaria
from App.Modulo_Cursos.models.indumentaria_model import Indumentaria
from App.Modulo_Cursos.models.inspeccion_indumentaria_model import InspeccionIndumentaria
from App.Modulo_Cursos.utils.pdf_certificado_equipo import generar_pdf_certificado_equipo
from App.Modulo_Cursos.utils.response import api_response

# Misma vigencia usada para los certificados de curso (HU10): 1 año.
VIGENCIA_CERTIFICADO_EQUIPO_DIAS = 365


def _validar_indumentaria_existe(db: Session, id_indumentaria: int):
    if not db.query(Indumentaria).filter(Indumentaria.id_indumentaria == id_indumentaria).first():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=api_response(
                success=False,
                message="No se pudo registrar el certificado",
                error="La indumentaria indicada no existe"
            )
        )


def _validar_fechas(fecha_emision, fecha_vencimiento):
    if fecha_vencimiento < fecha_emision:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=api_response(
                success=False,
                message="No se pudo registrar el certificado",
                error="La fecha de vencimiento no puede ser anterior a la de emisión"
            )
        )


def _obtener_o_404(db: Session, id_certificado_equipo: int) -> CertificadoIndumentaria:
    item = db.query(CertificadoIndumentaria).filter(
        CertificadoIndumentaria.id_certificado_equipo == id_certificado_equipo
    ).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=api_response(
                success=False,
                message="Certificado no encontrado",
                error="No existe certificado de indumentaria con ese ID"
            )
        )
    return item


def listar_certificados_indumentaria(db: Session):
    items = db.query(CertificadoIndumentaria).options(
        joinedload(CertificadoIndumentaria.indumentaria)
    ).all()

    return api_response(
        success=True,
        message="Certificados de indumentaria obtenidos correctamente",
        data=[{
            "id_certificado_equipo": c.id_certificado_equipo,
            "indumentaria": c.indumentaria.nombre if c.indumentaria else None,
            "fecha_emision": c.fecha_emision.strftime("%Y-%m-%d") if c.fecha_emision else None,
            "fecha_vencimiento": c.fecha_vencimiento.strftime("%Y-%m-%d") if c.fecha_vencimiento else None,
            "estado": c.estado
        } for c in items]
    )


def obtener_certificado_indumentaria(db: Session, id_certificado_equipo: int):
    item = _obtener_o_404(db, id_certificado_equipo)
    return api_response(
        success=True,
        message="Certificado obtenido correctamente",
        data={
            "id_certificado_equipo": item.id_certificado_equipo,
            "id_indumentaria": item.id_indumentaria,
            "fecha_emision": item.fecha_emision.strftime("%Y-%m-%d") if item.fecha_emision else None,
            "fecha_vencimiento": item.fecha_vencimiento.strftime("%Y-%m-%d") if item.fecha_vencimiento else None,
            "estado": item.estado
        }
    )


def crear_certificado_indumentaria(db: Session, data):
    _validar_indumentaria_existe(db, data.id_indumentaria)
    _validar_fechas(data.fecha_emision, data.fecha_vencimiento)

    nuevo = CertificadoIndumentaria(**data.model_dump())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    return api_response(
        success=True,
        message="Certificado registrado correctamente",
        data={"id_certificado_equipo": nuevo.id_certificado_equipo}
    )


def actualizar_certificado_indumentaria(db: Session, id_certificado_equipo: int, data):
    item = _obtener_o_404(db, id_certificado_equipo)

    datos = data.model_dump(exclude_unset=True)

    if "id_indumentaria" in datos:
        _validar_indumentaria_existe(db, datos["id_indumentaria"])

    nueva_emision = datos.get("fecha_emision", item.fecha_emision)
    nuevo_vencimiento = datos.get("fecha_vencimiento", item.fecha_vencimiento)
    _validar_fechas(nueva_emision, nuevo_vencimiento)

    for campo, valor in datos.items():
        setattr(item, campo, valor)

    db.commit()
    db.refresh(item)

    return api_response(
        success=True,
        message="Certificado actualizado correctamente",
        data={"id_certificado_equipo": item.id_certificado_equipo}
    )


def eliminar_certificado_indumentaria(db: Session, id_certificado_equipo: int):
    item = _obtener_o_404(db, id_certificado_equipo)

    db.delete(item)
    db.commit()

    return api_response(
        success=True,
        message="Certificado eliminado correctamente",
        data={"id_certificado_equipo": id_certificado_equipo}
    )


def generar_desde_inspeccion(db: Session, id_indumentaria: int) -> dict:
    """HU20: el certificado se deriva de la inspección más reciente, no se escribe a mano."""
    _validar_indumentaria_existe(db, id_indumentaria)

    ultima_inspeccion = db.query(InspeccionIndumentaria).filter(
        InspeccionIndumentaria.id_indumentaria == id_indumentaria
    ).order_by(InspeccionIndumentaria.fecha.desc(), InspeccionIndumentaria.id_inspeccion.desc()).first()

    if not ultima_inspeccion or ultima_inspeccion.resultado != "apto":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=api_response(
                success=False,
                message="No se pudo generar el certificado",
                error="El equipo no tiene una inspección vigente con resultado apto"
            )
        )

    hoy = date.today()
    vigente = db.query(CertificadoIndumentaria).filter(
        CertificadoIndumentaria.id_indumentaria == id_indumentaria,
        CertificadoIndumentaria.fecha_vencimiento >= hoy,
    ).order_by(CertificadoIndumentaria.fecha_emision.desc()).first()

    if vigente:
        return api_response(
            success=True,
            message="El equipo ya tiene un certificado vigente",
            data={"id_certificado_equipo": vigente.id_certificado_equipo}
        )

    nuevo = CertificadoIndumentaria(
        id_indumentaria=id_indumentaria,
        fecha_emision=hoy,
        fecha_vencimiento=hoy + timedelta(days=VIGENCIA_CERTIFICADO_EQUIPO_DIAS),
        estado="apto",
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    return api_response(
        success=True,
        message="Certificado generado correctamente",
        data={"id_certificado_equipo": nuevo.id_certificado_equipo}
    )


def descargar_certificado_indumentaria(db: Session, id_certificado_equipo: int) -> Response:
    certificado = db.query(CertificadoIndumentaria).options(
        joinedload(CertificadoIndumentaria.indumentaria)
    ).filter(CertificadoIndumentaria.id_certificado_equipo == id_certificado_equipo).first()

    if not certificado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=api_response(
                success=False,
                message="Certificado no encontrado",
                error="No existe certificado de indumentaria con ese ID"
            )
        )

    pdf_bytes = generar_pdf_certificado_equipo(certificado)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="certificado-equipo-{certificado.id_certificado_equipo}.pdf"'
        }
    )
