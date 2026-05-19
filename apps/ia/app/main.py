from fastapi import FastAPI
from app.api.routes_health import router as health_router
from app.api.routes_predict import router as predict_router

app = FastAPI(title="Vaccin Track IA Service")

app.include_router(health_router)
app.include_router(predict_router)
