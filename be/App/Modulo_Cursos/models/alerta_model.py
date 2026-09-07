from sqlalchemy import Column, Date, DateTime, Enum, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship
from App.Modulo_Cursos.config.database import Base


class Alerta(Base):
    __tablename__ = "alertas"

    id_alerta = Column(Integer, primary_key=True, index=True)
    id_tipo_alerta = Column(Integer, ForeignKey("tipos_alerta.id_tipo_alerta"))
    id_referencia = Column(Integer)
    mensaje = Column(String(255))
    fecha_vencimiento = Column(Date)
    estado = Column(Enum("pendiente", "enviada", "vencida"), default="pendiente")
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))
    fecha_creacion = Column(DateTime, server_default=func.now())

    usuario = relationship("Usuario")
    tipo_alerta = relationship("TipoAlerta")
