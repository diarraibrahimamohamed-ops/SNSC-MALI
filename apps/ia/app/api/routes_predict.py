from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any
from app.models.risque_model import model_instance

router = APIRouter()

class PredictRequest(BaseModel):
    enfant_id: str
    features: Dict[str, Any]

@router.post("/predict")
def predict(payload: PredictRequest):
    # Pass features to the model
    prediction = model_instance.predict(payload.features)
    
    return {
        "enfant_id": payload.enfant_id,
        "score": prediction["score"],
        "niveau_risque": prediction["niveau_risque"],
        "confiance": prediction["confiance"],
        "version_modele": prediction["version_modele"],
        "facteurs_explicatifs": prediction["facteurs_explicatifs"]
    }
