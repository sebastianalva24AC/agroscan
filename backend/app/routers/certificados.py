from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.certificado import Certificado
from app.models.lote import Lote
from app.models.cultivo import Cultivo
from app.models.campo import Campo
from app.auth.jwt import get_current_user

router = APIRouter()

@router.get("/")
def listar_certificados(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    certificados = db.query(Certificado).join(
        Lote, Certificado.lote_id == Lote.id
    ).join(
        Cultivo, Lote.cultivo_id == Cultivo.id
    ).join(
        Campo, Cultivo.campo_id == Campo.id
    ).filter(
        Campo.empresa_id == current_user.get("empresa_id"),
        Certificado.valido == True
    ).all()
    return certificados

@router.get("/{codigo_qr}")
def verificar_certificado(
    codigo_qr: str,
    db: Session = Depends(get_db)
):
    certificado = db.query(Certificado).filter(
        Certificado.qr_codigo == codigo_qr,
        Certificado.valido == True
    ).first()
    if not certificado:
        raise HTTPException(
            status_code=404,
            detail="Certificado no encontrado o inválido"
        )
    return {
        "valido": True,
        "certificado_id": certificado.id,
        "fecha_generacion": str(certificado.fecha_generacion),
        "historial": certificado.historial_json,
        "pdf_url": certificado.pdf_url
    }

@router.get("/comprador/mis-certificados")
def certificados_comprador(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user["rol"] != "comprador_extranjero":
        raise HTTPException(
            status_code=403,
            detail="Solo los compradores pueden acceder a esta vista"
        )
    certificados = db.query(Certificado).filter(
        Certificado.valido == True
    ).order_by(Certificado.fecha_generacion.desc()).all()
    return certificados