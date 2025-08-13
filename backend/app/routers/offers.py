from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from .. import schemas, models
from ..deps import get_current_restaurant

router = APIRouter(prefix="/offers", tags=["offers"])

@router.get("", response_model=List[schemas.OfferOut])
def list_offers(
    status: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    me: models.Restaurant = Depends(get_current_restaurant),
):
    q = db.query(models.Offer).filter(models.Offer.restaurant_id == me.id)
    if status:
        try:
            status_enum = models.OfferStatus(status)
            q = q.filter(models.Offer.status == status_enum)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid status")
    return q.order_by(models.Offer.id.desc()).limit(limit).all()

@router.post("", response_model=schemas.OfferOut)
def create_offer(payload: schemas.OfferIn, db: Session = Depends(get_db), me: models.Restaurant = Depends(get_current_restaurant)):
    offer = models.Offer(
        restaurant_id=me.id,
        title=payload.title,
        original_price_cents=payload.original_price_cents,
        final_price_cents=payload.final_price_cents or payload.original_price_cents,
        start_at=payload.start_at,
        close_at=payload.close_at,
        discount_schedule=payload.discount_schedule,
        discount_stage=payload.discount_stage,
        status=models.OfferStatus(payload.status) if payload.status else models.OfferStatus.active,
    )
    db.add(offer)
    db.commit()
    db.refresh(offer)
    return offer

@router.patch("/{offer_id}", response_model=schemas.OfferOut)
def update_offer(offer_id: int, payload: schemas.OfferIn, db: Session = Depends(get_db), me: models.Restaurant = Depends(get_current_restaurant)):
    offer = db.query(models.Offer).filter(models.Offer.id == offer_id, models.Offer.restaurant_id == me.id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        if field == "status" and value is not None:
            setattr(offer, field, models.OfferStatus(value))
        elif value is not None:
            setattr(offer, field, value)
    db.commit()
    db.refresh(offer)
    return offer

@router.post("/{offer_id}/archive")
def archive_offer(offer_id: int, db: Session = Depends(get_db), me: models.Restaurant = Depends(get_current_restaurant)):
    offer = db.query(models.Offer).filter(models.Offer.id == offer_id, models.Offer.restaurant_id == me.id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    offer.status = models.OfferStatus.archived
    db.commit()
    return {"ok": True}
