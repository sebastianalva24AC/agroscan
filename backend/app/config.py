from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    OPENWEATHER_API_KEY: str
    SH_CLIENT_ID: str
    SH_CLIENT_SECRET: str
    ROBOFLOW_API_KEY: str
    ROBOFLOW_PROJECT: str
    ROBOFLOW_VERSION: int = 1

    class Config:
        env_file = ".env"

settings = Settings()