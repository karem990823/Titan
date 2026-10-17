from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from App.Modulo_Cursos.config.database import Base


class MetodoPago(Base):
    __tablename__ = "metodo_pago"

    id_metodo = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50))

    pagos = relationship("Pago", back_populates="metodo_pago")
