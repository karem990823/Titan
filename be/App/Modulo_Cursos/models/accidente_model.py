from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey
from sqlalchemy.orm import relationship
from App.Modulo_Cursos.config.database import Base


class Accidente(Base):
    __tablename__ = "accidentes"

    id_accidente = Column(Integer, primary_key=True, index=True)
    fecha = Column(Date)
    lugar = Column(String(200))
    id_trabajador = Column(Integer, ForeignKey("usuarios.id_usuario"))
    id_tipo_accidente = Column(Integer, ForeignKey("tipos_accidente.id_tipo_accidente"))
    descripcion = Column(Text)

    trabajador = relationship("Usuario")
    tipo_accidente = relationship("TipoAccidente", back_populates="accidentes")
