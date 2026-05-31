from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class ImagenSatelital(Base):
    __tablename__ = "imagenes_satelitales"

    id = Column(Integer, primary_key=True, index=True)
    url_imagen = Column(String(500))
    ndvi_promedio = Column(Numeric(5, 4))
    ndvi_max = Column(Numeric(5, 4))
    ndvi_min = Column(Numeric(5, 4))
    porcentaje_saludable = Column(Numeric(5, 2))
    porcentaje_observacion = Column(Numeric(5, 2))
    porcentaje_riesgo = Column(Numeric(5, 2))
    nubosidad_pct = Column(Numeric(5, 2))
    fecha_captura = Column(DateTime)
    campo_id = Column(Integer, ForeignKey("campos.id"))

    campo = relationship("Campo", backref="imagenes_satelitales")