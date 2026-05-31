from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Alerta(Base):
    __tablename__ = "alertas"

    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=False)
    nivel = Column(String(50))
    fecha = Column(DateTime, server_default=func.now())
    leida = Column(Boolean, default=False)
    resuelta = Column(Boolean, default=False)
    accion_tomada = Column(Text)
    campo_id = Column(Integer, ForeignKey("campos.id"))
    cultivo_id = Column(Integer, ForeignKey("cultivos.id"), nullable=True)

    campo = relationship("Campo", backref="alertas")
    cultivo = relationship("Cultivo", backref="alertas")