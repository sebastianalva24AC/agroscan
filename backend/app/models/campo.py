from sqlalchemy import Column, Integer, String, Boolean, DateTime, Numeric, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Campo(Base):
    __tablename__ = "campos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(200), nullable=False)
    latitud = Column(Numeric(10, 7), nullable=False)
    longitud = Column(Numeric(10, 7), nullable=False)
    hectareas = Column(Numeric(10, 2))
    region = Column(String(100))
    zona = Column(String(50))
    empresa_id = Column(Integer, ForeignKey("empresas.id"))
    activo = Column(Boolean, default=True)
    fecha_registro = Column(DateTime, server_default=func.now())

    empresa = relationship("Empresa", backref="campos")