from sqlalchemy import Column, Integer, String, ForeignKey, Enum, Boolean, BigInteger
from sqlalchemy.orm import relationship
from App.Modulo_Cursos.config.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id_usuario = Column(Integer, primary_key=True, index=True)
    tipo_registro = Column(Enum('empresa', 'trabajador', 'usuario'), nullable=False)
    nombre = Column(String(150))
    apellido = Column(String(150))
    id_tipo = Column(Integer, ForeignKey("tipo_identificacion.id_tipo"))
    numero_identificacion = Column(BigInteger)
    nit = Column(BigInteger)
    direccion = Column(String(200))
    telefono = Column(BigInteger)
    password_hash = Column(String(255))
    id_empresa = Column(Integer, ForeignKey("usuarios.id_usuario"))
    id_rol = Column(Integer, ForeignKey("roles.id_rol"))
    correo = Column(String(100))
    estado_activo = Column(Boolean, default=True)

    inscripciones = relationship("Inscripcion", back_populates="usuario")
    examenes_salud = relationship("Salud", back_populates="trabajador")
    tipo_documento = relationship("TipoIdentificacion")
    rol = relationship("Rol")