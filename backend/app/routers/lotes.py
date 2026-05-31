from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
import uuid
from app.database import get_db
from app.models.lote import Lote
from app.models.certificado import Certificado
from app.models.cultivo import Cultivo
from app.models.campo import Campo
from app.models.registro_clima import RegistroClima
from app.models.registro_campo import RegistroCampo
from app.services.qr_generator import generar_qr, generar_certificado_pdf
from app.auth.jwt import get_current_user

router = APIRouter()

@router.post("/")
def registrar_lote(
    numero_lote: str,
    fecha_cosecha: date,
    volumen_kg: float,
    calidad: str,
    destino_pais: str,
    empresa_compradora: str,
    cultivo_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    cultivo = db.query(Cultivo).filter(Cultivo.id == cultivo_id).first()
    if not cultivo:
        raise HTTPException(status_code=404, detail="Cultivo no encontrado")

    lote = Lote(
        numero_lote=numero_lote,
        fecha_cosecha=fecha_cosecha,
        volumen_kg=volumen_kg,
        calidad=calidad,
        destino_pais=destino_pais,
        empresa_compradora=empresa_compradora,
        cultivo_id=cultivo_id,
        estado="pendiente"
    )
    db.add(lote)
    db.commit()
    db.refresh(lote)
    return {
        "mensaje": "Lote registrado exitosamente",
        "lote_id": lote.id,
        "numero_lote": lote.numero_lote
    }

@router.post("/{lote_id}/certificar")
def generar_certificado(
    lote_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    lote = db.query(Lote).filter(Lote.id == lote_id).first()
    if not lote:
        raise HTTPException(status_code=404, detail="Lote no encontrado")

    cultivo = db.query(Cultivo).filter(Cultivo.id == lote.cultivo_id).first()
    campo = db.query(Campo).filter(Campo.id == cultivo.campo_id).first()

    codigo_qr = str(uuid.uuid4())
    ruta_qr = f"uploads/qr/{codigo_qr}.png"
    ruta_pdf = f"uploads/certificados/{codigo_qr}.pdf"

    generar_qr(codigo_qr, ruta_qr)

    datos = {
        "numero_lote": lote.numero_lote,
        "empresa": campo.empresa_id,
        "tipo_planta": cultivo.tipo_planta,
        "variedad": cultivo.variedad,
        "region": campo.region,
        "fecha_siembra": cultivo.fecha_siembra,
        "fecha_cosecha": lote.fecha_cosecha,
        "volumen_kg": float(lote.volumen_kg),
        "calidad": lote.calidad,
        "destino_pais": lote.destino_pais
    }

    generar_certificado_pdf(datos, ruta_qr, ruta_pdf)

    certificado = Certificado(
        qr_url=ruta_qr,
        qr_codigo=codigo_qr,
        pdf_url=ruta_pdf,
        historial_json=str(datos),
        lote_id=lote_id,
        valido=True
    )
    db.add(certificado)

    lote.estado = "certificado"
    db.commit()
    db.refresh(certificado)

    return {
        "mensaje": "Certificado generado exitosamente",
        "certificado_id": certificado.id,
        "qr_codigo": codigo_qr,
        "pdf_url": ruta_pdf
    }

@router.get("/")
def listar_lotes(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    lotes = db.query(Lote).join(Cultivo).join(Campo).filter(
        Campo.empresa_id == current_user.get("empresa_id")
    ).all()
    return lotes

@router.get("/{lote_id}/certificado")
def ver_certificado(
    lote_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    certificado = db.query(Certificado).filter(
        Certificado.lote_id == lote_id,
        Certificado.valido == True
    ).first()
    if not certificado:
        raise HTTPException(status_code=404, detail="Certificado no encontrado")
    return certificado