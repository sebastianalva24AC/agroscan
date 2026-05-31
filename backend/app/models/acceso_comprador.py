from sqlalchemy import Column, Integer, Boolean, Date, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class AccesoComprador(Base):
    __tablename__ = "accesos_compradores"

    id = Column(Integer, primary_key=True, index=True)
    comprador_id = Column(Integer, ForeignKey("compradores.id"))
    empresa_id = Column(Integer, ForeignKey("empresas.id"))
    activo = Column(Boolean, default=True)
    fecha_inicio = Column(Date, server_default=func.current_date())
    fecha_fin = Column(Date, nullable=True)

    comprador = relationship("Comprador", backref="accesos")
    empresa = relationship("Empresa", backref="accesos_compradores")