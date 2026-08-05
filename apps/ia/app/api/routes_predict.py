from fastapi import APIRouter, Request, HTTPException
from slowapi import Limiter
from slowapi.util import get_remote_address
from pydantic import BaseModel
from typing import Dict, Any
from app.models.risque_model import model_instance
from app.models.schemas import PredictRequest
import uuid
import hashlib

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.post("/predict")
@limiter.limit("60/minute")
def predict(request: Request, payload: PredictRequest):
    # Generate request ID for audit trail
    request_id = str(uuid.uuid4())
    
    # Hash enfant_id for privacy in logs
    enfant_id_hash = hashlib.sha256(payload.enfant_id.encode()).hexdigest()[:16]
    
    # Pass features to the model
    prediction = model_instance.predict(payload.features)
    
    # Add audit metadata to response
    response = {
        "request_id": request_id,
        "enfant_id_hash": enfant_id_hash,
        "score": prediction["score"],
        "niveau_risque": prediction["niveau_risque"],
        "confiance": prediction["confiance"],
        "version_modele": prediction["version_modele"],
        "facteurs_explicatifs": prediction["facteurs_explicatifs"],
        "timestamp": request.state.request_id if hasattr(request.state, 'request_id') else request_id
    }
    
    return response
