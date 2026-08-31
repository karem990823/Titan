from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from App.Modulo_Cursos.models.accidente_model import Accidente
from App.Modulo_Cursos.models.historial_estado_incidente_model import HistorialEstadoIncidente
from App.Modulo_Cursos.models.tipo_accidente_model import TipoAccidente
from App.Modulo_Cursos.models.usuario_model import Usuario
from App.Modulo_Cursos.utils.response import api_response

# Abierto -> en_seguimiento -> cerrado, nunca saltar ni retroceder.
TRANSICIONES_VALIDAS = {
    "abierto": {"en_seguimiento"},
    "en_seguimiento": {"cerrado"},
    "cerrado": set(),
}


def _validar_trabajador_existe(db: Session, id_trabajador: int):
    if not db.query(Usuario).filter(Usuario.id_usuario == id_trabajador).first():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=api_response(
                success=False,
                message="No se pudo registrar el incidente",
                error="El trabajador indicado no existe"
            )
        )


def _validar_tipo_accidente_existe(db: Session, id_tipo_accidente: int):
    if not db.query(TipoAccidente).filter(TipoAccidente.id_tipo_accidente == id_tipo_accidente).first():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=api_response(
                success=False,
                message="No se pudo registrar el incidente",
                error="El tipo de incidente indicado no existe"
            )
        )


def _obtener_o_404(db: Session, id_accidente: int) -> Accidente:
    item = db.query(Accidente).filter(Accidente.id_accidente == id_accidente).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=api_response(
                success=False,
                message="Incidente no encontrado",
                error="No existe un incidente con ese ID"
            )
        )
    return item


def _serializar(item: Accidente) -> dict:
    return {
        "id_accidente": item.id_accidente,
        "fecha": item.fecha.strftime("%Y-%m-%d") if item.fecha else None,
        "lugar": item.lugar,
        "id_trabajador": item.id_trabajador,
        "trabajador": f"{item.trabajador.nombre} {item.trabajador.apellido or ''}".strip() if item.trabajador else None,
        "id_tipo_accidente": item.id_tipo_accidente,
        "tipo_accidente": item.tipo_accidente.nombre if item.tipo_accidente else None,
        "descripcion": item.descripcion,
        "estado": item.estado,
    }


def listar_accidentes(db: Session):
    items = db.query(Accidente).options(
        joinedload(Accidente.trabajador),
        joinedload(Accidente.tipo_accidente),
    ).all()
    return api_response(
        success=True,
        message="Incidentes obtenidos correctamente",
        data=[_serializar(i) for i in items]
    )


def listar_accidentes_por_trabajador(db: Session, id_trabajador: int):
    _validar_trabajador_existe(db, id_trabajador)
    items = db.query(Accidente).options(
        joinedload(Accidente.trabajador),
        joinedload(Accidente.tipo_accidente),
    ).filter(Accidente.id_trabajador == id_trabajador).all()
    return api_response(
        success=True,
        message="Incidentes obtenidos correctamente",
        data=[_serializar(i) for i in items]
    )


def crear_accidente(db: Session, data):
    _validar_trabajador_existe(db, data.id_trabajador)
    _validar_tipo_accidente_existe(db, data.id_tipo_accidente)

    nuevo = Accidente(**data.model_dump())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    return api_response(
        success=True,
        message="Incidente registrado correctamente",
        data={"id_accidente": nuevo.id_accidente}
    )


def actualizar_accidente(db: Session, id_accidente: int, data):
    item = _obtener_o_404(db, id_accidente)

    datos = data.model_dump(exclude_unset=True)

    if "id_trabajador" in datos:
        _validar_trabajador_existe(db, datos["id_trabajador"])
    if "id_tipo_accidente" in datos:
        _validar_tipo_accidente_existe(db, datos["id_tipo_accidente"])

    for campo, valor in datos.items():
        setattr(item, campo, valor)

    db.commit()
    db.refresh(item)

    return api_response(
        success=True,
        message="Incidente actualizado correctamente",
        data={"id_accidente": item.id_accidente}
    )


def eliminar_accidente(db: Session, id_accidente: int):
    item = _obtener_o_404(db, id_accidente)

    db.delete(item)
    db.commit()

    return api_response(
        success=True,
        message="Incidente eliminado correctamente",
        data={"id_accidente": id_accidente}
    )


def listar_tipos_accidente(db: Session):
    tipos = db.query(TipoAccidente).all()
    return [{"id_tipo_accidente": t.id_tipo_accidente, "nombre": t.nombre} for t in tipos]


def cambiar_estado_incidente(db: Session, id_accidente: int, nuevo_estado: str, current_user: Usuario):
    item = _obtener_o_404(db, id_accidente)
    estado_actual = item.estado or "abierto"

    if nuevo_estado not in TRANSICIONES_VALIDAS.get(estado_actual, set()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=api_response(
                success=False,
                message="No se pudo cambiar el estado",
                error=f"No se puede pasar de '{estado_actual}' a '{nuevo_estado}' directamente"
            )
        )

    if nuevo_estado == "cerrado":
        rol_actual = current_user.rol.nombre_rol if current_user.rol else None
        if rol_actual != "Administrador":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=api_response(
                    success=False,
                    message="No se pudo cambiar el estado",
                    error="Solo un Administrador puede cerrar un incidente"
                )
            )

    db.add(HistorialEstadoIncidente(
        id_accidente=id_accidente,
        estado_anterior=estado_actual,
        estado_nuevo=nuevo_estado,
        id_usuario=current_user.id_usuario,
    ))
    item.estado = nuevo_estado
    db.commit()

    return api_response(
        success=True,
        message="Estado actualizado correctamente",
        data={"id_accidente": id_accidente, "estado": nuevo_estado}
    )


def listar_historial_estado(db: Session, id_accidente: int):
    _obtener_o_404(db, id_accidente)
    items = db.query(HistorialEstadoIncidente).options(
        joinedload(HistorialEstadoIncidente.usuario)
    ).filter(HistorialEstadoIncidente.id_accidente == id_accidente).order_by(HistorialEstadoIncidente.fecha).all()

    return api_response(
        success=True,
        message="Historial obtenido correctamente",
        data=[{
            "id_historial": h.id_historial,
            "estado_anterior": h.estado_anterior,
            "estado_nuevo": h.estado_nuevo,
            "usuario": f"{h.usuario.nombre} {h.usuario.apellido or ''}".strip() if h.usuario else None,
            "fecha": h.fecha.strftime("%Y-%m-%d %H:%M") if h.fecha else None,
        } for h in items]
    )
