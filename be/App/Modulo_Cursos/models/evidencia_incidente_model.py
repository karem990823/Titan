from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship
from App.Modulo_Cursos.config.database import Base


class EvidenciaIncidente(Base):
    __tablename__ = "evidencias_incidente"

    id_evidencia = Column(Integer, primary_key=True, index=True)
    id_accidente = Column(Integer, ForeignKey("accidentes.id_accidente"))
    nombre = Column(String(150))
    ruta_archivo = Column(String(300))
    tipo = Column(String(50))
    fecha_subida = Column(DateTime, server_default=func.now())

    accidente = relationship("Accidente")
