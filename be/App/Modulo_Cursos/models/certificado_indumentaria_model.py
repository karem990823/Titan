from sqlalchemy import Column, Integer, Date, Enum, ForeignKey
from sqlalchemy.orm import relationship
from App.Modulo_Cursos.config.database import Base


class CertificadoIndumentaria(Base):
    __tablename__ = "certificados_indumentaria"

    id_certificado_equipo = Column(Integer, primary_key=True, index=True)
    id_indumentaria = Column(Integer, ForeignKey("indumentaria.id_indumentaria"))
    fecha_emision = Column(Date)
    fecha_vencimiento = Column(Date)
    estado = Column(Enum('apto', 'no_apto'))

    indumentaria = relationship("Indumentaria", back_populates="certificados_equipo")
