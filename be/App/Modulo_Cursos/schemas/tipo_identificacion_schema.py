from pydantic import BaseModel

class TipoIdentificacionBase(BaseModel):
    nombre: str

class TipoIdentificacionResponse(TipoIdentificacionBase):
    id_tipo: int

    class Config:
        from_attributes = True