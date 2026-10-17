from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship
from App.Modulo_Cursos.config.database import Base


class AuditoriaPersona(Base):
    """Un registro por cada campo modificado de una persona (HU 04, CA-03)."""

    __tablename__ = "auditoria_personas"

    id_auditoria = Column(Integer, primary_key=True, index=True)
    id_persona = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False, index=True)
    campo = Column(String(50), nullable=False)
    valor_anterior = Column(String(255))
    valor_nuevo = Column(String(255))
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    fecha = Column(DateTime, server_default=func.now())

    # Dos FK hacia usuarios: se indica cuál es el editor para evitar ambigüedad.
    editor = relationship("Usuario", foreign_keys=[id_usuario])
