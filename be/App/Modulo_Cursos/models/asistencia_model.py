from sqlalchemy import Column, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from App.Modulo_Cursos.config.database import Base


class Asistencia(Base):
    __tablename__ = "asistencias"

    id_asistencia = Column(Integer, primary_key=True, index=True)
    id_inscripcion = Column(Integer, ForeignKey("inscripciones.id_inscripcion"))
    asistio = Column(Boolean)

    inscripcion = relationship("Inscripcion")
