from fastapi import APIRouter
from pydantic import BaseModel
from models.cost_model import get_predictor
import json

router = APIRouter()

with open("data/cpt_codes.json") as f:
    CPT_CODES = json.load(f)

class PredictInput(BaseModel):
    cpt_code: str
    insurance_type: str
    facility_type: str
    age: int
    zip_code: str = "10001"

@router.post("/cost")
async def predict_cost(input: PredictInput):
    predictor = get_predictor()

    state_index = 1.0
    expensive_zips = ["100", "941", "900", "021"]
    if input.zip_code[:3] in expensive_zips:
        state_index = 1.35
    elif input.zip_code[:1] in ["3", "4", "5"]:
        state_index = 0.85

    result = predictor.predict(
        input.cpt_code, input.insurance_type,
        input.facility_type, input.age, state_index
    )

    cpt_info = CPT_CODES.get(input.cpt_code, {})
    result["procedure"] = cpt_info.get("description", "Unknown procedure")
    result["national_avg_total"] = cpt_info.get("avg_cost", 0)
    result["tips"] = get_cost_saving_tips(input.insurance_type, input.facility_type)

    return result

def get_cost_saving_tips(insurance: str, facility: str) -> list:
    tips = ["Always request an itemized bill", "Ask about payment plans before your visit"]
    if facility == "Hospital":
        tips.append("Outpatient surgery centers can cost 50-70% less for the same procedure")
    if insurance == "HDHP":
        tips.append("You likely have an HSA — use it for tax-free payment")
    if insurance in ["Medicare", "Medicaid"]:
        tips.append("Ask about programs to reduce cost-sharing for low-income patients")
    return tips

@router.get("/procedures")
async def list_procedures():
    return {"procedures": [{"code": k, "name": v["description"], "avg_cost": v["avg_cost"]}
                           for k, v in CPT_CODES.items()]}
