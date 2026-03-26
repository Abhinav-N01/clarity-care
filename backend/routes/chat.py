from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
import os

router = APIRouter()

SYSTEM_PROMPT = """You are Clarity, a friendly AI health billing assistant. You help patients understand medical costs, bills, and insurance.

You CAN and SHOULD answer questions like:
- "How much does tooth surgery cost?" → Give real ballpark estimates based on procedure type
- "How much is a root canal?" → Typical range $700-$1,500 without insurance, $200-$500 with
- "How much is a knee replacement?" → $30,000-$50,000 total, patient pays $3,000-$8,000 with insurance
- "What does an MRI cost?" → $400-$3,500 depending on type and location
- Cost questions about any medical procedure

For cost questions always give:
1. A realistic price range (uninsured and typical insured)
2. What affects the price (location, facility, insurance)
3. A money-saving tip

Common procedure costs (approximate):
- Dental cleaning: $75-$200 | Root canal: $700-$1,500 | Tooth extraction: $150-$500 | Dental implant: $3,000-$5,000
- Tooth surgery/oral surgery: $800-$3,000 depending on complexity
- MRI: $400-$3,500 | CT scan: $300-$6,750 | X-ray: $100-$1,000
- ER visit: $150-$3,000+ | Primary care visit: $100-$300
- Knee replacement: $30,000-$50,000 total | Hip replacement: $30,000-$45,000
- C-section: $10,000-$25,000 | Vaginal delivery: $5,000-$15,000
- Appendectomy: $10,000-$35,000 | Colonoscopy: $1,000-$4,000

Insurance facts:
- EOB = Explanation of Benefits (not a bill)
- 40-60% of insurance appeals succeed
- Patients have the right to an itemized bill
- No Surprises Act (2022) protects against unexpected out-of-network bills
- CPT codes = 5-digit procedure codes | ICD-10 = diagnosis codes

Be concise, empathetic, and give actual numbers. Never refuse a cost question — always give a range."""

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
                max_tokens=600,
                system=SYSTEM_PROMPT,
                messages=[{"role": m.role, "content": m.content} for m in input.messages]
            )
            return {"response": response.content[0].text, "source": "ai"}
        except Exception as e:
            print(f"AI fallback triggered: {e}")

    return {"response": rule_based_response(user_message), "source": "rules"}

def rule_based_response(message: str) -> str:
    msg = message.lower()

    # Cost questions
    if any(w in msg for w in ["tooth", "dental", "root canal", "extraction", "implant", "cavity", "crown"]):
        if any(w in msg for w in ["cost", "much", "price", "expensive", "pay", "surgery"]):
            return "Dental procedure costs (approximate):\n• Tooth extraction: $150–$500\n• Root canal: $700–$1,500\n• Oral/tooth surgery: $800–$3,000\n• Dental implant: $3,000–$5,000\n• With insurance you typically pay 20–50% of these amounts.\n\nTip: Ask for a treatment plan with cost breakdown before agreeing to any procedure."

    if any(w in msg for w in ["mri", "ct scan", "x-ray", "xray"]):
        if any(w in msg for w in ["cost", "much", "price", "pay"]):
            return "Imaging costs (approximate):\n• X-ray: $100–$1,000\n• CT scan: $300–$6,750\n• MRI: $400–$3,500\n\nWith insurance, you typically pay your copay + coinsurance (usually $100–$500). Outpatient imaging centers can be 50–70% cheaper than hospital radiology."

    if any(w in msg for w in ["knee", "hip", "replacement", "surgery"]):
        if any(w in msg for w in ["cost", "much", "price", "pay"]):
            return "Joint replacement costs:\n• Knee replacement: $30,000–$50,000 total\n• Hip replacement: $30,000–$45,000 total\n• With insurance (after deductible + coinsurance): typically $3,000–$8,000 out-of-pocket\n\nTip: Get pre-authorization from insurance and shop outpatient surgery centers vs. hospitals."

    if any(w in msg for w in ["er ", "emergency room", "emergency visit"]):
        if any(w in msg for w in ["cost", "much", "price", "pay"]):
            return "ER visit costs: $150–$3,000+ depending on severity. With insurance, expect $100–$1,000 after deductible and copay.\n\nTip: Urgent care centers cost 80% less for non-emergency issues ($100–$200 vs $1,000+ ER)."

    if any(w in msg for w in ["how much", "cost", "price", "expensive"]):
        return "For specific cost estimates, use the Treatment Cost Estimator tab. Generally:\n• Office visit: $100–$300\n• Lab work: $40–$200\n• Specialist visit: $150–$400\n• Common surgery: $5,000–$50,000\n\nYour actual cost depends on insurance type, facility, and location. What specific procedure are you asking about?"

    if any(w in msg for w in ["eob", "explanation of benefits"]):
        return "An Explanation of Benefits (EOB) is NOT a bill. It shows what your insurance paid and what you may owe. Wait for an actual bill from your provider before paying anything."

    if "appeal" in msg or "denied" in msg:
        return "If your claim was denied, you have the right to appeal. About 40-60% of appeals succeed. Get a denial letter, ask your doctor for a medical necessity letter, and file within 180 days."

    if "deductible" in msg:
        return "Your deductible is the amount you pay out-of-pocket each year before insurance starts covering costs. For example, with a $1,500 deductible, you pay the first $1,500 of covered care each year."

    if any(w in msg for w in ["overcharge", "too much", "billing error", "wrong charge"]):
        return "To dispute a bill: 1) Request an itemized bill in writing, 2) Compare charges to your EOB, 3) Look for duplicate charges, 4) Call the billing department. Hospitals also have financial assistance programs — ask about them."

    if "copay" in msg:
        return "A copay is a fixed amount you pay for a covered service — like $25 for a primary care visit. You pay this at the time of service, regardless of whether you've met your deductible."

    return "I can help with medical costs, bill explanations, insurance terms, and appeals. Try asking things like:\n• 'How much does a root canal cost?'\n• 'What does my EOB mean?'\n• 'How do I appeal a denied claim?'"
