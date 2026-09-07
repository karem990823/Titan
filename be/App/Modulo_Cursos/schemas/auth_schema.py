from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    correo: EmailStr
    password: str


class OlvidePasswordRequest(BaseModel):
    correo: EmailStr


class RestablecerPasswordRequest(BaseModel):
    token: str
    password: str = Field(min_length=8)


class UsuarioMeResponse(BaseModel):
    id_usuario: int
    nombre: str
    apellido: str | None
    correo: str | None
    tipo_registro: str
    id_rol: int | None
    rol_nombre: str | None
    id_empresa: int | None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioMeResponse
