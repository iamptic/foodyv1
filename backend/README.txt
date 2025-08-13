Run:
  DATABASE_URL=... RUN_MIGRATIONS=1 CORS_ORIGINS=<web/bot urls>
  uvicorn main:app --host 0.0.0.0 --port 8080

New endpoints:
  GET  /api/v1/offers?sort=expiry|price|new|distance&lat=..&lon=..&city=..
  POST /api/v1/reservations {offer_id}
  POST /api/v1/reservations/redeem {code}  (header X-Foody-Key of merchant required)
  Offers accept RUB via 'price'/'original_price' or 'price_cents'
  Offers include 'photo_url'; edit via POST /api/v1/merchant/offers/{offer_id}
