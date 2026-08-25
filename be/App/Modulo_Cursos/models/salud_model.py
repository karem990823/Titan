from sqlalchemy import Column, Integer, Date, Enum, ForeignKey
from sqlalchemy.orm import relationship
from App.Modulo_Cursos.config.database import Base

class Salud(Base):
    __tablename__ = "salud"

    id_salud = Column(Integer, primary_key=True, index=True)
    apto = Column(Enum('SI', 'NO'))
    fecha_vencimiento = Column(Date)
    id_trabajador = Column(Integer, ForeignKey("usuarios.id_usuario"))

    trabajador = relationship("Usuario", back_populates="examenes_salud")