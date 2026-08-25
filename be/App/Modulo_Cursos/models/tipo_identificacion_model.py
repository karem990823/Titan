from sqlalchemy import Column, Integer, String
from App.Modulo_Cursos.config.database import Base

class TipoIdentificacion(Base):
    __tablename__ = "tipo_identificacion"

    id_tipo = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(20), nullable=False)