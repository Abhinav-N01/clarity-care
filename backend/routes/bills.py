from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
import pdfplumber
import json
import re
import io

router = APIRouter()

with open("data/cpt_codes.json") as f:
    CPT_CODES = json.load(f)
with open("data/icd10.json") as f:
    ICD10_CODES = json.load(f)

class BillTextInput(BaseModel):
    text: str

def parse_bill_text(text: str) -> dict:
    cpt_pattern = r'\b(\d{5})\b'
    icd_pattern = r'\b([A-Z]\d{2}\.?\d*[A-Z]?)\b'
    amount_pattern = r'\$?([\d,]+\.?\d{2})'

    found_cpts = re.findall(cpt_pattern, text)
    found_icds = re.findall(icd_pattern, text)
    amounts = re.findall(amount_pattern, text)

    decoded_items = []
    for cpt in found_cpts:
        if cpt in CPT_CODES:
            info = CPT_CODES[cpt]
            decoded_items.append({
                "code": cpt,
                "type": "CPT",
                "description": info["description"],
                "category": info["category"],
                "estimated_cost": info["avg_cost"]
            })

    diagnoses = []
    for icd in found_icds:
        if icd in ICD10_CODES:
            info = ICD10_CODES[icd]
            diagnoses.append({
                "code": icd,
                "clinical_term": info["description"],
                "plain_english": info["plain_english"]
            })

    extracted_amounts = [float(amt.replace(",", "")) for amt in amounts[:5]]
    total_estimated = sum(item["estimated_cost"] for item in decoded_items)

    return {
        "line_items": decoded_items,
        "diagnoses": diagnoses,
        "extracted_amounts": extracted_amounts,
        "total_billed_estimated": total_estimated,
        "summary": f"Found {len(decoded_items)} procedure(s) and {len(diagnoses)} diagnosis code(s)",
        "red_flags": check_red_flags(decoded_items, extracted_amounts, total_estimated)
    }

def check_red_flags(items, amounts, estimated_total) -> list:
    flags = []
    if amounts and estimated_total > 0:
        max_billed = max(amounts)
        if max_billed > estimated_total * 1.5:
            flags.append({
                "type": "OVERCHARGE",
                "message": f"Billed amount (${max_billed:,.2f}) is significantly higher than estimated fair price (${estimated_total:,.2f}). Consider requesting itemized bill."
            })

    categories = [item["category"] for item in items]
    if categories.count("Radiology") > 2:
        flags.append({
            "type": "DUPLICATE",
            "message": "Multiple radiology charges detected. Verify these were all necessary."
        })

    if not items:
        flags.append({
            "type": "INFO",
            "message": "No CPT codes detected. Paste the itemized bill text for better analysis."
        })

    return flags

@router.post("/translate")
async def translate_bill(input: BillTextInput):
    return parse_bill_text(input.text)

@router.post("/upload")
async def upload_bill(file: UploadFile = File(...)):
    if file.content_type not in ["application/pdf", "text/plain"]:
        raise HTTPException(400, "Only PDF and TXT files supported")

    content = await file.read()

    if file.content_type == "application/pdf":
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            text = "\n".join(page.extract_text() or "" for page in pdf.pages)
    else:
        text = content.decode("utf-8")

    result = parse_bill_text(text)
    result["filename"] = file.filename
    return result
