from sqlalchemy import Column, Integer, Date, ForeignKey
from sqlalchemy.orm import relationship
from App.Modulo_Cursos.config.database import Base


class EvaluacionPresentada(Base):
    __tablename__ = "evaluaciones_presentadas"

    id_presentada = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))
    id_evaluacion = Column(Integer, ForeignKey("evaluaciones.id_evaluacion"))
    fecha = Column(Date)

    usuario = relationship("Usuario")
    evaluacion = relationship("Evaluacion", back_populates="presentaciones")
    resultado = relationship(
        "Resultado",
        back_populates="presentada",
        uselist=False,
        cascade="all, delete-orphan"
    )
