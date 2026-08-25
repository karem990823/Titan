from typing import Literal, Optional

from pydantic import BaseModel, EmailStr


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
    nombre: str
    apellido: Optional[str] = None
    id_tipo: Optional[int] = None
    numero_identificacion: Optional[int] = None
    nit: Optional[int] = None
    direccion: Optional[str] = None
    telefono: Optional[int] = None
    correo: EmailStr
    password: str
    id_rol: int
    id_empresa: Optional[int] = None


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
