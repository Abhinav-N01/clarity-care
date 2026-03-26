import { EOB_TERMS, DENIAL_REASONS } from './data'

export function decodeEOB(text) {
  const lower = text.toLowerCase()

  const foundTerms = Object.entries(EOB_TERMS)
    .filter(([term]) => lower.includes(term))
    .map(([term, explanation]) => ({ term: term.replace(/\b\w/g, c => c.toUpperCase()), explanation }))

  const allTerms = Object.entries(EOB_TERMS).map(([term, explanation]) => ({
    term: term.replace(/\b\w/g, c => c.toUpperCase()), explanation
  }))

  const amounts = [...text.matchAll(/\$?([\d,]+\.\d{2})/g)]
    .map(m => parseFloat(m[1].replace(',', ''))).slice(0, 8)

  const eobSummary = parseEOBColumns(text)

  return {
    decoded_terms: foundTerms.length ? foundTerms : allTerms,
    terms_found: foundTerms.length,
    showed_all: foundTerms.length === 0,
    extracted_amounts: amounts,
    eob_summary: eobSummary,
    action_items: [
      "This EOB is NOT a bill — wait for an actual invoice before paying",
      "Compare 'Amount Billed' vs 'Allowed Amount' — you are NOT responsible for the difference",
      "Check if your provider is in-network to ensure correct rates",
      "Verify your deductible and out-of-pocket maximum on your insurer's website",
      "If 'Patient Responsibility' seems too high, call the member services number on your card",
    ],
  }
}

function parseEOBColumns(text) {
  const patterns = {
    billed_amount:      /(?:amount billed|billed amount|charges?)[:\s]+\$?([\d,]+\.?\d{0,2})/i,
    allowed_amount:     /(?:allowed amount|plan allowed|eligible amount)[:\s]+\$?([\d,]+\.?\d{0,2})/i,
    plan_paid:          /(?:plan paid|insurance paid|amount paid|we paid)[:\s]+\$?([\d,]+\.?\d{0,2})/i,
    patient_owes:       /(?:patient responsibility|you owe|your share|member responsibility)[:\s]+\$?([\d,]+\.?\d{0,2})/i,
    deductible_applied: /(?:deductible applied|applied to deductible)[:\s]+\$?([\d,]+\.?\d{0,2})/i,
    copay:              /(?:copay|co-pay)[:\s]+\$?([\d,]+\.?\d{0,2})/i,
  }
  const result = {}
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern)
    if (match) result[key] = parseFloat(match[1].replace(',', ''))
  }
  return result
}

export function explainDenial(code, serviceDescription = '', amountDenied = 0) {
  const upper = code.toUpperCase().trim()
  const info = DENIAL_REASONS[upper]

  const appeal = generateAppeal(upper, serviceDescription, amountDenied)

  if (info) {
    return { code: upper, reason: info.reason, recommended_action: info.action, appeal_template: appeal, success_rate: '40-60% of appeals are successful', deadline: 'Most insurers require appeals within 180 days of denial' }
  }
  return { code: upper, reason: 'Denial code not found in database', recommended_action: 'Call the member services number on your insurance card and ask for a detailed explanation.', appeal_template: appeal, success_rate: '40-60% of appeals are successful', deadline: 'Most insurers require appeals within 180 days of denial' }
}

function generateAppeal(code, service, amount) {
  return `INSURANCE APPEAL LETTER TEMPLATE

Date: [TODAY'S DATE]
Member ID: [YOUR MEMBER ID]
Claim Number: [CLAIM NUMBER]

Dear Appeals Department,

I am writing to appeal the denial of my claim (Denial Code: ${code}) for ${service || 'the service listed on my EOB'}${amount ? ` in the amount of $${Number(amount).toLocaleString()}` : ''}.

I believe this denial was made in error because:
1. This service was medically necessary as determined by my treating physician
2. [ADD YOUR SPECIFIC REASON HERE]

I am requesting reconsideration and approval of payment. Enclosed please find:
- Copy of the Explanation of Benefits
- Letter of Medical Necessity from my physician (if applicable)
- Supporting medical records

Please respond within 30 days per your policy guidelines.

Sincerely,
[YOUR NAME]
[CONTACT INFORMATION]`
}
