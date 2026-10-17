from sqlalchemy import Column, Integer, Date, Enum, Float, ForeignKey, func
from sqlalchemy.orm import relationship
from App.Modulo_Cursos.config.database import Base

class Inscripcion(Base):
    __tablename__ = "inscripciones"

    id_inscripcion = Column(Integer, primary_key=True, index=True)
    id_programacion = Column(Integer, ForeignKey("programacion_cursos.id_programacion"))
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))
    estado = Column(Enum('inscrito', 'cancelado'), default='inscrito')
    fecha_inscripcion = Column(Date, server_default=func.current_date())
    nota_teorica = Column(Float, nullable=True)
    nota_practica = Column(Float, nullable=True)

    programacion = relationship("ProgramacionCurso", back_populates="participantes")
    usuario = relationship("Usuario", back_populates="inscripciones")