from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from App.Modulo_Cursos.config.database import Base


class InspeccionIndumentaria(Base):
    __tablename__ = "inspecciones_indumentaria"

    id_inspeccion = Column(Integer, primary_key=True, index=True)
    fecha = Column(Date)
    id_indumentaria = Column(Integer, ForeignKey("indumentaria.id_indumentaria"))
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))
    observaciones = Column(String(200))

    indumentaria = relationship("Indumentaria", back_populates="inspecciones")
    usuario = relationship("Usuario")
