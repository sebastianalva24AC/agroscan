import httpx
import base64
from app.config import settings

TIPOS_PROBLEMA = {
    "saludable": "saludable",
    "botrytis": "enfermedad",
    "trips": "plaga",
    "estres_hidrico": "estres_hidrico",
    "deficiencia_nutricional": "deficiencia_nutricional",
    "healthy": "saludable",
    "thrips": "plaga",
    "water_stress": "estres_hidrico",
    "nutrient_deficiency": "deficiencia_nutricional"
}

RECOMENDACIONES = {
    "enfermedad": "Se detectó enfermedad fúngica. Aplicar fungicida apropiado como Captan o Mancozeb. Consulte con un agrónomo.",
    "plaga": "Se detectó presencia de plaga. Aplicar insecticida o control biológico. Monitorear el área afectada.",
    "estres_hidrico": "La planta muestra estrés hídrico. Revisar el sistema de riego y ajustar la frecuencia.",
    "deficiencia_nutricional": "Se detecta deficiencia nutricional. Aplicar fertilizante según el tipo de deficiencia detectada.",
    "saludable": "La planta está en buen estado. Continúe el monitoreo regular.",
    "otro": "No se pudo clasificar el problema. Consulte con un especialista agrónomo."
}

def analizar_imagen(imagen_bytes: bytes) -> dict:
    try:
        imagen_b64 = base64.b64encode(imagen_bytes).decode("utf-8")

        url = (
            f"https://detect.roboflow.com/{settings.ROBOFLOW_PROJECT}"
            f"/{settings.ROBOFLOW_VERSION}"
            f"?api_key={settings.ROBOFLOW_API_KEY}"
        )

        with httpx.Client(timeout=30) as client:
            response = client.post(
                url,
                content=imagen_b64,
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )

        if response.status_code != 200:
            return {
                "tipo_problema": "otro",
                "confianza_pct": 0,
                "diagnostico": "No se pudo conectar con el servicio de IA",
                "recomendacion": RECOMENDACIONES["otro"]
            }

        data = response.json()
        predicciones = data.get("predictions", [])

        if not predicciones:
            return {
                "tipo_problema": "saludable",
                "confianza_pct": 95.0,
                "diagnostico": "No se detectaron problemas visibles en la planta",
                "recomendacion": RECOMENDACIONES["saludable"]
            }

        mejor = max(predicciones, key=lambda x: x["confidence"])
        clase = mejor.get("class", "otro").lower()
        confianza = round(mejor.get("confidence", 0) * 100, 2)
        tipo = TIPOS_PROBLEMA.get(clase, "otro")

        return {
            "tipo_problema": tipo,
            "clase_detectada": clase,
            "confianza_pct": confianza,
            "diagnostico": f"Se detectó {clase} con {confianza}% de confianza",
            "recomendacion": RECOMENDACIONES.get(tipo, RECOMENDACIONES["otro"])
        }

    except Exception as e:
        print(f"Error en análisis IA: {e}")
        return {
            "tipo_problema": "otro",
            "confianza_pct": 0,
            "diagnostico": "Error al procesar la imagen",
            "recomendacion": RECOMENDACIONES["otro"]
        }