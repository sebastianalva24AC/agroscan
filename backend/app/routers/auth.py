from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime
from app.database import get_db
from app.models.usuario import Usuario
from app.models.empresa import Empresa
from app.auth.jwt import crear_token

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verificar_password(password_plano: str, password_hash: str) -> bool:
    return pwd_context.verify(password_plano, password_hash)

def hashear_password(password: str) -> str:
    return pwd_context.hash(password)

@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    usuario = db.query(Usuario).filter(
        Usuario.email == form_data.username,
        Usuario.activo == True
    ).first()

    if not usuario or not verificar_password(form_data.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos"
        )

    usuario.ultimo_acceso = datetime.utcnow()
    db.commit()

    token = crear_token({
        "sub": str(usuario.id),
        "rol": usuario.rol,
        "empresa_id": usuario.empresa_id
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "rol": usuario.rol,
        "nombre": usuario.nombre,
        "empresa_id": usuario.empresa_id
    }

@router.post("/registro-empresa")
def registro_empresa(
    nombre_empresa: str,
    ruc: str,
    region: str,
    plan: str,
    nombre_usuario: str,
    email: str,
    password: str,
    db: Session = Depends(get_db)
):
    # Verificar que el email no exista
    if db.query(Usuario).filter(Usuario.email == email).first():
        raise HTTPException(
            status_code=400,
            detail="Ya existe un usuario con ese email"
        )

    # Crear empresa
    empresa = Empresa(
        nombre=nombre_empresa,
        ruc=ruc,
        region=region,
        plan=plan
    )
    db.add(empresa)
    db.flush()

    # Crear usuario gerente
    usuario = Usuario(
        nombre=nombre_usuario,
        email=email,
        password_hash=hashear_password(password),
        rol="gerente",
        empresa_id=empresa.id
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)

    token = crear_token({
        "sub": str(usuario.id),
        "rol": usuario.rol,
        "empresa_id": empresa.id
    })

    return {
        "mensaje": "Empresa y gerente registrados exitosamente",
        "access_token": token,
        "token_type": "bearer",
        "empresa_id": empresa.id,
        "usuario_id": usuario.id
    }

@router.post("/crear-tecnico")
def crear_tecnico(
    nombre: str,
    email: str,
    password: str,
    empresa_id: int,
    db: Session = Depends(get_db)
):
    if db.query(Usuario).filter(Usuario.email == email).first():
        raise HTTPException(status_code=400, detail="Email ya registrado")

    usuario = Usuario(
        nombre=nombre,
        email=email,
        password_hash=hashear_password(password),
        rol="tecnico_agronomo",
        empresa_id=empresa_id
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)

    return {
        "mensaje": "Técnico creado exitosamente",
        "usuario_id": usuario.id,
        "email": usuario.email,
        "rol": usuario.rol
    }

@router.post("/crear-comprador")
def crear_comprador(
    nombre: str,
    email: str,
    password: str,
    empresa_id: int,
    db: Session = Depends(get_db)
):
    if db.query(Usuario).filter(Usuario.email == email).first():
        raise HTTPException(status_code=400, detail="Email ya registrado")

    usuario = Usuario(
        nombre=nombre,
        email=email,
        password_hash=hashear_password(password),
        rol="comprador_extranjero",
        empresa_id=empresa_id
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)

    return {
        "mensaje": "Comprador creado exitosamente",
        "usuario_id": usuario.id,
        "email": usuario.email,
        "rol": usuario.rol
    }