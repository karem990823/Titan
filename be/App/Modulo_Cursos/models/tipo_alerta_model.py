from sqlalchemy import Column, Integer, String
from App.Modulo_Cursos.config.database import Base


class TipoAlerta(Base):
    __tablename__ = "tipos_alerta"

    id_tipo_alerta = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100))
