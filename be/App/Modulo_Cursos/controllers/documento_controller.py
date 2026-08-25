import os
import uuid

from fastapi import HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from App.Modulo_Cursos.config.config import settings
from App.Modulo_Cursos.models.documento_model import Documento
from App.Modulo_Cursos.models.usuario_model import Usuario
from App.Modulo_Cursos.utils.response import api_response

ALLOWED_CONTENT_TYPES = {"application/pdf", "image/jpeg", "image/png"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def _acceso_denegado() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=api_response(
            success=False,
            message="Acceso denegado",
            error="No tienes permiso para acceder a los documentos de este usuario"
        )
    )


def _obtener_trabajador_o_404(db: Session, id_usuario: int) -> Usuario:
    trabajador = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    if not trabajador:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=api_response(
                success=False,
                message="Usuario no encontrado",
                error="No existe un usuario con ese ID"
            )
        )
    return trabajador


def _validar_acceso(current_user: Usuario, trabajador: Usuario):
    rol_actual = current_user.rol.nombre_rol if current_user.rol else None
    if rol_actual == "Empresa" and trabajador.id_empresa != current_user.id_usuario:
        raise _acceso_denegado()


def _serializar(doc: Documento) -> dict:
    return {
        "id_documento": doc.id_documento,
        "nombre": doc.nombre,
        "descripcion": doc.descripcion,
        "id_usuario": doc.id_usuario,
        "fecha_subida": doc.fecha_subida,
    }


def subir_documento(
    db: Session,
    id_usuario: int,
    file: UploadFile,
    nombre: str,
    descripcion: str | None,
    current_user: Usuario,
) -> dict:
    trabajador = _obtener_trabajador_o_404(db, id_usuario)
    _validar_acceso(current_user, trabajador)

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=api_response(
                success=False,
                message="No se pudo subir el documento",
                error="Solo se permiten archivos PDF, JPG o PNG"
            )
        )

    contenido = file.file.read(MAX_FILE_SIZE + 1)
    if len(contenido) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=api_response(
                success=False,
                message="No se pudo subir el documento",
                error="El archivo supera el tamaño máximo permitido (10 MB)"
            )
        )

    carpeta_usuario = os.path.join(settings.UPLOADS_DIR, str(id_usuario))
    os.makedirs(carpeta_usuario, exist_ok=True)

    extension = os.path.splitext(file.filename or "")[1]
    nombre_archivo = f"{uuid.uuid4().hex}{extension}"
    ruta_archivo = os.path.join(carpeta_usuario, nombre_archivo)

    with open(ruta_archivo, "wb") as destino:
        destino.write(contenido)

    nuevo = Documento(
        nombre=nombre,
        descripcion=descripcion,
        ruta_archivo=ruta_archivo,
        id_usuario=id_usuario,
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    return api_response(
        success=True,
        message="Documento subido correctamente",
        data=_serializar(nuevo)
    )


def listar_documentos_por_usuario(db: Session, id_usuario: int, current_user: Usuario) -> dict:
    trabajador = _obtener_trabajador_o_404(db, id_usuario)
    _validar_acceso(current_user, trabajador)

    documentos = db.query(Documento).filter(
        Documento.id_usuario == id_usuario
    ).order_by(Documento.fecha_subida.desc()).all()

    return api_response(
        success=True,
        message="Documentos obtenidos correctamente",
        data=[_serializar(d) for d in documentos]
    )


def descargar_documento(db: Session, id_documento: int, current_user: Usuario) -> FileResponse:
    documento = db.query(Documento).filter(Documento.id_documento == id_documento).first()
    if not documento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=api_response(
                success=False,
                message="Documento no encontrado",
                error="No existe un documento con ese ID"
            )
        )

    if documento.usuario:
        _validar_acceso(current_user, documento.usuario)

    if not os.path.isfile(documento.ruta_archivo):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=api_response(
                success=False,
                message="Documento no encontrado",
                error="El archivo ya no está disponible en el servidor"
            )
        )

    return FileResponse(documento.ruta_archivo, filename=documento.nombre)
