from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
import app.models.empresa
import app.models.usuario
import app.models.campo
import app.models.cultivo
import app.models.registro_clima
import app.models.imagen_satelital
import app.models.registro_campo
import app.models.lote
import app.models.certificado
import app.models.alerta
import app.models.comprador
import app.models.acceso_comprador
from apscheduler.schedulers.background import BackgroundScheduler
from app.services.alertas_automaticas import verificar_alertas_climaticas, verificar_alertas_ndvi
from app.routers import (
    auth, campos, cultivos, clima,
    alertas, diagnostico, lotes, certificados, satelital
)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AgroScan API",
    description="Sistema de monitoreo inteligente de cultivos y trazabilidad agrícola",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Autenticación"])
app.include_router(campos.router, prefix="/api/campos", tags=["Campos"])
app.include_router(cultivos.router, prefix="/api/cultivos", tags=["Cultivos"])
app.include_router(clima.router, prefix="/api/clima", tags=["Clima"])
app.include_router(alertas.router, prefix="/api/alertas", tags=["Alertas"])
app.include_router(diagnostico.router, prefix="/api/diagnostico", tags=["Diagnóstico IA"])
app.include_router(lotes.router, prefix="/api/lotes", tags=["Lotes"])
app.include_router(certificados.router, prefix="/api/certificados", tags=["Certificados QR"])
app.include_router(satelital.router, prefix="/api/satelital", tags=["Satelital NDVI"])

scheduler = BackgroundScheduler()
scheduler.add_job(
    verificar_alertas_climaticas,
    'interval',
    hours=1,
    id='alertas_climaticas',
    replace_existing=True
)
scheduler.add_job(
    verificar_alertas_ndvi,
    'interval',
    hours=8,
    id='alertas_ndvi',
    replace_existing=True
)
scheduler.start()

@app.on_event("shutdown")
def shutdown_scheduler():
    scheduler.shutdown()

@app.get("/")
def root():
    return {
        "mensaje": "AgroScan API funcionando correctamente",
        "version": "1.0.0",
        "docs": "/docs"
    }   