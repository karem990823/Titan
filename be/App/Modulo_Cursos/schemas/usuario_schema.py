from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator

BIGINT_MAX = 9223372036854775807  # máximo de la columna BIGINT de MySQL



class UsuarioBase(BaseModel):
    nombre: str
    apellido: str
    correo: str

class UsuarioResponse(UsuarioBase):
    id_usuario: int

    class Config:
        from_attributes = True


# --- Gestión de cuentas (solo Administrador) ---

class UsuarioCreate(BaseModel):
    tipo_registro: Literal["empresa", "trabajador", "usuario"]
    nombre: str = Field(max_length=150)
    apellido: Optional[str] = Field(default=None, max_length=150)
    id_tipo: Optional[int] = None
    numero_identificacion: Optional[int] = Field(default=None, le=BIGINT_MAX)
    nit: Optional[int] = Field(default=None, le=BIGINT_MAX)
    direccion: Optional[str] = Field(default=None, max_length=200)
    telefono: Optional[int] = Field(default=None, le=BIGINT_MAX)
    correo: EmailStr
    id_rol: int
    id_empresa: Optional[int] = None

    @field_validator("correo")
    @classmethod
    def _correo_cabe_en_la_columna(cls, valor: str) -> str:
        if len(valor) > 100:
            raise ValueError("El correo no puede superar los 100 caracteres")
        return valor

    @model_validator(mode="after")
    def _validar_identificacion_empresa(self):
        # "empresa" cubre tanto empresas reales (NIT) como independientes
        # (documento personal) — cualquiera de las dos identifica la cuenta,
        # pero no puede quedar sin ninguna.
        if self.tipo_registro == "empresa":
            tiene_nit = self.nit is not None
            tiene_documento = self.id_tipo is not None and self.numero_identificacion is not None
            if not tiene_nit and not tiene_documento:
                raise ValueError(
                    "Una cuenta de empresa necesita NIT, o tipo y número de documento si es independiente"
                )
        return self


class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    id_tipo: Optional[int] = None
    numero_identificacion: Optional[int] = None
    nit: Optional[int] = None
    direccion: Optional[str] = None
    telefono: Optional[int] = None
    correo: Optional[EmailStr] = None
    password: Optional[str] = None
    id_rol: Optional[int] = None
    id_empresa: Optional[int] = None
    estado_activo: Optional[bool] = None


class UsuarioAdminResponse(BaseModel):
    id_usuario: int
    tipo_registro: str
    nombre: str
    apellido: Optional[str]
    correo: Optional[str]
    id_rol: Optional[int]
    rol_nombre: Optional[str]
    id_empresa: Optional[int]
    estado_activo: bool

    class Config:
        from_attributes = True


# --- Auto-registro de trabajadores por parte de una Empresa ---
# Deliberadamente sin id_empresa/id_rol/password/correo: el controller los
# fuerza server-side para que una empresa nunca pueda registrar un trabajador
# a nombre de otra ni crear una cuenta con acceso al sistema.

class TrabajadorSelfCreate(BaseModel):
    nombre: str
    apellido: str
    id_tipo: int
    numero_identificacion: int
    direccion: Optional[str] = None
    telefono: Optional[int] = None


class TrabajadorResponse(BaseModel):
    id_usuario: int
    nombre: str
    apellido: Optional[str]
    numero_identificacion: Optional[int]
    tipo_documento: Optional[str] = None

    class Config:
        from_attributes = True
