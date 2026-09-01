from typing import Optional
from pydantic import BaseModel, Field


class IndumentariaBase(BaseModel):
    nombre: str = Field(min_length=1)
    descripcion: Optional[str] = None


class IndumentariaCreate(IndumentariaBase):
    pass


class IndumentariaUpdate(BaseModel):
    nombre: Optional[str] = Field(default=None, min_length=1)
    descripcion: Optional[str] = None


class IndumentariaResponse(IndumentariaBase):
    id_indumentaria: int

    class Config:
        from_attributes = True
