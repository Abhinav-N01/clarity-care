from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

EOB_TERMS = {
    "deductible": "The amount you pay out-of-pocket before your insurance starts paying. Resets yearly.",
    "copay": "A fixed amount you pay for a covered service (e.g., $25 per visit).",
    "coinsurance": "Your share of costs AFTER meeting your deductible (e.g., 20% means you pay 20%, insurance pays 80%).",
    "out-of-pocket maximum": "The most you'll pay in a year. After this, insurance covers 100%.",
    "allowed amount": "The max your insurer will pay for a service. You may owe the difference if provider is out-of-network.",
    "balance billing": "When an out-of-network provider bills you for the difference between their charge and insurance payment.",
    "prior authorization": "Approval you must get BEFORE receiving certain services or your claim may be denied.",
    "formulary": "List of drugs your insurance covers. Drugs not on this list cost more or aren't covered.",
    "in-network": "Providers who have contracts with your insurer — you pay less.",
    "out-of-network": "Providers without insurer contracts — you pay more, sometimes everything.",
    "explanation of benefits": "A summary from your insurer showing what they paid and what you owe. NOT a bill.",
    "claim denied": "Insurance refused to pay. You can appeal — 40-60% of appeals succeed.",
    "coordination of benefits": "Process when you have two insurance plans to determine which pays first.",
    "premium": "Monthly amount you pay to keep insurance active, regardless of whether you use it."
}

DENIAL_REASONS = {
    "CO-4": {"reason": "Service inconsistent with diagnosis", "action": "Request review with supporting medical records from your doctor"},
    "CO-11": {"reason": "Diagnosis inconsistent with procedure", "action": "Ask your doctor to verify and resubmit with corrected codes"},
    "CO-16": {"reason": "Claim lacks information", "action": "Contact provider billing office to resubmit with complete information"},
    "CO-97": {"reason": "Bundled service not separately billable", "action": "Ask for itemized bill explanation; this may be correct"},
    "PR-1": {"reason": "Deductible not met", "action": "This is correct if you haven't met your deductible. Check your deductible status."},
    "PR-2": {"reason": "Coinsurance amount", "action": "This is your required coinsurance share. Verify percentage matches your plan."},
    "PR-204": {"reason": "Not covered by plan", "action": "Review your plan documents; consider filing an appeal with medical necessity letter"},
    "OA-23": {"reason": "Payment adjusted due to prior payment", "action": "Review your EOB for previous payments on this claim"}
}

class EOBInput(BaseModel):
    text: str
    plan_type: Optional[str] = "PPO"

class ClaimInput(BaseModel):
    denial_code: str
    service_description: Optional[str] = ""
    amount_denied: Optional[float] = 0.0

@router.post("/decode-eob")
async def decode_eob(input: EOBInput):
    text_lower = input.text.lower()
    found_terms = []

    for term, explanation in EOB_TERMS.items():
        if term in text_lower:
            found_terms.append({
                "term": term.title(),
                "explanation": explanation
            })

    import re
    amounts = re.findall(r'\$?([\d,]+\.?\d{2})', input.text)

    return {
        "decoded_terms": found_terms,
        "terms_found": len(found_terms),
        "extracted_amounts": [float(a.replace(",", "")) for a in amounts[:8]],
        "action_items": [
            "Compare 'Amount Billed' vs 'Allowed Amount' — the difference is not your responsibility",
            "Check if provider is in-network to ensure correct rates",
            "Verify your deductible and out-of-pocket status online",
            "Keep this EOB until you receive an actual bill from your provider"
        ],
        "plan_type": input.plan_type
    }

@router.post("/explain-denial")
async def explain_denial(input: ClaimInput):
    code = input.denial_code.upper().strip()

    if code in DENIAL_REASONS:
        info = DENIAL_REASONS[code]
        return {
            "code": code,
            "reason": info["reason"],
            "recommended_action": info["action"],
            "appeal_template": generate_appeal_template(code, input.service_description, input.amount_denied),
            "success_rate": "40-60% of appeals are successful",
            "deadline": "Most insurers require appeals within 180 days of denial"
        }

    return {
        "code": code,
        "reason": "Denial code not found in database",
        "recommended_action": "Call the member services number on your insurance card and ask for a detailed explanation of this denial code",
        "appeal_template": generate_appeal_template(code, input.service_description, input.amount_denied)
    }

def generate_appeal_template(code: str, service: str, amount: float) -> str:
    return f"""INSURANCE APPEAL LETTER TEMPLATE

Date: [TODAY'S DATE]
Member ID: [YOUR MEMBER ID]
Claim Number: [CLAIM NUMBER]

Dear Appeals Department,

I am writing to appeal the denial of my claim (Denial Code: {code}) for {service or 'the service listed on my EOB'}{f' in the amount of ${amount:,.2f}' if amount else ''}.

I believe this denial was made in error because:
1. This service was medically necessary as determined by my treating physician
2. [ADD YOUR SPECIFIC REASON HERE]

I am requesting that you reconsider this claim and approve payment. Enclosed please find:
- Copy of the Explanation of Benefits
- Letter of Medical Necessity from my physician (if applicable)
- Supporting medical records

Please respond within 30 days per your policy guidelines.

Sincerely,
[YOUR NAME]
[CONTACT INFORMATION]""".strip()

@router.get("/glossary")
async def get_glossary():
    return {"terms": [{"term": k.title(), "definition": v} for k, v in EOB_TERMS.items()]}
