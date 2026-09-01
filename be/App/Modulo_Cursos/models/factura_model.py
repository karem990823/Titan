from sqlalchemy import Column, Integer, Date, String, ForeignKey
from sqlalchemy.orm import relationship
from App.Modulo_Cursos.config.database import Base


class Factura(Base):
    __tablename__ = "facturas"

    id_factura = Column(Integer, primary_key=True, index=True)
    fecha = Column(Date)
    id_empresa = Column(Integer, ForeignKey("usuarios.id_usuario"))
    numero_factura_externa = Column(String(50))

    empresa = relationship("Usuario")
    detalles = relationship("DetalleFactura", back_populates="factura", cascade="all, delete-orphan")
    pagos = relationship("Pago", back_populates="factura")
