from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from App.Modulo_Cursos.config.database import Base

class Certificado(Base):
    __tablename__ = "certificados"

    id_certificado = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(20))
    fecha_emision = Column(Date)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))
    id_curso = Column(Integer, ForeignKey("cursos.id_curso"))
    fecha_vencimiento = Column(Date)

    usuario = relationship("Usuario")
    curso = relationship("Curso")