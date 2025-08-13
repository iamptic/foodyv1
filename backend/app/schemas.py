from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any
from datetime import datetime

class RegisterIn(BaseModel):
    email: EmailStr
    name: str = Field(min_length=2, max_length=255)
    password: str = Field(min_length=6, max_length=128)
    city: Optional[str] = None
    address: Optional[str] = None
    lat: Optional[str] = None
    lng: Optional[str] = None

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class MeOut(BaseModel):
    id: int
    email: EmailStr
    name: str
    city: Optional[str] = None
    address: Optional[str] = None
    lat: Optional[str] = None
    lng: Optional[str] = None

class OfferIn(BaseModel):
    title: str
    original_price_cents: int
    final_price_cents: int
    start_at: Optional[datetime] = None
    close_at: Optional[datetime] = None
    discount_schedule: Optional[Any] = None
    discount_stage: Optional[str] = None
    status: Optional[str] = None

class OfferOut(BaseModel):
    id: int
    restaurant_id: int
    title: str
    original_price_cents: int
    final_price_cents: int
    status: str
    start_at: Optional[datetime] = None
    close_at: Optional[datetime] = None
    discount_schedule: Optional[Any] = None
    discount_stage: Optional[str] = None
    created_at: datetime
    sold_at: Optional[datetime] = None

    class Config:
        from_attributes = True
