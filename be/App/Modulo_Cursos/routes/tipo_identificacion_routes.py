from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from App.Modulo_Cursos.config.database import get_db
from App.Modulo_Cursos.models.tipo_identificacion_model import TipoIdentificacion

router = APIRouter(
    prefix="/api/tipos-identificacion",
    tags=["Tipos Identificación"]
)

@router.get("/")
def get_tipos_documento(db: Session = Depends(get_db)):
    tipos = db.query(TipoIdentificacion).all()

    return [{
        "id_tipo": t.id_tipo,
        "nombre": t.nombre
    } for t in tipos]