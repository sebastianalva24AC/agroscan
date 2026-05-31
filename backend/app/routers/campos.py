from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.campo import Campo
from app.models.cultivo import Cultivo
from app.auth.jwt import get_current_user

router = APIRouter()

@router.post("/")
def crear_campo(
    nombre: str,
    latitud: float,
    longitud: float,
    hectareas: float,
    region: str,
    zona: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user["rol"] != "gerente":
        raise HTTPException(status_code=403, detail="Solo el gerente puede crear campos")

    campo = Campo(
        nombre=nombre,
        latitud=latitud,
        longitud=longitud,
        hectareas=hectareas,
        region=region,
        zona=zona,
        empresa_id=current_user["empresa_id"]
    )
    db.add(campo)
    db.commit()
    db.refresh(campo)
    return {"mensaje": "Campo creado exitosamente", "campo_id": campo.id, "nombre": campo.nombre}

@router.get("/")
def listar_campos(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    empresa_id = current_user.get("empresa_id")
    campos = db.query(Campo).filter(
        Campo.empresa_id == empresa_id,
        Campo.activo == True
    ).all()
    return campos

@router.get("/{campo_id}")
def obtener_campo(
    campo_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    campo = db.query(Campo).filter(Campo.id == campo_id).first()
    if not campo:
        raise HTTPException(status_code=404, detail="Campo no encontrado")
    return campo

@router.put("/{campo_id}")
def actualizar_campo(
    campo_id: int,
    nombre: str = None,
    hectareas: float = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user["rol"] != "gerente":
        raise HTTPException(status_code=403, detail="No autorizado")

    campo = db.query(Campo).filter(Campo.id == campo_id).first()
    if not campo:
        raise HTTPException(status_code=404, detail="Campo no encontrado")

    if nombre:
        campo.nombre = nombre
    if hectareas:
        campo.hectareas = hectareas

    db.commit()
    db.refresh(campo)
    return {"mensaje": "Campo actualizado", "campo": campo.nombre}

@router.delete("/{campo_id}")
def eliminar_campo(
    campo_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user["rol"] != "gerente":
        raise HTTPException(status_code=403, detail="No autorizado")

    campo = db.query(Campo).filter(Campo.id == campo_id).first()
    if not campo:
        raise HTTPException(status_code=404, detail="Campo no encontrado")

    campo.activo = False
    db.commit()
    return {"mensaje": "Campo desactivado correctamente"}