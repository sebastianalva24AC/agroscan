from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Empresa(Base):
    __tablename__ = "empresas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(200), nullable=False)
    ruc = Column(String(11), unique=True)
    pais = Column(String(100), default="Peru")
    region = Column(String(100))
    plan = Column(String(50), default="basico")
    estado = Column(String(50), default="activo")
    fecha_registro = Column(DateTime, server_default=func.now())