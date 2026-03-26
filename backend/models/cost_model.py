import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_percentage_error

class CostPredictor:
    def __init__(self):
        self.model = None
        self.encoders = {}
        self.trained = False
        self._train()

    def _train(self):
        df = pd.read_csv("data/dummy_claims.csv")

        cat_cols = ["cpt_code", "insurance_type", "facility_type"]
        for col in cat_cols:
            le = LabelEncoder()
            df[col + "_enc"] = le.fit_transform(df[col])
            self.encoders[col] = le

        features = ["cpt_code_enc", "insurance_type_enc", "facility_type_enc", "age", "state_cost_index"]
        X = df[features]
        y = df["patient_responsibility"]

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        self.model = GradientBoostingRegressor(n_estimators=100, random_state=42)
        self.model.fit(X_train, y_train)

        preds = self.model.predict(X_test)
        mape = mean_absolute_percentage_error(y_test, preds)
        print(f"Cost model trained. MAPE: {mape:.1%}")
        self.trained = True

    def predict(self, cpt_code: str, insurance_type: str, facility_type: str, age: int, state_index: float = 1.0) -> dict:
        try:
            features = {
                "cpt_code_enc": self.encoders["cpt_code"].transform([cpt_code])[0],
                "insurance_type_enc": self.encoders["insurance_type"].transform([insurance_type])[0],
                "facility_type_enc": self.encoders["facility_type"].transform([facility_type])[0],
                "age": age,
                "state_cost_index": state_index
            }
            X = pd.DataFrame([features])
            prediction = self.model.predict(X)[0]

            return {
                "predicted_patient_cost": round(prediction, 2),
                "low_estimate": round(prediction * 0.7, 2),
                "high_estimate": round(prediction * 1.4, 2),
                "confidence": "Medium (±35%)",
                "factors": {
                    "insurance_type": insurance_type,
                    "facility_type": facility_type,
                    "age_factor": "Higher costs typical for age 65+" if age >= 65 else "Standard"
                }
            }
        except Exception as e:
            return {
                "predicted_patient_cost": 0,
                "error": str(e),
                "message": "Could not predict — try a different CPT code or insurance type"
            }

_predictor_instance = None

def get_predictor():
    global _predictor_instance
    if _predictor_instance is None:
        _predictor_instance = CostPredictor()
    return _predictor_instance
