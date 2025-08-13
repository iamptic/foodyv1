from fastapi import APIRouter, Depends, Response, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
from ..database import get_db
from .. import models
from ..deps import get_current_restaurant

router = APIRouter(prefix="/exports", tags=["exports"])

@router.get("/offers.csv")
def export_offers_csv(
    status: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None, alias="from"),
    date_to: Optional[str] = Query(None, alias="to"),
    db: Session = Depends(get_db),
    me: models.Restaurant = Depends(get_current_restaurant),
):
    q = db.query(models.Offer).filter(models.Offer.restaurant_id == me.id)
    if status:
        try:
            q = q.filter(models.Offer.status == models.OfferStatus(status))
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid status")
    if date_from:
        try:
            dtf = datetime.fromisoformat(date_from)
            q = q.filter(models.Offer.created_at >= dtf)
        except Exception:
            raise HTTPException(status_code=400, detail="Bad from date")
    if date_to:
        try:
            dtt = datetime.fromisoformat(date_to)
            q = q.filter(models.Offer.created_at <= dtt)
        except Exception:
            raise HTTPException(status_code=400, detail="Bad to date")

    rows = q.order_by(models.Offer.id.desc()).all()

    # Build CSV
    headers = ["id","restaurant_id","title","original_price_cents","final_price_cents","discount_stage","status","created_at","sold_at"]
    out_lines = [",".join(headers)]
    for r in rows:
        vals = [
            str(r.id),
            str(r.restaurant_id),
            (r.title or "").replace(",", " "),
            str(r.original_price_cents or 0),
            str(r.final_price_cents or 0),
            str(r.discount_stage or ""),
            str(r.status.value),
            r.created_at.isoformat() if r.created_at else "",
            r.sold_at.isoformat() if r.sold_at else "",
        ]
        out_lines.append(",".join(vals))
    csv_bytes = ("
".join(out_lines)).encode("utf-8")
    return Response(content=csv_bytes, media_type="text/csv; charset=utf-8", headers={"Content-Disposition": "attachment; filename=offers.csv"})
