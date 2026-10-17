from sqlalchemy import Column, Integer, Date, DECIMAL, ForeignKey
from sqlalchemy.orm import relationship
from App.Modulo_Cursos.config.database import Base


class Pago(Base):
    __tablename__ = "pagos"

    id_pago = Column(Integer, primary_key=True, index=True)
    fecha = Column(Date)
    monto = Column(DECIMAL(10, 2))
    id_factura = Column(Integer, ForeignKey("facturas.id_factura", ondelete="RESTRICT"))
    id_metodo = Column(Integer, ForeignKey("metodo_pago.id_metodo"))

    factura = relationship("Factura", back_populates="pagos")
    metodo_pago = relationship("MetodoPago", back_populates="pagos")
