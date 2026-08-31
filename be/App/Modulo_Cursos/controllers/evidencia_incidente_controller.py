import os
import uuid

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from App.Modulo_Cursos.config.config import settings
from App.Modulo_Cursos.controllers.accidente_controller import _obtener_o_404
from App.Modulo_Cursos.controllers.documento_controller import MAX_FILE_SIZE, _detectar_tipo_real
from App.Modulo_Cursos.models.evidencia_incidente_model import EvidenciaIncidente
from App.Modulo_Cursos.utils.response import api_response


def _serializar(item: EvidenciaIncidente) -> dict:
    return {
        "id_evidencia": item.id_evidencia,
        "id_accidente": item.id_accidente,
        "nombre": item.nombre,
        "tipo": item.tipo,
        "fecha_subida": item.fecha_subida,
    }


def subir_evidencia(db: Session, id_accidente: int, file: UploadFile, nombre: str) -> dict:
    _obtener_o_404(db, id_accidente)

    contenido = file.file.read(MAX_FILE_SIZE + 1)
    if len(contenido) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=api_response(
                success=False,
                message="No se pudo subir la evidencia",
                error="El archivo supera el tamaño máximo permitido (10 MB)"
            )
        )

    tipo_real = _detectar_tipo_real(contenido)
    if tipo_real is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=api_response(
                success=False,
                message="No se pudo subir la evidencia",
                error="Solo se permiten archivos PDF, JPG o PNG"
            )
        )
    content_type, extension = tipo_real

    carpeta = os.path.join(settings.UPLOADS_DIR, "incidentes", str(id_accidente))
    os.makedirs(carpeta, exist_ok=True)

    nombre_archivo = f"{uuid.uuid4().hex}{extension}"
    ruta_archivo = os.path.join(carpeta, nombre_archivo)

    with open(ruta_archivo, "wb") as destino:
        destino.write(contenido)

    nueva = EvidenciaIncidente(
        id_accidente=id_accidente,
        nombre=nombre,
        ruta_archivo=ruta_archivo,
        tipo=content_type,
    )
    db.add(nueva)
    db.commit()
    db.refresh(nueva)

    return api_response(
        success=True,
        message="Evidencia subida correctamente",
        data=_serializar(nueva)
    )


def listar_evidencias_por_incidente(db: Session, id_accidente: int) -> dict:
    _obtener_o_404(db, id_accidente)

    items = db.query(EvidenciaIncidente).filter(
        EvidenciaIncidente.id_accidente == id_accidente
    ).order_by(EvidenciaIncidente.fecha_subida.desc()).all()

    return api_response(
        success=True,
        message="Evidencias obtenidas correctamente",
        data=[_serializar(i) for i in items]
    )
