from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from app.database import get_db
from app.models.cultivo import Cultivo
from app.models.campo import Campo
from app.auth.jwt import get_current_user
from app.services.prediccion import calcular_fecha_cosecha

router = APIRouter()

@router.post("/")
def crear_cultivo(
    tipo_planta: str,
    variedad: str,
    fecha_siembra: date,
    campo_id: int,
    temporada: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    campo = db.query(Campo).filter(Campo.id == campo_id).first()
    if not campo:
        raise HTTPException(status_code=404, detail="Campo no encontrado")

    cultivo = Cultivo(
        tipo_planta=tipo_planta,
        variedad=variedad,
        fecha_siembra=fecha_siembra,
        campo_id=campo_id,
        usuario_responsable_id=current_user["id"],
        temporada=temporada
    )
    db.add(cultivo)
    db.commit()
    db.refresh(cultivo)
    return {
        "mensaje": "Cultivo registrado exitosamente",
        "cultivo_id": cultivo.id,
        "tipo_planta": cultivo.tipo_planta,
        "fecha_siembra": str(cultivo.fecha_siembra)
    }

@router.get("/")
def listar_cultivos(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    cultivos = db.query(Cultivo).join(Campo).filter(
        Campo.empresa_id == current_user.get("empresa_id"),
        Cultivo.activo == True
    ).all()
    return cultivos

@router.get("/{cultivo_id}")
def obtener_cultivo(
    cultivo_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    cultivo = db.query(Cultivo).filter(Cultivo.id == cultivo_id).first()
    if not cultivo:
        raise HTTPException(status_code=404, detail="Cultivo no encontrado")
    return cultivo

@router.put("/{cultivo_id}/estado")
def actualizar_estado_cultivo(
    cultivo_id: int,
    estado: str,
    fecha_estimada_cosecha: date = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    cultivo = db.query(Cultivo).filter(Cultivo.id == cultivo_id).first()
    if not cultivo:
        raise HTTPException(status_code=404, detail="Cultivo no encontrado")

    cultivo.estado = estado
    if fecha_estimada_cosecha:
        cultivo.fecha_estimada_cosecha = fecha_estimada_cosecha

    db.commit()
    return {"mensaje": "Estado actualizado", "estado": estado}

@router.get("/{cultivo_id}/prediccion-cosecha")
def prediccion_cosecha(
    cultivo_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    cultivo = db.query(Cultivo).filter(Cultivo.id == cultivo_id).first()
    if not cultivo:
        raise HTTPException(status_code=404, detail="Cultivo no encontrado")

    resultado = calcular_fecha_cosecha(
        tipo_planta=cultivo.tipo_planta,
        variedad=cultivo.variedad or "default",
        fecha_siembra=cultivo.fecha_siembra,
        campo_id=cultivo.campo_id,
        db=db
    )
    return resultado