from sqlalchemy import Column, Integer, String
from App.Modulo_Cursos.config.database import Base

class Rol(Base):
    __tablename__ = "roles"

    id_rol = Column(Integer, primary_key=True, index=True)
    nombre_rol = Column(String(50), nullable=False)