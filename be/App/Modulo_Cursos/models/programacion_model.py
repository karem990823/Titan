from sqlalchemy import Column, Integer, Date, Time, ForeignKey
from sqlalchemy.orm import relationship
from App.Modulo_Cursos.config.database import Base

class ProgramacionCurso(Base):
    __tablename__ = "programacion_cursos"

    id_programacion = Column(Integer, primary_key=True, index=True)
    id_curso = Column(Integer, ForeignKey("cursos.id_curso"))
    fecha = Column(Date)
    hora = Column(Time)
    cupos = Column(Integer)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))

    curso = relationship("Curso", back_populates="programaciones")
    instructor = relationship("Usuario")
    participantes = relationship("Inscripcion", back_populates="programacion")