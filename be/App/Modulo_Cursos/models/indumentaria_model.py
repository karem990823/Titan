from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from App.Modulo_Cursos.config.database import Base


class Indumentaria(Base):
    __tablename__ = "indumentaria"

    id_indumentaria = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100))
    descripcion = Column(String(200))

    inspecciones = relationship("InspeccionIndumentaria", back_populates="indumentaria")
    certificados_equipo = relationship("CertificadoIndumentaria", back_populates="indumentaria")
