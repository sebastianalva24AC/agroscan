from sqlalchemy import Column, Integer, String, DateTime, Numeric, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class RegistroCampo(Base):
    __tablename__ = "registros_campo"

    id = Column(Integer, primary_key=True, index=True)
    foto_url = Column(String(500))
    diagnostico_ia = Column(Text)
    tipo_problema = Column(String(100))
    confianza_pct = Column(Numeric(5, 2))
    recomendacion = Column(Text)
    observacion = Column(Text)
    latitud = Column(Numeric(10, 7))
    longitud = Column(Numeric(10, 7))
    fecha = Column(DateTime, server_default=func.now())
    cultivo_id = Column(Integer, ForeignKey("cultivos.id"))
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))

    cultivo = relationship("Cultivo", backref="registros")
    usuario = relationship("Usuario", backref="registros_campo")