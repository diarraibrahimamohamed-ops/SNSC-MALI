from pydantic import BaseModel, Field, field_validator
from typing import Dict, Any, Optional
import re

class PredictPayload(BaseModel):
    enfant_id: str = Field(..., min_length=1, max_length=255, description="ID opaque de l'enfant")
    features: Dict[str, Any] = Field(..., description="Caractéristiques anonymisées pour la prédiction")
    
    @field_validator('features')
    @classmethod
    def validate_features(cls, v: Dict[str, Any]) -> Dict[str, Any]:
        # Filtrer toute PII potentielle
        forbidden_keys = ['nom', 'prenom', 'name', 'first_name', 'last_name', 'telephone', 'phone', 'email', 'adresse', 'address']
        
        for key in forbidden_keys:
            if key.lower() in [k.lower() for k in v.keys()]:
                raise ValueError(f"Clé interdite détectée: {key}. Les données PII ne doivent pas être envoyées.")
        
        # Valider les champs numériques
        if 'retards_jours' in v:
            if not isinstance(v['retards_jours'], (int, float)) or v['retards_jours'] < 0 or v['retards_jours'] > 10000:
                raise ValueError("retards_jours doit être un nombre entre 0 et 10000")
        
        if 'confloat' in v:
            if not isinstance(v['confloat'], (int, float)) or v['confloat'] < 0 or v['confloat'] > 10000:
                raise ValueError("confloat doit être un nombre entre 0 et 10000")
        
        return v

class PredictRequest(BaseModel):
    enfant_id: str = Field(..., min_length=1, max_length=255, description="ID opaque de l'enfant")
    features: Dict[str, Any] = Field(..., description="Caractéristiques anonymisées pour la prédiction")
    
    @field_validator('features')
    @classmethod
    def validate_features(cls, v: Dict[str, Any]) -> Dict[str, Any]:
        # Filtrer toute PII potentielle
        forbidden_keys = ['nom', 'prenom', 'name', 'first_name', 'last_name', 'telephone', 'phone', 'email', 'adresse', 'address']
        
        for key in forbidden_keys:
            if key.lower() in [k.lower() for k in v.keys()]:
                raise ValueError(f"Clé interdite détectée: {key}. Les données PII ne doivent pas être envoyées.")
        
        # Valider les champs numériques
        if 'retards_jours' in v:
            if not isinstance(v['retards_jours'], (int, float)) or v['retards_jours'] < 0 or v['retards_jours'] > 10000:
                raise ValueError("retards_jours doit être un nombre entre 0 et 10000")
        
        if 'confloat' in v:
            if not isinstance(v['confloat'], (int, float)) or v['confloat'] < 0 or v['confloat'] > 10000:
                raise ValueError("confloat doit être un nombre entre 0 et 10000")
        
        return v
