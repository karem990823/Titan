from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from App.Modulo_Cursos.config.database import Base

class Curso(Base):
    __tablename__ = "cursos"

    id_curso = Column(Integer, primary_key=True, index=True)
    nombre_curso = Column(String(100))
    intensidad_horaria = Column(Integer)

    programaciones = relationship(
        "ProgramacionCurso",
        back_populates="curso"
    )