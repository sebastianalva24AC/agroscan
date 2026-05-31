from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.models.registro_clima import RegistroClima

DIAS_COSECHA = {
    "arandano": {"biloxi": 120, "misty": 130, "jewel": 125},
    "palta": {"hass": 180, "fuerte": 170, "bacon": 160},
    "esparrago": {"uc157": 90, "atlas": 95, "grande": 85},
    "uva": {"red_globe": 150, "superior": 140, "italia": 155},
    "mango": {"kent": 120, "tommy": 115, "haden": 125},
    "platano": {"cavendish": 90, "gros_michel": 95}
}

def calcular_fecha_cosecha(
    tipo_planta: str,
    variedad: str,
    fecha_siembra: date,
    campo_id: int,
    db: Session
) -> dict:
    planta = tipo_planta.lower().replace(" ", "_")
    var = variedad.lower().replace(" ", "_")

    dias_base = DIAS_COSECHA.get(planta, {}).get(var, 120)

    registros = db.query(RegistroClima).filter(
        RegistroClima.campo_id == campo_id
    ).all()

    factor_clima = 1.0
    if registros:
        temp_promedio = sum(
            float(r.temperatura) for r in registros
        ) / len(registros)
        if temp_promedio > 30:
            factor_clima = 0.92
        elif temp_promedio < 15:
            factor_clima = 1.12
        else:
            factor_clima = 1.0

    dias_ajustados = int(dias_base * factor_clima)
    fecha_estimada = fecha_siembra + timedelta(days=dias_ajustados)
    dias_restantes = (fecha_estimada - date.today()).days

    return {
        "tipo_planta": tipo_planta,
        "variedad": variedad,
        "fecha_siembra": str(fecha_siembra),
        "dias_base": dias_base,
        "dias_ajustados": dias_ajustados,
        "factor_clima": round(factor_clima, 2),
        "fecha_estimada_cosecha": str(fecha_estimada),
        "dias_restantes": max(0, dias_restantes),
        "estado": "listo" if dias_restantes <= 7 else "en_desarrollo"
    }