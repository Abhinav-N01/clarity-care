import { CPT_CODES, ICD10_CODES } from './data'

// Extended CPT lookup including codes that appear in the sample bills
const EXTENDED_CPT = {
  ...CPT_CODES,
  "99285": { description: "Emergency department visit, high complexity", avg_cost: 2400, category: "Emergency" },
  "99283": { description: "Emergency department visit, moderate complexity", avg_cost: 900, category: "Emergency" },
  "99213": { description: "Office visit, established patient, low complexity", avg_cost: 150, category: "Office Visit" },
  "99214": { description: "Office visit, established patient, moderate complexity", avg_cost: 250, category: "Office Visit" },
  "99396": { description: "Preventive visit, established patient, age 40–64", avg_cost: 250, category: "Preventive" },
  "99232": { description: "Subsequent hospital care, moderate complexity", avg_cost: 180, category: "Inpatient" },
  "27447": { description: "Total knee replacement (arthroplasty)", avg_cost: 35000, category: "Surgery" },
  "00400": { description: "Anesthesia, superficial procedures on integumentary system", avg_cost: 800, category: "Anesthesia" },
  "01402": { description: "Anesthesia, knee replacement surgery", avg_cost: 2200, category: "Anesthesia" },
  "97162": { description: "Physical therapy evaluation, moderate complexity", avg_cost: 175, category: "Therapy" },
  "93000": { description: "Electrocardiogram (EKG), 12-lead", avg_cost: 75, category: "Cardiac" },
  "93306": { description: "Echocardiogram, complete transthoracic", avg_cost: 1800, category: "Cardiac" },
  "93015": { description: "Cardiovascular stress test with supervision", avg_cost: 1200, category: "Cardiac" },
  "93458": { description: "Left heart catheterization with coronary angiography", avg_cost: 9500, category: "Cardiac" },
  "71046": { description: "Chest X-ray, 2 views", avg_cost: 200, category: "Radiology" },
  "70553": { description: "MRI brain with contrast", avg_cost: 1800, category: "Radiology" },
  "73721": { description: "MRI knee without contrast", avg_cost: 1200, category: "Radiology" },
  "73562": { description: "X-ray, knee, 3 views", avg_cost: 180, category: "Radiology" },
  "85025": { description: "Complete blood count (CBC) with differential", avg_cost: 40, category: "Lab" },
  "80053": { description: "Comprehensive metabolic panel", avg_cost: 55, category: "Lab" },
  "83036": { description: "Hemoglobin A1c", avg_cost: 50, category: "Lab" },
  "80061": { description: "Lipid panel (cholesterol)", avg_cost: 45, category: "Lab" },
  "86900": { description: "Blood typing, ABO", avg_cost: 30, category: "Lab" },
  "86901": { description: "Blood typing, Rh (D)", avg_cost: 30, category: "Lab" },
  "84443": { description: "Thyroid stimulating hormone (TSH)", avg_cost: 60, category: "Lab" },
  "96413": { description: "Chemotherapy infusion, up to 1 hour", avg_cost: 1800, category: "Infusion" },
  "96415": { description: "Chemotherapy infusion, each additional hour", avg_cost: 600, category: "Infusion" },
  "96360": { description: "IV infusion, hydration, initial 31 minutes", avg_cost: 200, category: "Infusion" },
  "96372": { description: "Therapeutic injection, subcutaneous/intramuscular", avg_cost: 85, category: "Infusion" },
  "90837": { description: "Psychotherapy, 60 minutes", avg_cost: 180, category: "Mental Health" },
  "59400": { description: "Routine obstetric care, vaginal delivery", avg_cost: 9500, category: "Obstetric" },
  "59515": { description: "Cesarean delivery, routine postpartum care", avg_cost: 14500, category: "Obstetric" },
  "99460": { description: "Newborn care, initial hospital evaluation", avg_cost: 350, category: "Newborn" },
  "59430": { description: "Postpartum care only", avg_cost: 500, category: "Obstetric" },
  "99213": { description: "Office visit, established patient, low complexity", avg_cost: 150, category: "Office Visit" },
  "90686": { description: "Flu vaccine, quadrivalent, intramuscular", avg_cost: 45, category: "Preventive" },
  "36415": { description: "Blood draw (venipuncture)", avg_cost: 20, category: "Lab" },
  "45378": { description: "Colonoscopy, diagnostic", avg_cost: 1800, category: "Procedure" },
  "43239": { description: "Upper GI endoscopy with biopsy", avg_cost: 1200, category: "Procedure" },
}

const EXTENDED_ICD10 = {
  ...ICD10_CODES,
  "I10":    { description: "Essential (primary) hypertension", plain_english: "High blood pressure" },
  "E11.9":  { description: "Type 2 diabetes mellitus without complications", plain_english: "Type 2 diabetes" },
  "J06.9":  { description: "Acute upper respiratory infection, unspecified", plain_english: "Upper respiratory infection / cold" },
  "R05.9":  { description: "Cough, unspecified", plain_english: "Persistent cough" },
  "M17.11": { description: "Primary osteoarthritis, right knee", plain_english: "Arthritis of the right knee" },
  "M79.621":{ description: "Pain in right upper arm", plain_english: "Right arm pain" },
  "Z96.651":{ description: "Presence of right artificial knee joint", plain_english: "Right knee replacement (history of)" },
  "I25.10": { description: "Atherosclerotic heart disease of native coronary artery", plain_english: "Coronary artery disease (plaque buildup in heart arteries)" },
  "I20.9":  { description: "Angina pectoris, unspecified", plain_english: "Chest pain (angina)" },
  "R07.9":  { description: "Chest pain, unspecified", plain_english: "Unexplained chest pain" },
  "C50.911":{ description: "Malignant neoplasm of unspecified site of right female breast", plain_english: "Right breast cancer" },
  "Z79.811":{ description: "Long-term (current) use of aromatase inhibitors", plain_english: "On hormonal cancer therapy long-term" },
  "Z23":    { description: "Encounter for immunization", plain_english: "Vaccine / immunization visit" },
  "Z00.00": { description: "Encounter for general adult medical examination without abnormal findings", plain_english: "Annual physical exam" },
  "Z34.32": { description: "Encounter for supervision of normal pregnancy, third trimester", plain_english: "Normal pregnancy, third trimester" },
  "Z37.0":  { description: "Single liveborn infant, delivered vaginally", plain_english: "Vaginal delivery, single healthy baby" },
  "O09.523":{ description: "Supervision of elderly multigravida, third trimester", plain_english: "Higher-risk pregnancy (older mother, third trimester)" },
  "E78.5":  { description: "Hyperlipidemia, unspecified", plain_english: "High cholesterol" },
  "N39.0":  { description: "Urinary tract infection, site not specified", plain_english: "Urinary tract infection (UTI)" },
}

// ── Core parser ─────────────────────────────────────────────────────────────
export function parseBill(text) {
  const lines = text.split('\n')

  // ── Extract metadata ──────────────────────────────────────────────────────
  const meta = extractMeta(text, lines)

  // ── Extract CPT code line items ───────────────────────────────────────────
  const lineItems = extractLineItems(text, lines)

  // ── Extract ICD-10 diagnosis codes ───────────────────────────────────────
  const diagnoses = extractDiagnoses(text)

  // ── Extract dollar totals ─────────────────────────────────────────────────
  const totals = extractTotals(text)

  // ── Red flags ─────────────────────────────────────────────────────────────
  const redFlags = detectRedFlags(lineItems, totals, text)

  // ── Summary sentence ──────────────────────────────────────────────────────
  const coveredPct = totals.billed && totals.patientOwes
    ? Math.round(((totals.billed - totals.patientOwes) / totals.billed) * 100)
    : null

  const summary = buildSummary(lineItems, diagnoses, totals, coveredPct)

  return {
    meta,
    line_items: lineItems,
    diagnoses,
    totals,
    covered_pct: coveredPct,
    red_flags: redFlags,
    summary,
  }
}

// ── Meta extraction ───────────────────────────────────────────────────────────
function extractMeta(text, lines) {
  const find = (patterns) => {
    for (const p of patterns) {
      const m = text.match(p)
      if (m) return m[1]?.trim()
    }
    return null
  }
  return {
    patient:   find([/Patient(?:\s+Name)?:\s*(.+)/i, /Name:\s*(.+)/i]),
    hospital:  find([/(?:Hospital|Facility|Provider|Clinic|Center|Medical Center|Health System):\s*(.+)/i]),
    date:      find([/(?:Date of Service|Service Date|DOS):\s*(.+)/i, /Date:\s*(.+)/i]),
    insurance: find([/(?:Insurance|Payer|Plan):\s*(.+)/i]),
    account:   find([/(?:Account|Acct)\s*#?:\s*(.+)/i]),
    member_id: find([/Member\s*ID:\s*(.+)/i]),
    npi:       find([/NPI:\s*(.+)/i]),
    provider:  find([/(?:Rendering Provider|Physician|Doctor|Attending):\s*(.+)/i]),
  }
}

// ── Line item extraction ──────────────────────────────────────────────────────
function extractLineItems(text, lines) {
  const items = []
  const seenCodes = new Set()

  // Try to parse pipe-delimited table rows: code | description | billed | ins | pt
  const pipeRow = /^\s*(\d{5})\s*\|([^|]+)\|\s*\$?([\d,]+\.?\d*)\s*\|\s*\$?([\d,]+\.?\d*)\s*\|\s*\$?([\d,]+\.?\d*)/
  for (const line of lines) {
    const m = line.match(pipeRow)
    if (m) {
      const code = m[1]
      if (seenCodes.has(code)) continue
      seenCodes.add(code)
      const known = EXTENDED_CPT[code]
      items.push({
        code,
        type: 'CPT',
        description: known?.description || m[2].trim(),
        category:    known?.category    || 'Service',
        avg_cost:    known?.avg_cost    || 0,
        billed:      parseAmt(m[3]),
        ins_paid:    parseAmt(m[4]),
        pt_owes:     parseAmt(m[5]),
      })
      continue
    }

    // Fallback: line starts with 5-digit code and has at least one dollar amount
    const basicRow = /^\s*(\d{5})[-\s]+(.+?)\s+\$([\d,]+\.?\d*)/
    const bm = line.match(basicRow)
    if (bm) {
      const code = bm[1]
      if (seenCodes.has(code)) continue
      seenCodes.add(code)
      const known = EXTENDED_CPT[code]
      const billed = parseAmt(bm[3])
      // Look for a second amount on the same line (patient owes)
      const allAmts = [...line.matchAll(/\$([\d,]+\.?\d*)/g)].map(x => parseAmt(x[1]))
      items.push({
        code,
        type: 'CPT',
        description: known?.description || bm[2].trim(),
        category:    known?.category    || 'Service',
        avg_cost:    known?.avg_cost    || 0,
        billed,
        ins_paid:    allAmts.length >= 2 ? allAmts[allAmts.length - 2] : null,
        pt_owes:     allAmts.length >= 2 ? allAmts[allAmts.length - 1] : null,
      })
    }
  }

  // If nothing found yet, scan text for any CPT codes
  if (items.length === 0) {
    const cptPattern = /\b(\d{5})\b/g
    for (const m of text.matchAll(cptPattern)) {
      const code = m[1]
      if (seenCodes.has(code) || !EXTENDED_CPT[code]) continue
      seenCodes.add(code)
      const known = EXTENDED_CPT[code]
      items.push({
        code, type: 'CPT',
        description: known.description,
        category:    known.category,
        avg_cost:    known.avg_cost,
        billed: null, ins_paid: null, pt_owes: null,
      })
    }
  }

  return items
}

// ── Diagnosis extraction ──────────────────────────────────────────────────────
function extractDiagnoses(text) {
  const icdPattern = /\b([A-Z]\d{2}\.?\d*[A-Z]?\d?)\b/g
  const seen = new Set()
  const results = []
  for (const m of text.matchAll(icdPattern)) {
    const code = m[1]
    if (seen.has(code)) continue
    seen.add(code)
    const known = EXTENDED_ICD10[code]
    if (known) results.push({ code, ...known })
  }
  return results
}

// ── Total extraction ──────────────────────────────────────────────────────────
function extractTotals(text) {
  const find = (patterns) => {
    for (const p of patterns) {
      const m = text.match(p)
      if (m) return parseAmt(m[1])
    }
    return null
  }
  return {
    billed:      find([/BILLED\s*TOTAL[:\s]+\$?([\d,]+\.?\d*)/i, /TOTAL\s*CHARGES?[:\s]+\$?([\d,]+\.?\d*)/i, /AMOUNT\s*BILLED[:\s]+\$?([\d,]+\.?\d*)/i]),
    adjustment:  find([/(?:INSURANCE\s*)?ADJ(?:USTMENT)?[:\s]+[-–]?\$?([\d,]+\.?\d*)/i, /CONTRACT(?:UAL)?\s*ADJ[:\s]+[-–]?\$?([\d,]+\.?\d*)/i]),
    insPaid:     find([/INSURANCE\s*PAID[:\s]+\$?([\d,]+\.?\d*)/i, /INS(?:URANCE)?\s*PAYMENT[:\s]+\$?([\d,]+\.?\d*)/i, /PLAN\s*PAID[:\s]+\$?([\d,]+\.?\d*)/i]),
    patientOwes: find([/PATIENT\s*(?:BALANCE|RESPONSIBILITY|AMOUNT\s*DUE|OWES?)[:\s]+\$?([\d,]+\.?\d*)/i, /(?:AMOUNT\s*)?(?:YOU\s*)?(?:DUE|OWE|BALANCE)[:\s]+\$?([\d,]+\.?\d*)/i, /TOTAL\s*DUE[:\s]+\$?([\d,]+\.?\d*)/i]),
  }
}

// ── Red flag detection ────────────────────────────────────────────────────────
function detectRedFlags(lineItems, totals, text) {
  const flags = []

  // 1. No itemized codes
  if (lineItems.length === 0) {
    flags.push({ severity: 'info', type: 'NO CODES FOUND', message: 'No CPT procedure codes detected. Request a fully itemized bill showing each service code to verify every charge.' })
    return flags
  }

  // 2. Bill significantly higher than estimated fair price
  const estimatedTotal = lineItems.reduce((s, i) => s + (i.billed || i.avg_cost), 0)
  if (totals.billed && totals.billed > estimatedTotal * 1.3) {
    flags.push({ severity: 'error', type: 'POSSIBLE OVERCHARGE', message: `Billed amount ($${totals.billed.toLocaleString()}) is ${Math.round((totals.billed / estimatedTotal - 1) * 100)}% above the estimated fair price ($${estimatedTotal.toLocaleString()}). Request an itemized explanation for each line.` })
  }

  // 3. Facility fee flagged
  if (/facility fee|room & board|room and board|facility charge/i.test(text)) {
    flags.push({ severity: 'warning', type: 'FACILITY FEE DETECTED', message: 'Facility fees can double your bill. Verify this is in-network and matches your insurance plan\'s coverage for facility charges.' })
  }

  // 4. Anesthesia billed separately
  const hasAnesthesia = lineItems.some(i => i.category === 'Anesthesia')
  const hasSurgery    = lineItems.some(i => i.category === 'Surgery')
  if (hasAnesthesia && hasSurgery) {
    flags.push({ severity: 'info', type: 'ANESTHESIA BILLED SEPARATELY', message: 'Anesthesia is billed as a separate service by a different provider. Verify the anesthesiologist is also in-network — they often are not, creating surprise bills.' })
  }

  // 5. Multiple radiology codes
  const radiology = lineItems.filter(i => i.category === 'Radiology')
  if (radiology.length > 2) {
    flags.push({ severity: 'warning', type: 'MULTIPLE IMAGING CHARGES', message: `${radiology.length} imaging charges detected (${radiology.map(r => r.code).join(', ')}). Verify each study was ordered separately and medically necessary.` })
  }

  // 6. Duplicate procedure categories
  const categories = lineItems.map(i => i.category)
  const dupCats = categories.filter((c, i) => categories.indexOf(c) !== i && c !== 'Lab')
  if (dupCats.length > 0) {
    flags.push({ severity: 'warning', type: 'POSSIBLE DUPLICATE CHARGE', message: `Multiple charges in the same category (${[...new Set(dupCats)].join(', ')}). Confirm these represent separate, distinct services.` })
  }

  // 7. High E&M level with procedure same day (modifier -25 issue)
  const hasHighEM = lineItems.some(i => ['99214', '99215', '99285'].includes(i.code))
  const hasProcedure = lineItems.some(i => ['Surgery', 'Procedure', 'Cardiac'].includes(i.category))
  if (hasHighEM && hasProcedure) {
    flags.push({ severity: 'info', type: 'OFFICE VISIT + PROCEDURE SAME DAY', message: 'An office visit and a procedure are billed on the same date. This requires modifier -25 on the office visit. If not documented, your insurer may deny the office visit charge. Verify with your provider.' })
  }

  // 8. Infusion charges — verify hours
  const infusionHours = lineItems.filter(i => ['96413', '96415'].includes(i.code))
  if (infusionHours.length >= 2) {
    flags.push({ severity: 'info', type: 'INFUSION TIME BILLED', message: `${infusionHours.length} infusion hour codes billed. Ask your provider to confirm the infusion log matches the hours billed — extra hours are a common billing error.` })
  }

  // 9. Patient owes more than 40% of billed
  if (totals.billed && totals.patientOwes && (totals.patientOwes / totals.billed) > 0.4) {
    flags.push({ severity: 'warning', type: 'HIGH PATIENT RESPONSIBILITY', message: `You are being asked to pay ${Math.round((totals.patientOwes / totals.billed) * 100)}% of the total bill. Ask the billing department about financial assistance, payment plans, or charity care programs.` })
  }

  // 10. Global OB bundle unbundled
  if (lineItems.some(i => i.code === '59400' || i.code === '59515') &&
      lineItems.some(i => i.code === '59430')) {
    flags.push({ severity: 'error', type: 'POSSIBLE UNBUNDLING — OB CARE', message: 'Global OB delivery code AND postpartum care are billed separately. Postpartum care is typically included in the global OB package. Dispute if both are charged.' })
  }

  return flags
}

// ── Summary ────────────────────────────────────────────────────────────────────
function buildSummary(lineItems, diagnoses, totals, coveredPct) {
  let s = `Found ${lineItems.length} procedure${lineItems.length !== 1 ? 's' : ''}`
  if (diagnoses.length) s += ` and ${diagnoses.length} diagnosis code${diagnoses.length !== 1 ? 's' : ''}`
  if (totals.billed) s += `. Total billed: $${totals.billed.toLocaleString()}`
  if (totals.patientOwes) s += ` — you owe: $${totals.patientOwes.toLocaleString()}`
  if (coveredPct !== null) s += ` (insurance covered ${coveredPct}%)`
  return s + '.'
}

// ── Helper ─────────────────────────────────────────────────────────────────────
function parseAmt(str) {
  if (!str) return null
  const n = parseFloat(String(str).replace(/,/g, ''))
  return isNaN(n) ? null : n
}
