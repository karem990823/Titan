from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from App.Modulo_Cursos.models.solicitud_contacto_model import SolicitudContacto
from App.Modulo_Cursos.utils.response import api_response


def _serializar(item: SolicitudContacto) -> dict:
    return {
        "id_solicitud": item.id_solicitud,
        "nombre_contacto": item.nombre_contacto,
        "empresa": item.empresa,
        "correo": item.correo,
        "telefono": item.telefono,
        "tipo_servicio": item.tipo_servicio,
        "numero_personal": item.numero_personal,
        "detalle": item.detalle,
        "atendida": item.atendida,
        "fecha_creacion": item.fecha_creacion.strftime("%Y-%m-%d %H:%M") if item.fecha_creacion else None,
    }


def crear_solicitud(db: Session, data) -> dict:
    nueva = SolicitudContacto(**data.model_dump())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)

    return api_response(
        success=True,
        message="Solicitud enviada correctamente",
        data=_serializar(nueva)
    )


def listar_solicitudes(db: Session) -> dict:
    items = db.query(SolicitudContacto).order_by(SolicitudContacto.fecha_creacion.desc()).all()

    return api_response(
        success=True,
        message="Solicitudes obtenidas correctamente",
        data=[_serializar(i) for i in items]
    )


def actualizar_solicitud(db: Session, id_solicitud: int, data) -> dict:
    item = db.query(SolicitudContacto).filter(SolicitudContacto.id_solicitud == id_solicitud).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=api_response(
                success=False,
                message="Solicitud no encontrada",
                error="No existe una solicitud con ese ID"
            )
        )

    item.atendida = data.atendida
    db.commit()
    db.refresh(item)

    return api_response(
        success=True,
        message="Solicitud actualizada correctamente",
        data=_serializar(item)
    )
