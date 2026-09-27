from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models.campo import Campo
from app.auth.jwt import get_current_user

router = APIRouter()

class CampoCreate(BaseModel):
    nombre: str
    latitud: float
    longitud: float
    hectareas: float
    region: str
    zona: str
    tipo_suelo: Optional[str] = None
    ph_suelo: Optional[float] = None
    topografia: Optional[str] = None
    nivel_nitrogeno: Optional[str] = None
    nivel_fosforo: Optional[str] = None
    nivel_potasio: Optional[str] = None
    plan_manejo: Optional[str] = None

class CampoUpdate(BaseModel):
    nombre: Optional[str] = None
    hectareas: Optional[float] = None
    tipo_suelo: Optional[str] = None
    ph_suelo: Optional[float] = None
    topografia: Optional[str] = None
    nivel_nitrogeno: Optional[str] = None
    nivel_fosforo: Optional[str] = None
    nivel_potasio: Optional[str] = None
    plan_manejo: Optional[str] = None

@router.post("/")
def crear_campo(
    datos: CampoCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user["rol"] != "gerente":
        raise HTTPException(status_code=403, detail="Solo el gerente puede crear campos")

    campo = Campo(
        nombre=datos.nombre,
        latitud=datos.latitud,
        longitud=datos.longitud,
        hectareas=datos.hectareas,
        region=datos.region,
        zona=datos.zona,
        empresa_id=current_user["empresa_id"],
        tipo_suelo=datos.tipo_suelo,
        ph_suelo=datos.ph_suelo,
        topografia=datos.topografia,
        nivel_nitrogeno=datos.nivel_nitrogeno,
        nivel_fosforo=datos.nivel_fosforo,
        nivel_potasio=datos.nivel_potasio,
        plan_manejo=datos.plan_manejo
    )
    db.add(campo)
    db.commit()
    db.refresh(campo)
    return {
        "mensaje": "Campo creado exitosamente",
        "campo_id": campo.id,
        "nombre": campo.nombre
    }

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
    datos: CampoUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user["rol"] != "gerente":
        raise HTTPException(status_code=403, detail="No autorizado")

    campo = db.query(Campo).filter(Campo.id == campo_id).first()
    if not campo:
        raise HTTPException(status_code=404, detail="Campo no encontrado")

    for key, value in datos.dict(exclude_none=True).items():
        setattr(campo, key, value)

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