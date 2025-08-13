from fastapi import FastAPI
from backend.compat_addons_v2 import router
app=FastAPI()
app.include_router(router)
