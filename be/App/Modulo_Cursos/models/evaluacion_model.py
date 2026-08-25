from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from App.Modulo_Cursos.config.database import Base


class Evaluacion(Base):
    __tablename__ = "evaluaciones"

    id_evaluacion = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100))

    preguntas = relationship("Pregunta", back_populates="evaluacion", cascade="all, delete-orphan")
    presentaciones = relationship("EvaluacionPresentada", back_populates="evaluacion")
