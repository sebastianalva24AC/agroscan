from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.campo import Campo
from app.models.alerta import Alerta
from app.services.openweather import get_clima_actual

# Umbrales de alerta para cultivos de exportación
UMBRALES = {
    'temperatura_max': 32.0,
    'temperatura_min': 8.0,
    'humedad_min': 40.0,
    'humedad_max': 95.0,
    'viento_max': 15.0,
    'precipitacion_max': 20.0
}

def verificar_alertas_climaticas():
    db: Session = SessionLocal()
    try:
        campos = db.query(Campo).filter(Campo.activo == True).all()
        for campo in campos:
            clima = get_clima_actual(
                float(campo.latitud),
                float(campo.longitud)
            )
            if not clima:
                continue

            alertas_nuevas = []

            if clima['temperatura'] > UMBRALES['temperatura_max']:
                alertas_nuevas.append({
                    'tipo': 'clima',
                    'descripcion': f"Temperatura crítica: {clima['temperatura']}°C supera el umbral de {UMBRALES['temperatura_max']}°C en {campo.nombre}. Activar sistema de riego de emergencia.",
                    'nivel': 'critico'
                })
            elif clima['temperatura'] < UMBRALES['temperatura_min']:
                alertas_nuevas.append({
                    'tipo': 'clima',
                    'descripcion': f"Temperatura baja: {clima['temperatura']}°C por debajo del umbral de {UMBRALES['temperatura_min']}°C en {campo.nombre}. Riesgo de helada.",
                    'nivel': 'critico'
                })

            if clima['humedad'] > UMBRALES['humedad_max']:
                alertas_nuevas.append({
                    'tipo': 'clima',
                    'descripcion': f"Humedad excesiva: {clima['humedad']}% en {campo.nombre}. Riesgo de enfermedades fúngicas como botrytis.",
                    'nivel': 'advertencia'
                })
            elif clima['humedad'] < UMBRALES['humedad_min']:
                alertas_nuevas.append({
                    'tipo': 'clima',
                    'descripcion': f"Humedad baja: {clima['humedad']}% en {campo.nombre}. Verificar sistema de riego.",
                    'nivel': 'advertencia'
                })

            if clima['viento'] > UMBRALES['viento_max']:
                alertas_nuevas.append({
                    'tipo': 'clima',
                    'descripcion': f"Viento fuerte: {clima['viento']} m/s en {campo.nombre}. Puede afectar la polinización y estructura de las plantas.",
                    'nivel': 'advertencia'
                })

            if clima['precipitacion'] > UMBRALES['precipitacion_max']:
                alertas_nuevas.append({
                    'tipo': 'clima',
                    'descripcion': f"Precipitación intensa: {clima['precipitacion']} mm en {campo.nombre}. Revisar drenaje del campo.",
                    'nivel': 'advertencia'
                })

            for alerta_data in alertas_nuevas:
                alerta_existente = db.query(Alerta).filter(
                    Alerta.campo_id == campo.id,
                    Alerta.tipo == alerta_data['tipo'],
                    Alerta.descripcion == alerta_data['descripcion'],
                    Alerta.resuelta == False
                ).first()

                if not alerta_existente:
                    nueva_alerta = Alerta(
                        tipo=alerta_data['tipo'],
                        descripcion=alerta_data['descripcion'],
                        nivel=alerta_data['nivel'],
                        campo_id=campo.id
                    )
                    db.add(nueva_alerta)

        db.commit()
        print(f"Verificación de alertas climáticas completada para {len(campos)} campos")

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
            
            alerta_data = None
            
            if ndvi < 0.2:
                alerta_data = {
                    'tipo': 'satelital',
                    'descripcion': f"NDVI crítico: {ndvi} en {campo.nombre}. El cultivo muestra signos severos de estrés. Inspección inmediata requerida.",
                    'nivel': 'critico'
                }
            elif ndvi < 0.4:
                alerta_data = {
                    'tipo': 'satelital',
                    'descripcion': f"NDVI bajo: {ndvi} en {campo.nombre}. El cultivo muestra estrés moderado. Se recomienda revisión del sistema de riego y fertilización.",
                    'nivel': 'advertencia'
                }
            
            if alerta_data:
                alerta_existente = db.query(Alerta).filter(
                    Alerta.campo_id == campo.id,
                    Alerta.tipo == 'satelital',
                    Alerta.resuelta == False
                ).first()
                
                if not alerta_existente:
                    nueva_alerta = Alerta(
                        tipo=alerta_data['tipo'],
                        descripcion=alerta_data['descripcion'],
                        nivel=alerta_data['nivel'],
                        campo_id=campo.id
                    )
                    db.add(nueva_alerta)
                    db.commit()
                    print(f"Alerta NDVI creada para campo {campo.nombre}: NDVI={ndvi}")
        
        print(f"Verificación NDVI completada para {len(campos)} campos")
        
    except Exception as e:
        print(f"Error en verificación NDVI: {e}")
        db.rollback()
    finally:
        db.close()