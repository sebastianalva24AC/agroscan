from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.registro_campo import RegistroCampo
from app.models.cultivo import Cultivo
from app.services.roboflow_ia import analizar_imagen
from app.auth.jwt import get_current_user
import os, shutil, uuid

router = APIRouter()

UPLOAD_DIR = "uploads/fotos"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/{cultivo_id}/analizar")
async def analizar_foto(
    cultivo_id: int,
    latitud: float = None,
    longitud: float = None,
    observacion: str = None,
    foto: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    cultivo = db.query(Cultivo).filter(Cultivo.id == cultivo_id).first()
    if not cultivo:
        raise HTTPException(status_code=404, detail="Cultivo no encontrado")

    contenido = await foto.read()
    if len(contenido) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="La imagen no puede superar 10MB")

    nombre_archivo = f"{uuid.uuid4()}.jpg"
    ruta_archivo = f"{UPLOAD_DIR}/{nombre_archivo}"
    with open(ruta_archivo, "wb") as f:
        f.write(contenido)

    resultado_ia = analizar_imagen(contenido)

    registro = RegistroCampo(
        foto_url=ruta_archivo,
        diagnostico_ia=resultado_ia["diagnostico"],
        tipo_problema=resultado_ia["tipo_problema"],
        confianza_pct=resultado_ia["confianza_pct"],
        recomendacion=resultado_ia["recomendacion"],
        observacion=observacion,
        latitud=latitud,
        longitud=longitud,
        cultivo_id=cultivo_id,
        usuario_id=current_user["id"]
    )
    db.add(registro)
    db.commit()
    db.refresh(registro)

    return {
        "mensaje": "Análisis completado",
        "registro_id": registro.id,
        "resultado": resultado_ia
    }

@router.get("/{cultivo_id}/historial")
def historial_diagnosticos(
    cultivo_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    registros = db.query(RegistroCampo).filter(
        RegistroCampo.cultivo_id == cultivo_id
    ).order_by(RegistroCampo.fecha.desc()).all()

    return {
        "cultivo_id": cultivo_id,
        "total": len(registros),
        "registros": registros
    }