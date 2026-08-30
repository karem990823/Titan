from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

JWT_SECRET_PLACEHOLDER = "changeme_generate_your_own_secret"


class Settings(BaseSettings):
    DB_HOST: str
    DB_PORT: int
    DB_NAME: str
    DB_USER: str
    DB_PASSWORD: str

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    UPLOADS_DIR: str = "uploads"

    @field_validator("JWT_SECRET_KEY")
    @classmethod
    def validar_jwt_secret(cls, valor: str) -> str:
        if valor == JWT_SECRET_PLACEHOLDER or len(valor) < 32:
            raise ValueError(
                "JWT_SECRET_KEY no puede ser el valor de ejemplo ni medir menos de 32 "
                "caracteres. Genera uno propio con: openssl rand -hex 32"
            )
        return valor

    @property
    def DATABASE_URL(self):
        # Formato: mysql+pymysql://usuario:password@host:port/nombre_db
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()