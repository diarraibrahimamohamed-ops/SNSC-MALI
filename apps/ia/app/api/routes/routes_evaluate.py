from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import logging

from app.services.predictor import RiskPredictor
from app.services.feature_engineering import FeatureEngineer

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/evaluate")
async def evaluate_risk(enfant_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Évalue le risque de retard vaccinal pour un enfant
    
    Args:
        enfant_data: Données de l'enfant incluant:
            - enfant_id: ID de l'enfant
            - age_en_mois: Âge en mois
            - vaccinations: Historique des vaccinations
            - caracteristiques: Caractéristiques démographiques
            
    Returns:
        Dict contenant:
            - risque_score: Score de risque (0-1)
            - risque_level: Niveau de risque (low/medium/high)
            - confidence: Intervalle de confiance
            - features: Features utilisées pour la prédiction
            - explications: Explications du modèle
    """
    try:
        predictor = RiskPredictor()
        feature_engineer = FeatureEngineer()
        
        # Extraire et transformer les features
        features = feature_engineer.extract_features(enfant_data)
        
        # Faire la prédiction
        prediction = predictor.predict(features)
        
        # Obtenir les explications
        explanations = predictor.explain(features)
        
        return {
            "enfant_id": enfant_data.get("enfant_id"),
            "risque_score": prediction["score"],
            "risque_level": prediction["level"],
            "confidence": prediction["confidence"],
            "features": features,
            "explications": explanations,
            "timestamp": str(enfant_data.get("timestamp", ""))
        }
        
    except Exception as e:
        logger.error(f"Error evaluating risk: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur lors de l'évaluation du risque")

@router.get("/evaluate/batch")
async def evaluate_batch_risks(enfant_ids: str) -> Dict[str, Any]:
    """
    Évalue les risques pour un lot d'enfants
    
    Args:
        enfant_ids: IDs des enfants séparés par des virgules
        
    Returns:
        Dict contenant les évaluations pour chaque enfant
    """
    try:
        ids = [id.strip() for id in enfant_ids.split(",") if id.strip()]
        predictor = RiskPredictor()
        feature_engineer = FeatureEngineer()
        
        results = []
        
        for enfant_id in ids:
            try:
                # Récupérer les données de l'enfant (à implémenter)
                enfant_data = await get_enfant_data(enfant_id)
                
                # Extraire les features
                features = feature_engineer.extract_features(enfant_data)
                
                # Faire la prédiction
                prediction = predictor.predict(features)
                
                results.append({
                    "enfant_id": enfant_id,
                    "risque_score": prediction["score"],
                    "risque_level": prediction["level"],
                    "confidence": prediction["confidence"]
                })
                
            except Exception as e:
                logger.error(f"Error evaluating risk for enfant {enfant_id}: {str(e)}")
                results.append({
                    "enfant_id": enfant_id,
                    "error": "Erreur lors de l'évaluation"
                })
        
        return {
            "results": results,
            "total_enfants": len(ids),
            "successful_evaluations": len([r for r in results if "error" not in r])
        }
        
    except Exception as e:
        logger.error(f"Error in batch evaluation: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur lors de l'évaluation par lot")

async def get_enfant_data(enfant_id: str) -> Dict[str, Any]:
    """
    Récupère les données d'un enfant depuis l'API principale
    """
    # À implémenter: appel à l'API Laravel
    pass
