from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.campo import Campo
from app.models.registro_clima import RegistroClima
from app.services.openweather import get_clima_actual, get_pronostico_7dias
from app.auth.jwt import get_current_user

router = APIRouter()

@router.get("/{campo_id}/actual")
def clima_actual(
    campo_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    campo = db.query(Campo).filter(Campo.id == campo_id).first()
    if not campo:
        raise HTTPException(status_code=404, detail="Campo no encontrado")

    clima = get_clima_actual(float(campo.latitud), float(campo.longitud))
    if not clima:
        raise HTTPException(status_code=503, detail="No se pudo obtener datos del clima")

    registro = RegistroClima(
        temperatura=clima["temperatura"],
        temperatura_min=clima["temperatura_min"],
        temperatura_max=clima["temperatura_max"],
        humedad=clima["humedad"],
        precipitacion=clima["precipitacion"],
        viento=clima["viento"],
        descripcion=clima["descripcion"],
        campo_id=campo_id
    )
    db.add(registro)
    db.commit()

    return {
        "campo": campo.nombre,
        "region": campo.region,
        "clima": clima
    }

@router.get("/{campo_id}/pronostico")
def pronostico_clima(
    campo_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    campo = db.query(Campo).filter(Campo.id == campo_id).first()
    if not campo:
        raise HTTPException(status_code=404, detail="Campo no encontrado")

    pronostico = get_pronostico_7dias(float(campo.latitud), float(campo.longitud))
    if not pronostico:
        raise HTTPException(status_code=503, detail="No se pudo obtener el pronóstico")

    return {
        "campo": campo.nombre,
        "pronostico_7_dias": pronostico
    }

@router.get("/{campo_id}/historial")
def historial_clima(
    campo_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    registros = db.query(RegistroClima).filter(
        RegistroClima.campo_id == campo_id
    ).order_by(RegistroClima.fecha.desc()).limit(30).all()

    return {
        "campo_id": campo_id,
        "total_registros": len(registros),
        "registros": registros
    }