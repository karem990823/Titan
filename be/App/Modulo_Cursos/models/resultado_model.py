from sqlalchemy import Column, Integer, DECIMAL, ForeignKey
from sqlalchemy.orm import relationship
from App.Modulo_Cursos.config.database import Base


class Resultado(Base):
    __tablename__ = "resultados"

    id_resultado = Column(Integer, primary_key=True, index=True)
    id_presentada = Column(Integer, ForeignKey("evaluaciones_presentadas.id_presentada"))
    puntaje = Column(DECIMAL(5, 2))

    presentada = relationship("EvaluacionPresentada", back_populates="resultado")
