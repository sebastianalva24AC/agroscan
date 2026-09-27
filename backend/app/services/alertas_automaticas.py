from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.campo import Campo
from app.models.alerta import Alerta
from app.services.openweather import get_clima_actual

UMBRALES = {
    'temperatura_max': 32.0,
    'temperatura_min': 8.0,
    'humedad_min': 40.0,
    'humedad_max': 95.0,
    'viento_max': 15.0,
    'precipitacion_max': 20.0,
    # Umbrales específicos Fenómeno del Niño
    'temperatura_nino': 35.0,
    'precipitacion_nino': 50.0,
    'humedad_nino': 98.0,
}

def _crear_alerta_si_no_existe(db, campo_id, tipo, descripcion, nivel):
    existente = db.query(Alerta).filter(
        Alerta.campo_id == campo_id,
        Alerta.tipo == tipo,
        Alerta.descripcion == descripcion,
        Alerta.resuelta == False
    ).first()
    if not existente:
        db.add(Alerta(
            tipo=tipo,
            descripcion=descripcion,
            nivel=nivel,
            campo_id=campo_id
        ))

def verificar_alertas_climaticas():
    db: Session = SessionLocal()
    try:
        campos = db.query(Campo).filter(Campo.activo == True).all()
        for campo in campos:
            clima = get_clima_actual(float(campo.latitud), float(campo.longitud))
            if not clima:
                continue

            temp = clima['temperatura']
            hum = clima['humedad']
            viento = clima['viento']
            precip = clima['precipitacion']

            # Alertas Fenómeno del Niño — prioridad máxima
            if temp >= UMBRALES['temperatura_nino']:
                _crear_alerta_si_no_existe(db, campo.id, 'fenomeno_nino',
                    f"⚠️ ALERTA FENÓMENO DEL NIÑO: Temperatura anómala de {temp}°C en {campo.nombre}. "
                    f"Supera el umbral crítico de {UMBRALES['temperatura_nino']}°C. "
                    f"Activar protocolos de emergencia: riego nocturno, mallas de sombreo y monitoreo intensivo.",
                    'critico')

            if precip >= UMBRALES['precipitacion_nino']:
                _crear_alerta_si_no_existe(db, campo.id, 'fenomeno_nino',
                    f"⚠️ ALERTA FENÓMENO DEL NIÑO: Precipitación extrema de {precip} mm en {campo.nombre}. "
                    f"Riesgo de inundación y pérdida de cultivos. Verificar drenajes y canaletas de emergencia.",
                    'critico')

            if hum >= UMBRALES['humedad_nino']:
                _crear_alerta_si_no_existe(db, campo.id, 'fenomeno_nino',
                    f"⚠️ ALERTA FENÓMENO DEL NIÑO: Humedad extrema de {hum}% en {campo.nombre}. "
                    f"Condiciones críticas para proliferación de hongos. Aplicar fungicida preventivo de inmediato.",
                    'critico')

            # Alertas climáticas estándar
            if temp > UMBRALES['temperatura_max']:
                _crear_alerta_si_no_existe(db, campo.id, 'clima',
                    f"Temperatura crítica: {temp}°C supera {UMBRALES['temperatura_max']}°C en {campo.nombre}. Activar riego de emergencia.",
                    'critico')
            elif temp < UMBRALES['temperatura_min']:
                _crear_alerta_si_no_existe(db, campo.id, 'clima',
                    f"Temperatura baja: {temp}°C bajo el umbral de {UMBRALES['temperatura_min']}°C en {campo.nombre}. Riesgo de helada.",
                    'critico')

            if hum > UMBRALES['humedad_max']:
                _crear_alerta_si_no_existe(db, campo.id, 'clima',
                    f"Humedad excesiva: {hum}% en {campo.nombre}. Riesgo de enfermedades fúngicas como botrytis.",
                    'advertencia')
            elif hum < UMBRALES['humedad_min']:
                _crear_alerta_si_no_existe(db, campo.id, 'clima',
                    f"Humedad baja: {hum}% en {campo.nombre}. Verificar sistema de riego.",
                    'advertencia')

            if viento > UMBRALES['viento_max']:
                _crear_alerta_si_no_existe(db, campo.id, 'clima',
                    f"Viento fuerte: {viento} m/s en {campo.nombre}. Puede afectar polinización y estructura de plantas.",
                    'advertencia')

            if precip > UMBRALES['precipitacion_max']:
                _crear_alerta_si_no_existe(db, campo.id, 'clima',
                    f"Precipitación intensa: {precip} mm en {campo.nombre}. Revisar drenaje del campo.",
                    'advertencia')

        db.commit()
        print(f"Verificación climática completada para {len(campos)} campos")

    except Exception as e:
        print(f"Error en verificación de alertas: {e}")
        db.rollback()
    finally:
        db.close()

def verificar_alertas_ndvi():
    db: Session = SessionLocal()
    try:
        from app.services.sentinel import get_ndvi_campo
        campos = db.query(Campo).filter(Campo.activo == True).all()

        for campo in campos:
            ndvi_data = get_ndvi_campo(
                float(campo.latitud),
                float(campo.longitud),
                campo.nombre
            )

            if not ndvi_data or not ndvi_data.get('ndvi_promedio'):
                continue

            ndvi = ndvi_data['ndvi_promedio']

            if ndvi < 0.2:
                _crear_alerta_si_no_existe(db, campo.id, 'satelital',
                    f"NDVI crítico: {ndvi} en {campo.nombre}. El cultivo muestra signos severos de estrés. Inspección inmediata requerida.",
                    'critico')
            elif ndvi < 0.4:
                _crear_alerta_si_no_existe(db, campo.id, 'satelital',
                    f"NDVI bajo: {ndvi} en {campo.nombre}. El cultivo muestra estrés moderado. Revisar riego y fertilización.",
                    'advertencia')

        db.commit()
        print(f"Verificación NDVI completada para {len(campos)} campos")

    except Exception as e:
        print(f"Error en verificación NDVI: {e}")
        db.rollback()
    finally:
        db.close()