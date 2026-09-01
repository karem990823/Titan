import logging
import uuid

from sqlalchemy.orm import Session
from sqlalchemy import and_
from sqlalchemy.orm import joinedload

from App.Modulo_Cursos.models.programacion_model import ProgramacionCurso
from App.Modulo_Cursos.models.inscripcion_model import Inscripcion
from App.Modulo_Cursos.models.certificado_model import Certificado
from App.Modulo_Cursos.models.curso_model import Curso
from App.Modulo_Cursos.models.usuario_model import Usuario
from App.Modulo_Cursos.models.salud_model import Salud

from fastapi import HTTPException, status
from datetime import date
from typing import Dict, Any
from App.Modulo_Cursos.utils.response import api_response

logger = logging.getLogger("titan.errors")


def _validar_instructor(db: Session, id_usuario: int):
    usuario = db.query(Usuario).options(joinedload(Usuario.rol)).filter(
        Usuario.id_usuario == id_usuario
    ).first()

    rol_actual = usuario.rol.nombre_rol if usuario and usuario.rol else None
    if rol_actual != "Instructor":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=api_response(
                success=False,
                message="No se pudo programar el curso",
                error="El usuario indicado no es un Instructor"
            )
        )


def programar_nuevo_curso(db: Session, data):
    _validar_instructor(db, data.id_usuario)

    conflicto = db.query(ProgramacionCurso).filter(
        and_(
            ProgramacionCurso.id_usuario == data.id_usuario,
            ProgramacionCurso.fecha == data.fecha,
            ProgramacionCurso.hora == data.hora
        )
    ).first()

    if conflicto:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=api_response(
                success=False,
                message="No se pudo programar el curso",
                error="El instructor ya tiene un curso en ese horario"
            )
        )

    nueva_prog = ProgramacionCurso(**data.model_dump())
    db.add(nueva_prog)
    db.commit()

    return api_response(
        success=True,
        message="Curso programado correctamente",
        data={
            "estado": "programado"
        }
    )

def _validar_inscripcion_duplicada(db: Session, id_prog: int, id_user: int):
    if db.query(Inscripcion).filter(
        Inscripcion.id_programacion == id_prog,
        Inscripcion.id_usuario == id_user
    ).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=api_response(
                success=False,
                message="No se pudo realizar la inscripción",
                error="El usuario ya está inscrito en este curso"
            )
        )
    
def _validar_aptitud_medica(db: Session, id_user: int):
    salud = db.query(Salud).filter(
        Salud.id_trabajador == id_user,
        Salud.apto == 'SI',
        Salud.fecha_vencimiento >= date.today()
    ).first()

    if not salud:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=api_response(
                success=False,
                message="Inscripción bloqueada",
                error="El trabajador no cuenta con aptitud médica vigente"
            )
        )
    
def _validar_requisito_reentrenamiento(db: Session, id_user: int, prog: ProgramacionCurso):
    if "reentrenamiento" in prog.curso.nombre_curso.lower():
        requisito = db.query(Certificado).filter(
            Certificado.id_usuario == id_user,
            Certificado.id_curso == prog.id_curso,
            Certificado.fecha_vencimiento >= date.today()
        ).first()

        if not requisito:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=api_response(
                    success=False,
                    message="Inscripción bloqueada",
                    error="Se requiere certificado previo vigente para reentrenamiento"
                )
            )
        
def _validar_cupos(prog: ProgramacionCurso):
    if prog.cupos <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=api_response(
                success=False,
                message="No se pudo realizar la inscripción",
                error="No hay cupos disponibles"
            )
        )
    
def _validar_trabajador_propio(db: Session, id_user: int, current_user: Usuario):
    # Una Empresa solo puede inscribir trabajadores que le pertenecen; Instructor
    # y Administrador no tienen esta restricción.
    rol_actual = current_user.rol.nombre_rol if current_user.rol else None
    if rol_actual != "Empresa":
        return

    trabajador = db.query(Usuario).filter(Usuario.id_usuario == id_user).first()
    if not trabajador or trabajador.id_empresa != current_user.id_usuario:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=api_response(
                success=False,
                message="No se pudo realizar la inscripción",
                error="Solo puedes inscribir trabajadores de tu propia empresa"
            )
        )


def inscribir_participante(db: Session, id_prog: int, id_user: int, current_user: Usuario):
    with db.begin_nested():

        prog = db.query(ProgramacionCurso).filter(
            ProgramacionCurso.id_programacion == id_prog
        ).with_for_update().first()

        if not prog:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=api_response(
                    success=False,
                    message="Programación no encontrada",
                    error="El curso no existe o no está disponible"
                )
            )

        # validaciones
        _validar_trabajador_propio(db, id_user, current_user)
        _validar_cupos(prog)
        _validar_inscripcion_duplicada(db, id_prog, id_user)
        _validar_aptitud_medica(db, id_user)
        _validar_requisito_reentrenamiento(db, id_user, prog)

        # inscripción
        nueva_inscripcion = Inscripcion(
            id_programacion=id_prog,
            id_usuario=id_user
        )

        prog.cupos -= 1

        db.add(nueva_inscripcion)
        # No se hace commit aquí: un commit dentro de begin_nested() cierra la
        # transacción externa y libera el lock de with_for_update() antes de
        # tiempo, abriendo una ventana de sobreventa de cupos. begin_nested()
        # libera el SAVEPOINT solo al salir limpio del bloque with.

    db.commit()

    return api_response(
        success=True,
        message="Inscripción realizada correctamente",
        data={
            "estado": "inscrito",
            "cupos_restantes": prog.cupos
        }
    )
def obtener_calendario(db: Session):
    try:
        # Usamos joinedload para traer los objetos relacionados
        programaciones = db.query(ProgramacionCurso).options(
            joinedload(ProgramacionCurso.curso),
            joinedload(ProgramacionCurso.instructor)
        ).all()

        resultado = []
        for p in programaciones:
            # Validamos que existan los objetos antes de acceder a sus atributos
            nombre_curso = p.curso.nombre_curso if p.curso else "Curso no definido"
            
            # Usamos 'nombres' y 'apellidos' con S como está en tu SQL
            if p.instructor:
                nombre_inst = f"{p.instructor.nombre} {p.instructor.apellido or ''}".strip()
            else:
                nombre_inst = "Instructor no asignado"

            resultado.append({
                "id_programacion": p.id_programacion,
                "fecha": p.fecha.strftime("%Y-%m-%d") if p.fecha else None,
                "hora": p.hora.strftime("%H:%M") if p.hora else None,
                "cupos": p.cupos,
                "nombre_curso": nombre_curso,
                "instructor_nombre": nombre_inst
            })

        return api_response(
            success=True,
            message="Calendario obtenido con éxito",
            data=resultado
        )
    except Exception:
        id_correlacion = uuid.uuid4().hex[:8]
        logger.exception("Error al obtener el calendario [%s]", id_correlacion)
        raise HTTPException(
            status_code=500,
            detail=api_response(
                success=False,
                message="Error interno del servidor",
                error=f"id_correlacion={id_correlacion}"
            )
        )
    

def actualizar_programacion(db: Session, id_programacion: int, data):

    programacion = db.query(ProgramacionCurso).filter(
        ProgramacionCurso.id_programacion == id_programacion
    ).first()

    if not programacion:
        raise HTTPException(
            status_code=404,
            detail="Programación no encontrada"
        )

    _validar_instructor(db, data.id_usuario)

    programacion.id_curso = data.id_curso
    programacion.id_usuario = data.id_usuario
    programacion.fecha = data.fecha
    programacion.hora = data.hora
    programacion.cupos = data.cupos


    db.commit()
    db.refresh(programacion)


    return api_response(
        success=True,
        message="Programación actualizada",
        data={
            "id_programacion": programacion.id_programacion
        }
    )



def listar_inscritos_programacion(db: Session, id_programacion: int):
    inscritos = db.query(Inscripcion).options(
        joinedload(Inscripcion.usuario).joinedload(Usuario.tipo_documento)
    ).filter(
        Inscripcion.id_programacion == id_programacion,
        Inscripcion.estado == "inscrito",
    ).all()

    return api_response(
        success=True,
        message="Inscritos obtenidos correctamente",
        data=[{
            "id_usuario": i.id_usuario,
            "nombre": f"{i.usuario.nombre} {i.usuario.apellido or ''}".strip() if i.usuario else None,
            "tipo_documento": i.usuario.tipo_documento.nombre if i.usuario and i.usuario.tipo_documento else None,
            "numero_identificacion": i.usuario.numero_identificacion if i.usuario else None,
        } for i in inscritos]
    )


def eliminar_programacion(db: Session, id_programacion: int):

    programacion = db.query(ProgramacionCurso).filter(
        ProgramacionCurso.id_programacion == id_programacion
    ).first()


    if not programacion:
        raise HTTPException(
            status_code=404,
            detail="Programación no encontrada"
        )


    db.delete(programacion)
    db.commit()


    return api_response(
        success=True,
        message="Programación eliminada",
        data={
            "id_programacion": id_programacion
        }
    )