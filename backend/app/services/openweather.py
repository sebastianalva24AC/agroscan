import httpx
from app.config import settings

BASE_URL = "https://api.openweathermap.org/data/2.5"

def get_clima_actual(latitud: float, longitud: float) -> dict:
    url = f"{BASE_URL}/weather"
    params = {
        "lat": latitud,
        "lon": longitud,
        "appid": settings.OPENWEATHER_API_KEY,
        "units": "metric",
        "lang": "es"
    }
    with httpx.Client() as client:
        response = client.get(url, params=params)
        if response.status_code != 200:
            return None
        data = response.json()
        return {
            "temperatura": data["main"]["temp"],
            "temperatura_min": data["main"]["temp_min"],
            "temperatura_max": data["main"]["temp_max"],
            "humedad": data["main"]["humidity"],
            "precipitacion": data.get("rain", {}).get("1h", 0),
            "viento": data["wind"]["speed"],
            "descripcion": data["weather"][0]["description"],
            "ciudad": data.get("name", "")
        }

def get_pronostico_7dias(latitud: float, longitud: float) -> list:
    url = f"{BASE_URL}/forecast"
    params = {
        "lat": latitud,
        "lon": longitud,
        "appid": settings.OPENWEATHER_API_KEY,
        "units": "metric",
        "lang": "es",
        "cnt": 40
    }
    with httpx.Client() as client:
        response = client.get(url, params=params)
        if response.status_code != 200:
            return []
        data = response.json()
        pronostico = []
        for item in data["list"]:
            pronostico.append({
                "fecha": item["dt_txt"],
                "temperatura": item["main"]["temp"],
                "humedad": item["main"]["humidity"],
                "descripcion": item["weather"][0]["description"],
                "precipitacion": item.get("rain", {}).get("3h", 0)
            })
        return pronostico