from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Certificado(Base):
    __tablename__ = "certificados"

    id = Column(Integer, primary_key=True, index=True)
    qr_url = Column(String(500))
    qr_codigo = Column(String(200), unique=True)
    pdf_url = Column(String(500))
    historial_json = Column(Text)
    fecha_generacion = Column(DateTime, server_default=func.now())
    valido = Column(Boolean, default=True)
    lote_id = Column(Integer, ForeignKey("lotes.id"))

    lote = relationship("Lote", backref="certificados")