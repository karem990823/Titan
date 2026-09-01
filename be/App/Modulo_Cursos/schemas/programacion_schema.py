from pydantic import BaseModel, Field
from datetime import date, time

class ProgramacionBase(BaseModel):
    id_curso: int
    fecha: date
    hora: time
    cupos: int = Field(gt=0)
    id_usuario: int

class ProgramacionResponse(ProgramacionBase):
    id_programacion: int

    class Config:
        from_attributes = True