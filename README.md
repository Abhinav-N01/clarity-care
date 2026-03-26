# Clarity Care

> AI-powered health assistant that makes healthcare costs transparent and understandable.

**Live Demo:** https://abhinav-n01.github.io/clarity-care/

Clarity Care helps patients decode confusing medical bills, understand insurance Explanation 
of Benefits (EOB) documents, estimate treatment costs before appointments, and get answers 
to healthcare questions — all without needing to create an account or share personal data.

---

## Features

- **Medical Bill Translator** — Paste a medical bill and get a plain-English breakdown of 
  every line item, CPT procedure code, and ICD-10 diagnosis code
- **Insurance EOB Decoder** — Understand what your insurance covered, what was denied, 
  and what your next steps are (including appeal letter generation)
- **Treatment Cost Estimator** — Estimate out-of-pocket costs based on procedure, 
  insurance type, facility type, age, and ZIP code
- **AI Health Chat** — Ask healthcare questions, look up any CPT or ICD-10 code, 
  get plain-English explanations and guidance

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Routing | Client-side state (no React Router) |
| Deployment | GitHub Pages via GitHub Actions |
| Backend (optional) | FastAPI (Python) |
| ML Models | scikit-learn, pandas, numpy |

Fully client-side — no login required, no data sent to a server.

---

## Machine Learning Models

### Cost Estimation Model
- **Algorithm:** Gradient Boosted Regression (scikit-learn `GradientBoostingRegressor`)
- **Training data:** Synthetic claims dataset modeled after CMS Medicare fee schedules
- **Features used:** CPT code category, facility type (inpatient/outpatient/clinic), 
  insurance type (PPO/HMO/Medicare/Medicaid/uninsured), patient age group, geographic region
- **Output:** Estimated out-of-pocket cost range with low/mid/high confidence bands
- **Fallback:** Rule-based formula using CMS national average allowed amounts when 
  model confidence is low

### Bill Parser (NLP)
- **Approach:** Regex + rule-based NLP pipeline (no external API dependency)
- **Extracts:** CPT codes (5-digit procedure codes), ICD-10 codes (A00–Z99), 
  dollar amounts, provider names, service dates, adjustment codes
- **Code lookup:** Maps extracted codes to plain-English descriptions using a 
  curated local dictionary built from CMS and AMA code sets

### EOB Decoder
- **Approach:** Pattern matching + structured rule engine
- **Parses:** Claim adjustment reason codes (CARCs), remittance advice remark 
  codes (RARCs), denial reason codes
- **Output:** Plain-English explanation of each line, denial reason, 
  patient responsibility breakdown, and generated appeal letter template

---

## Data Standards & Integrations

### CMS (Centers for Medicare & Medicaid Services)
- CPT/HCPCS code descriptions sourced from CMS fee schedule data
- Medicare national average allowed amounts used as baseline for cost estimates
- Claim adjustment reason codes (CARCs) mapped to plain-English denial explanations
- Procedure-to-specialty mapping based on CMS provider taxonomy

### CPT Codes (Current Procedural Terminology)
- Covers 500+ common procedure codes across categories:
  - **Office Visits** (99201–99215) — E&M codes by complexity
  - **Surgery** (10000–69999) — by body system
  - **Radiology** (70000–79999) — X-ray, MRI, CT, ultrasound
  - **Pathology/Lab** (80000–89999) — blood panels, cultures, biopsies
  - **Medicine** (90000–99199) — injections, therapy, vaccines
- Each code mapped to: description, typical cost range, common insurance coverage status

### ICD-10 Codes (International Classification of Diseases)
- Diagnosis code lookup covering major categories (A–Z chapters)
- Plain-English translation of diagnosis codes found in bills and EOBs
- Flags codes commonly associated with claim denials or prior auth requirements

### HIPAA Compliance Considerations
- **No PHI stored** — zero personal health information is transmitted or persisted
- **Client-side processing** — all bill parsing and EOB decoding runs locally in the browser
- **No user accounts** — no login, no session tokens, no cookies with health data
- **Encryption** — all traffic served over HTTPS via GitHub Pages
- **Future:** Backend API would require HIPAA Business Associate Agreement (BAA), 
  encrypted database (AES-256), audit logging, and role-based access control

---

## Run Locally

```bash
# Clone the repo
git clone https://github.com/abhinav-n01/clarity-care.git
cd clarity-care/frontend

# Install dependencies
npm install

# Start dev server
npm run dev


How It Works

Bill Translator
Paste or select a sample medical bill
The parser extracts CPT codes, ICD-10 codes, and dollar amounts using regex
Each code is looked up in the local code dictionary
Results are displayed as a plain-English itemized breakdown with totals

EOB Decoder
Paste your Explanation of Benefits or load a sample
The decoder identifies denial codes, adjustment codes, and patient responsibility
Generates a plain-English explanation for each line item
Optionally generates an appeal letter template for denied claims

Cost Estimator
Select a procedure type, insurance plan, facility, and location
The estimator applies CMS-based pricing factors
Returns a low/mid/high cost range with what to expect

AI Chat
Ask any healthcare question in plain English
Type a CPT or ICD-10 code to get an instant explanation
Get guidance on appeals, deductibles, prior authorization, and more
