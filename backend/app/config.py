from pydantic import BaseModel
import os

class Settings(BaseModel):
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./dev.db")
    jwt_secret: str = os.getenv("JWT_SECRET", "change_me")
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days
    feature_reserve: bool = os.getenv("FEATURE_RESERVE", "false").lower() == "true"

settings = Settings()
