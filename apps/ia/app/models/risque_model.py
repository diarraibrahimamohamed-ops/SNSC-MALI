class RisqueModel:
    def predict(self, features: dict):
        retards = features.get('retards_jours', 0)
        absences = features.get('rendez_vous_manques', 0)
        distance = features.get('distance_km', 5)
        
        # Heuristic rules mimicking a trained ML model
        score_base = (retards * 0.05) + (absences * 0.15) + (distance * 0.01)
        score = min(max(round(score_base, 2), 0.0), 1.0)
        
        if score < 0.3:
            niveau_risque = "FAIBLE"
            confiance = 0.90
        elif score < 0.7:
            niveau_risque = "MOYEN"
            confiance = 0.75
        else:
            niveau_risque = "ELEVE"
            confiance = 0.85
            
        return {
            "score": score,
            "niveau_risque": niveau_risque,
            "confiance": confiance,
            "version_modele": "v1.1.0-heuristic",
            "facteurs_explicatifs": {
                "impact_retard": "Fort" if retards > 10 else "Faible",
                "impact_distance": "Fort" if distance > 30 else "Faible",
                "impact_absence": "Fort" if absences >= 2 else "Faible"
            }
        }

model_instance = RisqueModel()
