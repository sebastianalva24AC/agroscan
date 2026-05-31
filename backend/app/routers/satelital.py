from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.campo import Campo
from app.models.imagen_satelital import ImagenSatelital
from app.auth.jwt import get_current_user

router = APIRouter()

@router.get("/{campo_id}/ndvi")
def obtener_ndvi(
    campo_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    campo = db.query(Campo).filter(Campo.id == campo_id).first()
    if not campo:
        raise HTTPException(status_code=404, detail="Campo no encontrado")

    ultima_imagen = db.query(ImagenSatelital).filter(
        ImagenSatelital.campo_id == campo_id
    ).order_by(ImagenSatelital.fecha_captura.desc()).first()

    if not ultima_imagen:
        return {
            "campo": campo.nombre,
            "mensaje": "No hay imágenes satelitales disponibles aún",
            "ndvi_promedio": None,
            "estado": "sin_datos"
        }

    return {
        "campo": campo.nombre,
        "ndvi_promedio": float(ultima_imagen.ndvi_promedio or 0),
        "ndvi_max": float(ultima_imagen.ndvi_max or 0),
        "ndvi_min": float(ultima_imagen.ndvi_min or 0),
        "porcentaje_saludable": float(ultima_imagen.porcentaje_saludable or 0),
        "porcentaje_observacion": float(ultima_imagen.porcentaje_observacion or 0),
        "porcentaje_riesgo": float(ultima_imagen.porcentaje_riesgo or 0),
        "nubosidad": float(ultima_imagen.nubosidad_pct or 0),
        "fecha_captura": str(ultima_imagen.fecha_captura),
        "estado": "disponible"
    }

@router.get("/{campo_id}/historial")
def historial_satelital(
    campo_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    imagenes = db.query(ImagenSatelital).filter(
        ImagenSatelital.campo_id == campo_id
    ).order_by(ImagenSatelital.fecha_captura.desc()).limit(10).all()

    return {
        "campo_id": campo_id,
        "total": len(imagenes),
        "imagenes": imagenes
    }