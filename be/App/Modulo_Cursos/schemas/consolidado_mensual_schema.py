from pydantic import BaseModel, Field


class CierreMesRequest(BaseModel):
    mes: int = Field(ge=1, le=12)
    anio: int = Field(ge=2020, le=2100)
