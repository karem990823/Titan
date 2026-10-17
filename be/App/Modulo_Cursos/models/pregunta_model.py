from sqlalchemy import Column, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from App.Modulo_Cursos.config.database import Base


class Pregunta(Base):
    __tablename__ = "preguntas"

    id_pregunta = Column(Integer, primary_key=True, index=True)
    pregunta = Column(Text)
    id_evaluacion = Column(Integer, ForeignKey("evaluaciones.id_evaluacion"))

    evaluacion = relationship("Evaluacion", back_populates="preguntas")
    respuestas = relationship("Respuesta", back_populates="pregunta", cascade="all, delete-orphan")
