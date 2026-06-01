from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.campo import Campo
from app.models.imagen_satelital import ImagenSatelital
from app.auth.jwt import get_current_user
from app.services.sentinel import get_ndvi_campo
from datetime import datetime

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

    try:
        ndvi_data = get_ndvi_campo(
            float(campo.latitud),
            float(campo.longitud),
            campo.nombre
        )

        if ndvi_data and ndvi_data.get('ndvi_promedio'):
            try:
                imagen = ImagenSatelital(
                    campo_id=campo_id,
                    ndvi_promedio=ndvi_data['ndvi_promedio'],
                    ndvi_max=ndvi_data['ndvi_max'],
                    ndvi_min=ndvi_data['ndvi_min'],
                    porcentaje_saludable=ndvi_data['porcentaje_saludable'],
                    porcentaje_observacion=ndvi_data['porcentaje_observacion'],
                    porcentaje_riesgo=ndvi_data['porcentaje_riesgo'],
                    nubosidad_pct=ndvi_data['nubosidad_pct'],
                    fecha_captura=datetime.now()
                )
                db.add(imagen)
                db.commit()
                print(f"NDVI guardado en BD para campo {campo_id}")
            except Exception as db_error:
                print(f"Error guardando en BD: {db_error}")
                db.rollback()

            return {
                'campo': campo.nombre,
                'ndvi_promedio': ndvi_data['ndvi_promedio'],
                'ndvi_max': ndvi_data['ndvi_max'],
                'ndvi_min': ndvi_data['ndvi_min'],
                'porcentaje_saludable': ndvi_data['porcentaje_saludable'],
                'porcentaje_observacion': ndvi_data['porcentaje_observacion'],
                'porcentaje_riesgo': ndvi_data['porcentaje_riesgo'],
                'fuente': ndvi_data['fuente'],
                'fecha': ndvi_data['fecha'],
                'estado': 'disponible'
            }

    except Exception as e:
        print(f"Error en endpoint NDVI: {e}")

    return {
        'campo': campo.nombre,
        'mensaje': 'Datos satelitales no disponibles temporalmente',
        'estado': 'sin_datos'
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