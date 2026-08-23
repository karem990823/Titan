from sqlalchemy.orm import Session
from sqlalchemy import and_
from sqlalchemy.orm import joinedload
from App.Modulo_Cursos.models.curso_model import ProgramacionCurso, Inscripcion, Certificado, Curso, Usuario, Salud
from fastapi import HTTPException, status
from datetime import date
from typing import Dict, Any
from App.Modulo_Cursos.utils.response import api_response
def programar_nuevo_curso(db: Session, data):
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
    
def inscribir_participante(db: Session, id_prog: int, id_user: int):
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
                nombre_inst = f"{p.instructor.nombre} {p.instructor.apellido}"
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
    except Exception as e:
        # Esto te dirá el error exacto en la terminal si vuelve a fallar
        print(f"Error en calendario: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")