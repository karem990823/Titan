from sqlalchemy import Column, Integer, String, Date, Enum, ForeignKey
from sqlalchemy.orm import relationship
from App.Modulo_Cursos.config.database import Base

class Salud(Base):
    __tablename__ = "salud"

    id_salud = Column(Integer, primary_key=True, index=True)
    apto = Column(Enum('SI', 'NO'))
    restricciones = Column(String(300))
    observaciones = Column(String(500))
    fecha_examen = Column(Date)
    fecha_vencimiento = Column(Date)
    id_trabajador = Column(Integer, ForeignKey("usuarios.id_usuario"))

    trabajador = relationship("Usuario", back_populates="examenes_salud")