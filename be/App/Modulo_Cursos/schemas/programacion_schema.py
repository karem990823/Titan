from pydantic import BaseModel
from datetime import date, time

class ProgramacionBase(BaseModel):
    id_curso: int
    fecha: date
    hora: time
    cupos: int
    id_usuario: int

class ProgramacionResponse(ProgramacionBase):
    id_programacion: int

    class Config:
        from_attributes = True