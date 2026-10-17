from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session, joinedload

from App.Modulo_Cursos.config.database import get_db
from App.Modulo_Cursos.schemas.inscripcion_schema import InscripcionBase
from App.Modulo_Cursos.controllers import curso_controller
from App.Modulo_Cursos.deps import get_current_user, require_empresa_instructor_or_admin
from App.Modulo_Cursos.models.usuario_model import Usuario

router = APIRouter(
    prefix="/api/inscripciones",
    tags=["Inscripciones"]
)

@router.post("/{id_programacion}")
def inscribir(
    id_programacion: int,
    data: InscripcionBase,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_empresa_instructor_or_admin),
):
    return curso_controller.inscribir_participante(
        db,
        id_programacion,
        data.id_usuario,
        current_user,
    )

@router.get("/participantes/buscar")
def buscar_participante(
    id_tipo: int = Query(...),
    numero: int = Query(...),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    participante = db.query(Usuario).options(
        joinedload(Usuario.tipo_documento)
    ).filter(
        Usuario.id_tipo == id_tipo,
        Usuario.numero_identificacion == numero,
        Usuario.estado_activo == True
    ).first()

    if not participante:
        raise HTTPException(
            status_code=404,
            detail="Participante no encontrado."
        )

    return {
        "id_usuario": participante.id_usuario,
        "nombre": f"{participante.nombre} {participante.apellido}",
        "tipo_documento": participante.tipo_documento.nombre if participante.tipo_documento else "",
        "numero_identificacion": participante.numero_identificacion
    }
