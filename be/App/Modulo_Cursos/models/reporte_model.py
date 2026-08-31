from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship
from App.Modulo_Cursos.config.database import Base


class Reporte(Base):
    __tablename__ = "reportes"

    id_reporte = Column(Integer, primary_key=True, index=True)
    tipo = Column(String(20))
    fecha = Column(Date)
    contenido_json = Column(Text)
    generado_por = Column(Integer, ForeignKey("usuarios.id_usuario"))
    fecha_creacion = Column(DateTime, server_default=func.now())

    usuario = relationship("Usuario")
