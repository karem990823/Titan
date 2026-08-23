from pydantic import BaseModel
from datetime import date, time
from typing import Optional

class ProgramacionBase(BaseModel):
    id_curso: int
    fecha: date
    hora: time
    cupos: int
    id_usuario: int

class InscripcionBase(BaseModel):
    id_usuario: int

# --- NUEVOS SCHEMAS ---

class InstructorRead(BaseModel):
    id_usuario: int
    nombre: str
    apellido: str
    numero_identificacion: int
    tipo_documento: str

    class Config:
        from_attributes = True

class ParticipanteRead(BaseModel):
    id_usuario: int
    nombre: str
    apellido: str
    numero_identificacion: int
    tipo_documento: str

    class Config:
        from_attributes = True

class CursoRead(BaseModel):
    id_curso: int
    nombre_curso: str
    intensidad_horaria: Optional[int]

    class Config:
        from_attributes = True

class ProgramacionRead(BaseModel):
    id_programacion: int
    fecha: date
    hora: time
    cupos: int
    nombre_curso: str
    instructor_nombre: str

    class Config:
        from_attributes = True

class TipoDocumentoRead(BaseModel):
    id_tipo: int
    nombre: str

    class Config:
        from_attributes = True