from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
import os

router = APIRouter()

SYSTEM_PROMPT = """You are Clarity, an AI health billing assistant. You help patients understand:
- Medical bills and what charges mean
- Insurance terminology (EOBs, denials, appeals)
- Cost estimates for procedures
- Their rights as patients

You are NOT a medical doctor. You do NOT give medical advice. You only help with billing, insurance, and cost questions.

Key facts you know:
- CPT codes are 5-digit numbers identifying medical procedures
- ICD-10 codes identify diagnoses (letter + numbers)
- EOB = Explanation of Benefits (not a bill)
- 40-60% of insurance appeals succeed when properly filed
- Patients have the right to an itemized bill
- No Surprises Act (2022) protects against unexpected out-of-network bills

Be concise, empathetic, and actionable. If unsure, recommend calling the insurance member services number."""

class Message(BaseModel):
    role: str
    content: str

class ChatInput(BaseModel):
    messages: List[Message]
    use_ai: bool = True

@router.post("/message")
async def chat(input: ChatInput):
    user_message = input.messages[-1].content if input.messages else ""

    if input.use_ai:
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

            response = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=500,
                system=SYSTEM_PROMPT,
                messages=[{"role": m.role, "content": m.content} for m in input.messages]
            )
            return {"response": response.content[0].text, "source": "ai"}
        except Exception as e:
            print(f"AI fallback triggered: {e}")

    return {"response": rule_based_response(user_message), "source": "rules"}

def rule_based_response(message: str) -> str:
    msg = message.lower()

    if any(w in msg for w in ["eob", "explanation of benefits"]):
        return "An Explanation of Benefits (EOB) is NOT a bill. It shows what your insurance paid and what you may owe. Wait for an actual bill from your provider before paying anything."

    if "appeal" in msg or "denied" in msg:
        return "If your claim was denied, you have the right to appeal. About 40-60% of appeals succeed. Get a denial letter, ask your doctor for a medical necessity letter, and file within 180 days. Would you like an appeal letter template?"

    if "deductible" in msg:
        return "Your deductible is the amount you pay out-of-pocket each year before insurance starts covering costs. For example, with a $1,500 deductible, you pay the first $1,500 of covered care each year."

    if any(w in msg for w in ["overcharge", "too much", "billing error"]):
        return "To dispute a bill: 1) Request an itemized bill in writing, 2) Compare charges to your EOB, 3) Look for duplicate charges or unbundled services, 4) Call the billing department and ask them to review. You can also ask the hospital for financial assistance programs."

    if "copay" in msg:
        return "A copay is a fixed amount you pay for a covered service — like $25 for a primary care visit. You pay this at the time of service, regardless of whether you've met your deductible."

    return "I can help you understand medical bills, insurance terms, cost estimates, and how to appeal denied claims. What specific billing question do you have?"
