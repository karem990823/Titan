from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from App.Modulo_Cursos.models.salud_model import Salud
from App.Modulo_Cursos.models.usuario_model import Usuario
from App.Modulo_Cursos.utils.response import api_response


def _validar_trabajador_existe(db: Session, id_trabajador: int):
    if not db.query(Usuario).filter(Usuario.id_usuario == id_trabajador).first():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=api_response(
                success=False,
                message="No se pudo registrar el examen médico",
                error="El trabajador indicado no existe"
            )
        )


def _obtener_o_404(db: Session, id_salud: int) -> Salud:
    item = db.query(Salud).filter(Salud.id_salud == id_salud).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=api_response(
                success=False,
                message="Registro de salud no encontrado",
                error="No existe un examen médico con ese ID"
            )
        )
    return item


def _serializar(item: Salud) -> dict:
    return {
        "id_salud": item.id_salud,
        "apto": item.apto,
        "restricciones": item.restricciones,
        "observaciones": item.observaciones,
        "fecha_examen": item.fecha_examen.strftime("%Y-%m-%d") if item.fecha_examen else None,
        "fecha_vencimiento": item.fecha_vencimiento.strftime("%Y-%m-%d") if item.fecha_vencimiento else None,
        "id_trabajador": item.id_trabajador,
        "trabajador": f"{item.trabajador.nombre} {item.trabajador.apellido or ''}".strip() if item.trabajador else None,
    }


def listar_salud(db: Session):
    items = db.query(Salud).options(joinedload(Salud.trabajador)).all()
    return api_response(
        success=True,
        message="Registros de salud obtenidos correctamente",
        data=[_serializar(i) for i in items]
    )


def listar_salud_por_trabajador(db: Session, id_trabajador: int):
    _validar_trabajador_existe(db, id_trabajador)
    items = db.query(Salud).options(joinedload(Salud.trabajador)).filter(
        Salud.id_trabajador == id_trabajador
    ).all()
    return api_response(
        success=True,
        message="Registros de salud obtenidos correctamente",
        data=[_serializar(i) for i in items]
    )


def crear_salud(db: Session, data):
    _validar_trabajador_existe(db, data.id_trabajador)

    nuevo = Salud(**data.model_dump())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    return api_response(
        success=True,
        message="Examen médico registrado correctamente",
        data={"id_salud": nuevo.id_salud}
    )


def actualizar_salud(db: Session, id_salud: int, data):
    item = _obtener_o_404(db, id_salud)

    datos = data.model_dump(exclude_unset=True)

    if "id_trabajador" in datos:
        _validar_trabajador_existe(db, datos["id_trabajador"])

    for campo, valor in datos.items():
        setattr(item, campo, valor)

    db.commit()
    db.refresh(item)

    return api_response(
        success=True,
        message="Registro de salud actualizado correctamente",
        data={"id_salud": item.id_salud}
    )


def eliminar_salud(db: Session, id_salud: int):
    item = _obtener_o_404(db, id_salud)

    db.delete(item)
    db.commit()

    return api_response(
        success=True,
        message="Registro de salud eliminado correctamente",
        data={"id_salud": id_salud}
    )
