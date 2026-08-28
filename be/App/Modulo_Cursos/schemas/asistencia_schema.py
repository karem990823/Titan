from pydantic import BaseModel


class AsistenciaItem(BaseModel):
    id_inscripcion: int
    asistio: bool


class AsistenciaMarcarRequest(BaseModel):
    asistencias: list[AsistenciaItem]
