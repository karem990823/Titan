from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from App.Modulo_Cursos.models.inspeccion_indumentaria_model import InspeccionIndumentaria
from App.Modulo_Cursos.models.indumentaria_model import Indumentaria
from App.Modulo_Cursos.models.usuario_model import Usuario
from App.Modulo_Cursos.utils.response import api_response


def _validar_indumentaria_existe(db: Session, id_indumentaria: int):
    if not db.query(Indumentaria).filter(Indumentaria.id_indumentaria == id_indumentaria).first():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=api_response(
                success=False,
                message="No se pudo registrar la inspección",
                error="La indumentaria indicada no existe"
            )
        )


def _validar_usuario_existe(db: Session, id_usuario: int):
    if not db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=api_response(
                success=False,
                message="No se pudo registrar la inspección",
                error="El usuario indicado no existe"
            )
        )


def _obtener_o_404(db: Session, id_inspeccion: int) -> InspeccionIndumentaria:
    item = db.query(InspeccionIndumentaria).filter(
        InspeccionIndumentaria.id_inspeccion == id_inspeccion
    ).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=api_response(
                success=False,
                message="Inspección no encontrada",
                error="No existe inspección con ese ID"
            )
        )
    return item


def listar_inspecciones(db: Session):
    items = db.query(InspeccionIndumentaria).options(
        joinedload(InspeccionIndumentaria.indumentaria),
        joinedload(InspeccionIndumentaria.usuario)
    ).all()

    return api_response(
        success=True,
        message="Inspecciones obtenidas correctamente",
        data=[{
            "id_inspeccion": i.id_inspeccion,
            "fecha": i.fecha.strftime("%Y-%m-%d") if i.fecha else None,
            "indumentaria": i.indumentaria.nombre if i.indumentaria else None,
            "usuario": f"{i.usuario.nombre} {i.usuario.apellido}" if i.usuario else None,
            "observaciones": i.observaciones
        } for i in items]
    )


def obtener_inspeccion(db: Session, id_inspeccion: int):
    item = _obtener_o_404(db, id_inspeccion)
    return api_response(
        success=True,
        message="Inspección obtenida correctamente",
        data={
            "id_inspeccion": item.id_inspeccion,
            "fecha": item.fecha.strftime("%Y-%m-%d") if item.fecha else None,
            "id_indumentaria": item.id_indumentaria,
            "id_usuario": item.id_usuario,
            "observaciones": item.observaciones
        }
    )


def crear_inspeccion(db: Session, data):
    _validar_indumentaria_existe(db, data.id_indumentaria)
    _validar_usuario_existe(db, data.id_usuario)

    nueva = InspeccionIndumentaria(**data.model_dump())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)

    return api_response(
        success=True,
        message="Inspección registrada correctamente",
        data={"id_inspeccion": nueva.id_inspeccion}
    )


def actualizar_inspeccion(db: Session, id_inspeccion: int, data):
    item = _obtener_o_404(db, id_inspeccion)

    datos = data.model_dump(exclude_unset=True)

    if "id_indumentaria" in datos:
        _validar_indumentaria_existe(db, datos["id_indumentaria"])
    if "id_usuario" in datos:
        _validar_usuario_existe(db, datos["id_usuario"])

    for campo, valor in datos.items():
        setattr(item, campo, valor)

    db.commit()
    db.refresh(item)

    return api_response(
        success=True,
        message="Inspección actualizada correctamente",
        data={"id_inspeccion": item.id_inspeccion}
    )


def eliminar_inspeccion(db: Session, id_inspeccion: int):
    item = _obtener_o_404(db, id_inspeccion)

    db.delete(item)
    db.commit()

    return api_response(
        success=True,
        message="Inspección eliminada correctamente",
        data={"id_inspeccion": id_inspeccion}
    )
