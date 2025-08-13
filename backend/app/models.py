from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, JSON, Enum, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import enum

class OfferStatus(str, enum.Enum):
    active = "active"
    archived = "archived"
    sold_out = "sold_out"
    expired = "expired"

class Restaurant(Base):
    __tablename__ = "restaurants"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    city = Column(String(120))
    address = Column(String(255))
    lat = Column(String(64))
    lng = Column(String(64))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    offers = relationship("Offer", back_populates="restaurant")

class Offer(Base):
    __tablename__ = "offers"
    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    original_price_cents = Column(Integer, nullable=False, default=0)
    final_price_cents = Column(Integer, nullable=False, default=0)
    status = Column(Enum(OfferStatus), default=OfferStatus.active, nullable=False)
    start_at = Column(DateTime(timezone=True))
    close_at = Column(DateTime(timezone=True))
    discount_schedule = Column(JSON)  # [{t:'-3h', pct:30}, ...]
    discount_stage = Column(String(16))  # none|s1|s2|s3
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    sold_at = Column(DateTime(timezone=True))

    restaurant = relationship("Restaurant", back_populates="offers")

Index("ix_offers_status_restaurant", Offer.status, Offer.restaurant_id)
