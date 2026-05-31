from sqlalchemy import Column, Integer, String, Date, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Lote(Base):
    __tablename__ = "lotes"

    id = Column(Integer, primary_key=True, index=True)
    numero_lote = Column(String(100), unique=True, nullable=False)
    fecha_cosecha = Column(Date, nullable=False)
    volumen_kg = Column(Numeric(10, 2))
    calidad = Column(String(50))
    destino_pais = Column(String(100))
    empresa_compradora = Column(String(200))
    estado = Column(String(50), default="pendiente")
    cultivo_id = Column(Integer, ForeignKey("cultivos.id"))

    cultivo = relationship("Cultivo", backref="lotes")