from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Comprador(Base):
    __tablename__ = "compradores"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(200), nullable=False)
    pais = Column(String(100))
    email = Column(String(200), unique=True)
    empresa = Column(String(200))
    activo = Column(Boolean, default=True)
    fecha_registro = Column(DateTime, server_default=func.now())