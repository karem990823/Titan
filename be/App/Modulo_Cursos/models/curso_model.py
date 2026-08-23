from sqlalchemy import Column, Integer, String, Date, Time, ForeignKey, Enum, Boolean, Float, BigInteger, func
from sqlalchemy.orm import relationship
from App.Modulo_Cursos.config.database import Base

class Rol(Base):
    __tablename__ = "roles"
    id_rol = Column(Integer, primary_key=True, index=True)
    nombre_rol = Column(String(50), nullable=False)

class TipoIdentificacion(Base):
    __tablename__ = "tipo_identificacion"
    id_tipo = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(20), nullable=False)

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

class Salud(Base):
    __tablename__ = "salud"
    id_salud = Column(Integer, primary_key=True, index=True)
    apto = Column(Enum('SI', 'NO'))
    fecha_vencimiento = Column(Date)
    id_trabajador = Column(Integer, ForeignKey("usuarios.id_usuario"))
    trabajador = relationship("Usuario", back_populates="examenes_salud")

class Curso(Base):
    __tablename__ = "cursos"
    id_curso = Column(Integer, primary_key=True, index=True)
    nombre_curso = Column(String(100))
    intensidad_horaria = Column(Integer)
    
    programaciones = relationship("ProgramacionCurso", back_populates="curso")

class ProgramacionCurso(Base):
    __tablename__ = "programacion_cursos"
    id_programacion = Column(Integer, primary_key=True, index=True)
    id_curso = Column(Integer, ForeignKey("cursos.id_curso"))
    fecha = Column(Date)
    hora = Column(Time) # Según tu SQL es 'hora'
    cupos = Column(Integer)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario")) # Instructor

    curso = relationship("Curso", back_populates="programaciones")
    instructor = relationship("Usuario")
    participantes = relationship("Inscripcion", back_populates="programacion")

class Inscripcion(Base):
    __tablename__ = "inscripciones"
    id_inscripcion = Column(Integer, primary_key=True, index=True)
    id_programacion = Column(Integer, ForeignKey("programacion_cursos.id_programacion"))
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))
    estado = Column(Enum('inscrito', 'cancelado'), default='inscrito')
    fecha_inscripcion = Column(Date, server_default=func.current_date())
    nota_teorica = Column(Float, nullable=True)
    nota_practica = Column(Float, nullable=True)

    programacion = relationship("ProgramacionCurso", back_populates="participantes")
    usuario = relationship("Usuario", back_populates="inscripciones")

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