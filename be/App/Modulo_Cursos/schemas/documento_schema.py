from datetime import datetime

from pydantic import BaseModel


class DocumentoResponse(BaseModel):
    id_documento: int
    nombre: str
    descripcion: str | None
    id_usuario: int | None
    fecha_subida: datetime | None
    # Nunca se expone ruta_archivo (ruta real en el filesystem del servidor):
    # la descarga se hace por id_documento a través de un endpoint controlado.

    class Config:
        from_attributes = True
