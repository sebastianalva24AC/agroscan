from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class RegistroClima(Base):
    __tablename__ = "registros_clima"

    id = Column(Integer, primary_key=True, index=True)
    temperatura = Column(Numeric(5, 2))
    temperatura_min = Column(Numeric(5, 2))
    temperatura_max = Column(Numeric(5, 2))
    humedad = Column(Numeric(5, 2))
    precipitacion = Column(Numeric(8, 2))
    viento = Column(Numeric(5, 2))
    indice_uv = Column(Numeric(4, 2))
    descripcion = Column(String(200))
    fecha = Column(DateTime, server_default=func.now())
    campo_id = Column(Integer, ForeignKey("campos.id"))

    campo = relationship("Campo", backref="registros_clima")