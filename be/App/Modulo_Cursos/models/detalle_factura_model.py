from sqlalchemy import Column, Integer, String, DECIMAL, ForeignKey
from sqlalchemy.orm import relationship
from App.Modulo_Cursos.config.database import Base


class DetalleFactura(Base):
    __tablename__ = "detalle_factura"

    id_detalle = Column(Integer, primary_key=True, index=True)
    id_factura = Column(Integer, ForeignKey("facturas.id_factura", ondelete="CASCADE"))
    descripcion = Column(String(100))
    valor = Column(DECIMAL(10, 2))

    factura = relationship("Factura", back_populates="detalles")
