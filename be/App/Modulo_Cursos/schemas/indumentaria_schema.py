from typing import Optional
from pydantic import BaseModel


class IndumentariaBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None


class IndumentariaCreate(IndumentariaBase):
    pass


class IndumentariaUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None


class IndumentariaResponse(IndumentariaBase):
    id_indumentaria: int

    class Config:
        from_attributes = True
