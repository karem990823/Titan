from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text, func
from App.Modulo_Cursos.config.database import Base


class SolicitudContacto(Base):
    __tablename__ = "solicitudes_contacto"

    id_solicitud = Column(Integer, primary_key=True, index=True)
    nombre_contacto = Column(String(150))
    empresa = Column(String(150))
    correo = Column(String(150))
    telefono = Column(String(30))
    tipo_servicio = Column(String(150))
    numero_personal = Column(Integer, nullable=True)
    detalle = Column(Text, nullable=True)
    atendida = Column(Boolean, default=False)
    fecha_creacion = Column(DateTime, server_default=func.now())
