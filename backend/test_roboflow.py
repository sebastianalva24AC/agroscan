import httpx
import base64

ruta_imagen = r"C:\Users\SEBAS\Desktop\imagenes_entrenamiento\imagen 2.jpg"

with open(ruta_imagen, 'rb') as f:
    imagen_bytes = f.read()

imagen_b64 = base64.b64encode(imagen_bytes).decode('utf-8')

url = 'https://detect.roboflow.com/agroscan-plantas/1?api_key=VgeSLobulhdyDCvVD4Vu'

with httpx.Client(timeout=30) as client:
    response = client.post(
        url,
        content=imagen_b64,
        headers={'Content-Type': 'application/x-www-form-urlencoded'}
    )

print('Status:', response.status_code)
print('Respuesta:', response.json())