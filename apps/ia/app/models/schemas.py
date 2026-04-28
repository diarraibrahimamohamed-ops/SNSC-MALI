from pydantic import BaseModel
from typing import Dict, Any

class PredictPayload(BaseModel):
    enfant_id: str
    features: Dict[str, Any]
