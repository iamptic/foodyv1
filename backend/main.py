import os, io, csv, json, secrets, string, datetime as dt
from typing import Optional, Dict, Any, List

import asyncpg
from fastapi import FastAPI, Header, HTTPException, Query, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse

from backend import bootstrap_sql

DB_URL = os.getenv("DATABASE_URL")

app = FastAPI(title="Foody Backend — Full Pack API")

origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]
if origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

_pool: Optional[asyncpg.Pool] = None
async def pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        if not DB_URL:
            raise RuntimeError("DATABASE_URL not set")
        _pool = await asyncpg.create_pool(DB_URL, min_size=1, max_size=5)
    return _pool

def rid() -> str:
    return "RID_" + secrets.token_hex(4)
def apikey() -> str:
    return "KEY_" + secrets.token_hex(8)
def offid() -> str:
    return "OFF_" + secrets.token_hex(6)

def row_offer(r: asyncpg.Record) -> Dict[str, Any]:
    return {
        "id": r["id"],
        "restaurant_id": r["restaurant_id"],
        "title": r["title"],
        "description": r.get("description"),
        "price_cents": r["price_cents"],
        "original_price_cents": r.get("original_price_cents"),
        "qty_left": r["qty_left"],
        "qty_total": r["qty_total"],
        "expires_at": r["expires_at"].isoformat() if r.get("expires_at") else None,
        "archived_at": r["archived_at"].isoformat() if r.get("archived_at") else None,
        "created_at": r["created_at"].isoformat() if r.get("created_at") else None,
    }

async def auth(conn: asyncpg.Connection, key: str, restaurant_id: Optional[str]) -> str:
    if not key:
        return ""
    if restaurant_id:
        r = await conn.fetchrow("SELECT id FROM foody_restaurants WHERE id=$1 AND api_key=$2", restaurant_id, key)
        return r["id"] if r else ""
    r = await conn.fetchrow("SELECT id FROM foody_restaurants WHERE api_key=$1", key)
    return r["id"] if r else ""

@app.on_event("startup")
async def _startup():
    bootstrap_sql.ensure()

@app.middleware("http")
async def guard(request: Request, call_next):
    try:
        resp = await call_next(request)
        return resp
    except HTTPException as he:
        raise he
    except Exception as e:
        import traceback; traceback.print_exc()
        return JSONResponse({"detail":"Internal Server Error"}, status_code=500)

@app.get("/health")
async def health():
    return {"ok": True}

@app.post("/api/v1/merchant/register_public")
async def register_public(raw: Request):
    try:
        if raw.headers.get("content-type","").startswith("application/json"):
            data = await raw.json()
        else:
            txt = await raw.body()
            data = json.loads(txt.decode("utf-8") or "{}")
    except Exception:
        data = {}
    title = (data.get("title") or "").strip()
    phone = (data.get("phone") or "").strip()
    if not title:
        raise HTTPException(400, "title required")
    ridv = rid()
    keyv = apikey()
    p = await pool()
    async with p.acquire() as conn:
        await conn.execute("INSERT INTO foody_restaurants(id, api_key, title, phone) VALUES($1,$2,$3,$4)", ridv, keyv, title, phone or None)
    return {"restaurant_id": ridv, "api_key": keyv}

@app.get("/api/v1/merchant/profile")
async def get_profile(restaurant_id: str, x_foody_key: str = Header(default="")):
    p = await pool()
    async with p.acquire() as conn:
        rid_ok = await auth(conn, x_foody_key, restaurant_id)
        if not rid_ok:
            raise HTTPException(401, "Invalid API key or restaurant_id")
        r = await conn.fetchrow("SELECT id, title, phone FROM foody_restaurants WHERE id=$1", restaurant_id)
        if not r:
            raise HTTPException(404, "Restaurant not found")
        return {"id": r["id"], "title": r["title"], "phone": r["phone"]}

@app.post("/api/v1/merchant/profile")
async def set_profile(body: Dict[str, Any] = Body(...), x_foody_key: str = Header(default="")):
    rid_in = (body.get("restaurant_id") or "").strip()
    title = (body.get("title") or "").strip()
    phone = (body.get("phone") or "").strip() or None
    p = await pool()
    async with p.acquire() as conn:
        rid_ok = await auth(conn, x_foody_key, rid_in)
        if not rid_ok:
            raise HTTPException(401, "Invalid API key or restaurant_id")
        if title:
            await conn.execute("UPDATE foody_restaurants SET title=$1, phone=$2 WHERE id=$3", title, phone, rid_in)
        else:
            await conn.execute("UPDATE foody_restaurants SET phone=$1 WHERE id=$2", phone, rid_in)
    return {"ok": True}

@app.get("/api/v1/merchant/offers")
async def merchant_offers(restaurant_id: str, status: Optional[str] = None, x_foody_key: str = Header(default="")):
    p = await pool()
    async with p.acquire() as conn:
        rid_ok = await auth(conn, x_foody_key, restaurant_id)
        if not rid_ok:
            raise HTTPException(401, "Invalid API key or restaurant_id")
        where = ["restaurant_id=$1"]
        params = [restaurant_id]
        if status == "active":
            where.append("(archived_at IS NULL) AND (expires_at IS NULL OR expires_at > NOW()) AND (qty_left IS NULL OR qty_left > 0)")
        sql = f"SELECT * FROM foody_offers WHERE {' AND '.join(where)} ORDER BY expires_at NULLS LAST, id"
        rows = await conn.fetch(sql, *params)
        return [row_offer(r) for r in rows]

@app.post("/api/v1/merchant/offers")
async def create_offer(body: Dict[str, Any] = Body(...), x_foody_key: str = Header(default="")):
    rid_in = (body.get("restaurant_id") or "").strip()
    p = await pool()
    async with p.acquire() as conn:
        rid_ok = await auth(conn, x_foody_key, rid_in)
        if not rid_ok:
            raise HTTPException(401, "Invalid API key or restaurant_id")
        oid = "OFF_" + secrets.token_hex(6)
        title = (body.get("title") or "").strip()
        if not title:
            raise HTTPException(400, "title required")
        description = (body.get("description") or None)
        try:
            price_cents = int(body.get("price_cents") or 0)
        except:
            price_cents = 0
        if price_cents <= 0:
            raise HTTPException(400, "price_cents > 0 required")
        original_price_cents = body.get("original_price_cents")
        if original_price_cents is not None:
            try: original_price_cents = int(original_price_cents)
            except: original_price_cents = None
        qty_total = int(body.get("qty_total") or 1)
        qty_left = int(body.get("qty_left") or qty_total)
        exp = body.get("expires_at")
        import datetime as dt
        expires_at = None
        if exp:
            try:
                expires_at = dt.datetime.fromisoformat(exp.replace('Z','+00:00'))
            except Exception:
                expires_at = None
        await conn.execute(
            """INSERT INTO foody_offers(id, restaurant_id, title, description, price_cents, original_price_cents,
                    qty_left, qty_total, expires_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)""",
            oid, rid_in, title, description, price_cents, original_price_cents, qty_left, qty_total, expires_at
        )
        r = await conn.fetchrow("SELECT * FROM foody_offers WHERE id=$1", oid)
        return row_offer(r)

@app.delete("/api/v1/merchant/offers/{offer_id}")
async def delete_offer(offer_id: str, restaurant_id: Optional[str] = None, x_foody_key: str = Header(default="")):
    p = await pool()
    async with p.acquire() as conn:
        rid_ok = await auth(conn, x_foody_key, restaurant_id)
        if not rid_ok:
            raise HTTPException(401, "Invalid API key or restaurant_id")
        chk = await conn.fetchrow("SELECT id, restaurant_id FROM foody_offers WHERE id=$1", offer_id)
        if not chk:
            raise HTTPException(404, "Offer not found")
        if restaurant_id and chk["restaurant_id"] != restaurant_id:
            raise HTTPException(403, "Offer belongs to another restaurant")
        await conn.execute("UPDATE foody_offers SET archived_at=NOW() WHERE id=$1", offer_id)
        return {"ok": True, "deleted": offer_id}

@app.get("/api/v1/offers")
async def public_offers(limit: int = Query(200, ge=1, le=500)):
    p = await pool()
    async with p.acquire() as conn:
        rows = await conn.fetch(
            """SELECT * FROM foody_offers
                WHERE (archived_at IS NULL)
                  AND (expires_at IS NULL OR expires_at > NOW())
                  AND (qty_left IS NULL OR qty_left > 0)
                ORDER BY expires_at NULLS LAST, id
                LIMIT $1""", limit
        )
        return [row_offer(r) for r in rows]

@app.get("/api/v1/merchant/offers/csv")
async def offers_csv(restaurant_id: str):
    p = await pool()
    async with p.acquire() as conn:
        rows = await conn.fetch(
            """SELECT * FROM foody_offers WHERE restaurant_id=$1 ORDER BY expires_at NULLS LAST, id""", restaurant_id
        )
    out = io.StringIO()
    w = csv.writer(out)
    w.writerow(["id","title","description","price_cents","original_price_cents","qty_left","qty_total","expires_at","archived_at","restaurant_id"])
    for r in rows:
        w.writerow([
            r["id"], r["title"], r.get("description") or "", r["price_cents"],
            r.get("original_price_cents") or "", r["qty_left"], r["qty_total"],
            r["expires_at"].isoformat() if r.get("expires_at") else "",
            r["archived_at"].isoformat() if r.get("archived_at") else "", r["restaurant_id"]
        ])
    out.seek(0)
    return StreamingResponse(iter([out.getvalue().encode("utf-8")]), media_type="text/csv",
                             headers={"Content-Disposition": f"attachment; filename=offers_{restaurant_id}.csv"})

@app.get("/api/v1/merchant/kpi")
async def kpi(restaurant_id: str, x_foody_key: str = Header(default="")):
    p = await pool()
    async with p.acquire() as conn:
        rid_ok = await auth(conn, x_foody_key, restaurant_id)
        if not rid_ok:
            raise HTTPException(401, "Invalid API key or restaurant_id")
        return {"reserved": 0, "redeemed": 0, "redemption_rate": 0.0, "revenue_cents": 0, "saved_cents": 0}

@app.post("/api/v1/merchant/redeem")
async def redeem(body: Dict[str, Any] = Body(...), x_foody_key: str = Header(default="")):
    return {"ok": False, "detail": "Reservations are not enabled on this server"}
