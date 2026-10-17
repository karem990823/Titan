from pydantic import BaseModel

class InscripcionBase(BaseModel):
    id_usuario: int

class InscripcionResponse(BaseModel):
    id_inscripcion: int
    id_programacion: int
    id_usuario: int

    class Config:
        from_attributes = True