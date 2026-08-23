from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from App.Modulo_Cursos.config.database import get_db
from App.Modulo_Cursos.schemas.curso_schema import ProgramacionBase, InscripcionBase
from App.Modulo_Cursos.controllers import curso_controller
from App.Modulo_Cursos.models.curso_model import Usuario, Curso, ProgramacionCurso, TipoIdentificacion
from fastapi import HTTPException

router = APIRouter(prefix="/api/cursos", tags=["Cursos"])

@router.post("/")
def crear_programacion(data: ProgramacionBase, db: Session = Depends(get_db)):
    return curso_controller.programar_nuevo_curso(db, data)

@router.post("/{id_programacion}/inscribir")
def inscribir(id_programacion: int, data: InscripcionBase, db: Session = Depends(get_db)):
    return curso_controller.inscribir_participante(db, id_programacion, data.id_usuario)

@router.get("/calendario")
def ver_calendario(db: Session = Depends(get_db)):
    return curso_controller.obtener_calendario(db)
@router.get("/tipos-documento")
def get_tipos_documento(db: Session = Depends(get_db)):
    tipos = db.query(TipoIdentificacion).all()
    return [{"id_tipo": t.id_tipo, "nombre": t.nombre} for t in tipos]

@router.get("/lista-cursos")
def get_cursos(db: Session = Depends(get_db)):
    cursos = db.query(Curso).all()
    return [{"id_curso": c.id_curso, "nombre_curso": c.nombre_curso} for c in cursos]

@router.get("/instructores")
def get_instructores(db: Session = Depends(get_db)):
    instructores = db.query(Usuario).options(
        joinedload(Usuario.tipo_documento)
    ).filter(
        Usuario.id_rol == 2,
        Usuario.estado_activo == True
    ).all()
    return [{
        "id_usuario": i.id_usuario,
        "nombre": f"{i.nombre} {i.apellido}",
        "tipo_documento": i.tipo_documento.nombre if i.tipo_documento else "",
        "numero_identificacion": i.numero_identificacion
    } for i in instructores]

@router.get("/participantes/buscar")
def buscar_participante(
    id_tipo: int = Query(...),
    numero: int = Query(...),
    db: Session = Depends(get_db)
):
    participante = db.query(Usuario).options(
        joinedload(Usuario.tipo_documento)
    ).filter(
        Usuario.id_tipo == id_tipo,
        Usuario.numero_identificacion == numero,
        Usuario.estado_activo == True
    ).first()
    if not participante:
        raise HTTPException(status_code=404, detail="Participante no encontrado.")
    return {
        "id_usuario": participante.id_usuario,
        "nombre": f"{participante.nombre} {participante.apellido}",
        "tipo_documento": participante.tipo_documento.nombre if participante.tipo_documento else "",
        "numero_identificacion": participante.numero_identificacion
    }

@router.get("/programaciones/{id_curso}")
def get_programaciones_por_curso(id_curso: int, db: Session = Depends(get_db)):
    programaciones = db.query(ProgramacionCurso).filter(
        ProgramacionCurso.id_curso == id_curso,
        ProgramacionCurso.cupos > 0
    ).all()
    return [{
        "id_programacion": p.id_programacion,
        "fecha": p.fecha.strftime("%Y-%m-%d") if p.fecha else None,
        "hora": p.hora.strftime("%H:%M") if p.hora else None,
        "cupos": p.cupos
    } for p in programaciones]