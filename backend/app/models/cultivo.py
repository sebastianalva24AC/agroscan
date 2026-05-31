from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Cultivo(Base):
    __tablename__ = "cultivos"

    id = Column(Integer, primary_key=True, index=True)
    tipo_planta = Column(String(100), nullable=False)
    variedad = Column(String(100))
    fecha_siembra = Column(Date, nullable=False)
    fecha_estimada_cosecha = Column(Date, nullable=True)
    estado = Column(String(50), default="activo")
    campo_id = Column(Integer, ForeignKey("campos.id"))
    usuario_responsable_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    temporada = Column(String(50))
    activo = Column(Boolean, default=True)

    campo = relationship("Campo", backref="cultivos")
    responsable = relationship("Usuario", backref="cultivos")