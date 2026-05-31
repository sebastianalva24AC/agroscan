import qrcode
import os
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from io import BytesIO
import json

QR_DIR = "uploads/qr"
PDF_DIR = "uploads/certificados"
os.makedirs(QR_DIR, exist_ok=True)
os.makedirs(PDF_DIR, exist_ok=True)

def generar_qr(codigo: str, ruta: str) -> str:
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(codigo)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    img.save(ruta)
    return ruta

def generar_certificado_pdf(datos_lote: dict, ruta_qr: str, ruta_pdf: str) -> str:
    c = canvas.Canvas(ruta_pdf, pagesize=A4)
    ancho, alto = A4

    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(ancho/2, alto - 60, "CERTIFICADO DE TRAZABILIDAD")
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(ancho/2, alto - 85, "AgroScan - Sistema de Monitoreo Agrícola")

    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, alto - 130, "INFORMACIÓN DEL LOTE")
    c.setFont("Helvetica", 11)
    y = alto - 155
    campos_lote = [
        ("Número de Lote", datos_lote.get("numero_lote", "")),
        ("Empresa Productora", datos_lote.get("empresa", "")),
        ("Tipo de Cultivo", datos_lote.get("tipo_planta", "")),
        ("Variedad", datos_lote.get("variedad", "")),
        ("Región", datos_lote.get("region", "")),
        ("Fecha de Siembra", str(datos_lote.get("fecha_siembra", ""))),
        ("Fecha de Cosecha", str(datos_lote.get("fecha_cosecha", ""))),
        ("Volumen Producido", f"{datos_lote.get('volumen_kg', 0)} kg"),
        ("Calidad", datos_lote.get("calidad", "")),
        ("Destino", datos_lote.get("destino_pais", "")),
    ]
    for etiqueta, valor in campos_lote:
        c.setFont("Helvetica-Bold", 10)
        c.drawString(50, y, f"{etiqueta}:")
        c.setFont("Helvetica", 10)
        c.drawString(220, y, str(valor))
        y -= 20

    try:
        c.drawImage(ruta_qr, ancho - 180, alto - 280, width=130, height=130)
    except Exception:
        pass

    c.setFont("Helvetica-Bold", 10)
    c.drawString(ancho - 180, alto - 295, "Escanee para verificar")

    c.setFont("Helvetica", 8)
    c.drawCentredString(ancho/2, 30, "Documento generado por AgroScan - Sistema de Monitoreo Inteligente de Cultivos")
    c.save()
    return ruta_pdf