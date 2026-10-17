from pydantic import BaseModel
from typing import Optional

class CursoBase(BaseModel):
    nombre_curso: str
    intensidad_horaria: Optional[int] = None

class CursoResponse(CursoBase):
    id_curso: int

    class Config:
        from_attributes = True