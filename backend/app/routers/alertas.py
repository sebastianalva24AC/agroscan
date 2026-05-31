from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.alerta import Alerta
from app.models.campo import Campo
from app.auth.jwt import get_current_user

router = APIRouter()

@router.get("/")
def listar_alertas(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    campos = db.query(Campo).filter(
        Campo.empresa_id == current_user.get("empresa_id")
    ).all()
    campo_ids = [c.id for c in campos]

    alertas = db.query(Alerta).filter(
        Alerta.campo_id.in_(campo_ids)
    ).order_by(Alerta.fecha.desc()).all()

    return alertas

@router.get("/no-leidas")
def alertas_no_leidas(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    campos = db.query(Campo).filter(
        Campo.empresa_id == current_user.get("empresa_id")
    ).all()
    campo_ids = [c.id for c in campos]

    alertas = db.query(Alerta).filter(
        Alerta.campo_id.in_(campo_ids),
        Alerta.leida == False
    ).order_by(Alerta.fecha.desc()).all()

    return {"total": len(alertas), "alertas": alertas}

@router.post("/")
def crear_alerta(
    tipo: str,
    descripcion: str,
    nivel: str,
    campo_id: int,
    cultivo_id: int = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    alerta = Alerta(
        tipo=tipo,
        descripcion=descripcion,
        nivel=nivel,
        campo_id=campo_id,
        cultivo_id=cultivo_id
    )
    db.add(alerta)
    db.commit()
    db.refresh(alerta)
    return {"mensaje": "Alerta creada", "alerta_id": alerta.id}

@router.put("/{alerta_id}/leer")
def marcar_leida(
    alerta_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    alerta = db.query(Alerta).filter(Alerta.id == alerta_id).first()
    if not alerta:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    alerta.leida = True
    db.commit()
    return {"mensaje": "Alerta marcada como leída"}

@router.put("/{alerta_id}/resolver")
def resolver_alerta(
    alerta_id: int,
    accion_tomada: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    alerta = db.query(Alerta).filter(Alerta.id == alerta_id).first()
    if not alerta:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    alerta.resuelta = True
    alerta.leida = True
    alerta.accion_tomada = accion_tomada
    db.commit()
    return {"mensaje": "Alerta resuelta correctamente"}