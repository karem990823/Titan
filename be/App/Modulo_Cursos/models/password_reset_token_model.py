from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship
from App.Modulo_Cursos.config.database import Base


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id_token = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    token_hash = Column(String(64), nullable=False, unique=True, index=True)
    fecha_expiracion = Column(DateTime, nullable=False)
    usado = Column(Boolean, default=False)
    fecha_creacion = Column(DateTime, server_default=func.now())

    usuario = relationship("Usuario")
