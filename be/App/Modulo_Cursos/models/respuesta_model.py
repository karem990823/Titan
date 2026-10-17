from sqlalchemy import Column, Integer, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from App.Modulo_Cursos.config.database import Base


class Respuesta(Base):
    __tablename__ = "respuestas"

    id_respuesta = Column(Integer, primary_key=True, index=True)
    respuesta = Column(Text)
    es_correcta = Column(Boolean)
    id_pregunta = Column(Integer, ForeignKey("preguntas.id_pregunta", ondelete="CASCADE"))

    pregunta = relationship("Pregunta", back_populates="respuestas")
