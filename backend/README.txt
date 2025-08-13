Foody Backend — Full Pack

Routes:
- register/profile, offers (create/list/delete), public offers, CSV, KPI, redeem(stub).

ENV:
- DATABASE_URL
- CORS_ORIGINS (comma)
- RUN_MIGRATIONS=1

Run:
uvicorn backend.main:app --host 0.0.0.0 --port 8080
