# Foody v1.7 Backend Patch (FastAPI)

Цели v1.7:
- Повторный вход в ЛК (JWT, /auth/login, /auth/me, /auth/logout)
- Архив офферов (/offers/:id/archive, фильтры по статусу)
- CSV-экспорт офферов (/exports/offers.csv)
- Фича-флаг «Резерв» (FEATURE_RESERVE), корректные ответы вместо 404

## Быстрый старт (Railway)

1) Создайте сервис **Python** и укажите переменные окружения:
- `DATABASE_URL` — PostgreSQL (формат: postgresql+psycopg://user:pass@host:port/dbname)
- `JWT_SECRET` — длинная строка (32+ символа)
- `FEATURE_RESERVE` — `true` или `false` (по умолчанию `false`)
- `PORT` — Railway задаёт сам, приложение его подхватит автоматически

2) Deploy:
- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

## Локально
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL=postgresql+psycopg://user:pass@localhost:5432/foody
export JWT_SECRET=supersecretchangeit
uvicorn app.main:app --reload
```

## Модели (вкратце)
- restaurants: email (unique), name, password_hash, city, address, lat, lng
- offers: restaurant_id, title, original_price_cents, final_price_cents, status, start_at, close_at, discount_schedule(JSON), discount_stage
- reservations: (заложено под v1.8), пока не используется в API

> Таблицы создаются автоматически при старте (SQLAlchemy metadata.create_all). Для прод-миграций позже добавим Alembic.

## API (ключевое)
- POST /auth/register
- POST /auth/login
- GET  /auth/me
- POST /auth/logout (заглушка для совместимости фронта)
- GET  /offers?status=active|archived&limit=...
- POST /offers
- PATCH /offers/{id}
- POST /offers/{id}/archive
- GET  /exports/offers.csv?from=YYYY-MM-DD&to=YYYY-MM-DD&status=...

## CSV
Колонки: id, restaurant_id, title, original_price_cents, final_price_cents, discount_stage, status, created_at, sold_at.

## Примечания
- Ответ «Резерв недоступен…» теперь 501 (если FEATURE_RESERVE=false), а не 404.
- Вход без повторной регистрации: через /auth/login с email+password.
- Уникальность email обеспечена на уровне БД (при первом старте — создаётся индекс).
