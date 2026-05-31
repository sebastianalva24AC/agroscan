import httpx
import base64
from app.config import settings

TIPOS_PROBLEMA = {
    "healthy": "saludable",
    "rust": "enfermedad",
    "powdery_mildew": "enfermedad",
    "botrytis": "enfermedad",
    "late_blight": "enfermedad",
    "aphids": "plaga",
    "whitefly": "plaga",
    "spider_mites": "plaga",
    "thrips": "plaga",
    "water_stress": "estres_hidrico",
    "nutrient_deficiency": "deficiencia_nutricional"
}

def analizar_imagen(imagen_bytes: bytes) -> dict:
    imagen_b64 = base64.b64encode(imagen_bytes).decode("utf-8")

    url = (
        f"https://detect.roboflow.com/{settings.ROBOFLOW_PROJECT}"
        f"/{settings.ROBOFLOW_VERSION}"
        f"?api_key={settings.ROBOFLOW_API_KEY}"
    )

    with httpx.Client(timeout=30) as client:
        response = client.post(
            url,
            content=base64.b64decode(imagen_b64),
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )

    if response.status_code != 200:
        return {
            "tipo_problema": "otro",
            "confianza_pct": 0,
            "diagnostico": "No se pudo analizar la imagen",
            "recomendacion": "Intente con una imagen más clara"
        }

    data = response.json()
    predicciones = data.get("predictions", [])

    if not predicciones:
        return {
            "tipo_problema": "saludable",
            "confianza_pct": 95.0,
            "diagnostico": "No se detectaron problemas en la planta",
            "recomendacion": "La planta parece estar en buen estado"
        }

    mejor = max(predicciones, key=lambda x: x["confidence"])
    clase = mejor.get("class", "otro").lower()
    confianza = round(mejor.get("confidence", 0) * 100, 2)
    tipo = TIPOS_PROBLEMA.get(clase, "otro")

    recomendaciones = {
        "enfermedad": "Aplicar fungicida apropiado. Consulte con un agrónomo.",
        "plaga": "Aplicar insecticida o control biológico. Monitorear el área.",
        "estres_hidrico": "Revisar el sistema de riego. Ajustar frecuencia de riego.",
        "deficiencia_nutricional": "Aplicar fertilizante según deficiencia detectada.",
        "saludable": "La planta está en buen estado. Continue el monitoreo regular.",
        "otro": "Consulte con un especialista agrónomo para mayor diagnóstico."
    }

    return {
        "tipo_problema": tipo,
        "clase_detectada": clase,
        "confianza_pct": confianza,
        "diagnostico": f"Se detectó: {clase} con {confianza}% de confianza",
        "recomendacion": recomendaciones.get(tipo, recomendaciones["otro"])
    }