from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from App.Modulo_Cursos.config.database import Base


class TipoAccidente(Base):
    __tablename__ = "tipos_accidente"

    id_tipo_accidente = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100))

    accidentes = relationship("Accidente", back_populates="tipo_accidente")
