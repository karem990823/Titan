from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship
from App.Modulo_Cursos.config.database import Base


class ConsolidadoMensual(Base):
    __tablename__ = "consolidados_mensuales"

    id_consolidado = Column(Integer, primary_key=True, index=True)
    mes = Column(Integer)
    anio = Column(Integer)
    generado_por = Column(Integer, ForeignKey("usuarios.id_usuario"))
    fecha_creacion = Column(DateTime, server_default=func.now())

    usuario = relationship("Usuario")
    participantes = relationship(
        "ConsolidadoParticipante", back_populates="consolidado", cascade="all, delete-orphan"
    )


class ConsolidadoParticipante(Base):
    __tablename__ = "consolidado_participantes"

    id_consolidado_participante = Column(Integer, primary_key=True, index=True)
    id_consolidado = Column(Integer, ForeignKey("consolidados_mensuales.id_consolidado"))
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))
    id_curso = Column(Integer, ForeignKey("cursos.id_curso"))
    incluido = Column(Boolean)
    motivo_exclusion = Column(String(200))

    consolidado = relationship("ConsolidadoMensual", back_populates="participantes")
    trabajador = relationship("Usuario")
    curso = relationship("Curso")
