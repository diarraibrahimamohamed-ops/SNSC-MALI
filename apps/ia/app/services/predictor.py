from app.models.risque_model import RisqueModel

def predict(features: dict) -> float:
    model = RisqueModel()
    return model.predict(features)
