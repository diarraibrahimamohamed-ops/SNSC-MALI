from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class PredictRequest(BaseModel):
    enfant_id: str
    features: dict

@router.post("/predict")
def predict(payload: PredictRequest):
    return {
        "enfant_id": payload.enfant_id,
        "score": 0.42,
        "niveau_risque": "MOYEN",
        "confiance": 0.81,
        "facteurs_explicatifs": {"retard": 1, "assiduite": 0.6}
    }
