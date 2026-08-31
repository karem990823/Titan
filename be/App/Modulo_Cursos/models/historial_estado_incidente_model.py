from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, func
from sqlalchemy.orm import relationship
from App.Modulo_Cursos.config.database import Base


class HistorialEstadoIncidente(Base):
    __tablename__ = "historial_estado_incidente"

    id_historial = Column(Integer, primary_key=True, index=True)
    id_accidente = Column(Integer, ForeignKey("accidentes.id_accidente"))
    estado_anterior = Column(Enum("abierto", "en_seguimiento", "cerrado"))
    estado_nuevo = Column(Enum("abierto", "en_seguimiento", "cerrado"))
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))
    fecha = Column(DateTime, server_default=func.now())

    usuario = relationship("Usuario")
