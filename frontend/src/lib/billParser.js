import { CPT_CODES, ICD10_CODES } from './data'

export function parseBill(text) {
  const cptPattern = /\b(\d{5})\b/g
  const icdPattern = /\b([A-Z]\d{2}\.?\d*[A-Z]?)\b/g
  const amountPattern = /\$?([\d,]+\.\d{2})/g

  const foundCpts = [...new Set([...text.matchAll(cptPattern)].map(m => m[1]))]
  const foundIcds = [...new Set([...text.matchAll(icdPattern)].map(m => m[1]))]
  const amounts = [...text.matchAll(amountPattern)].map(m => parseFloat(m[1].replace(',', ''))).slice(0, 5)

  const lineItems = foundCpts
    .filter(c => CPT_CODES[c])
    .map(c => ({ code: c, type: 'CPT', ...CPT_CODES[c] }))

  const diagnoses = foundIcds
    .filter(c => ICD10_CODES[c])
    .map(c => ({ code: c, ...ICD10_CODES[c] }))

  const totalEstimated = lineItems.reduce((sum, i) => sum + i.avg_cost, 0)
  const redFlags = []

  if (amounts.length && totalEstimated > 0 && Math.max(...amounts) > totalEstimated * 1.5) {
    redFlags.push({ type: 'OVERCHARGE', message: `Billed amount ($${Math.max(...amounts).toLocaleString()}) is significantly higher than estimated fair price ($${totalEstimated.toLocaleString()}). Request an itemized bill.` })
  }
  if (lineItems.filter(i => i.category === 'Radiology').length > 2) {
    redFlags.push({ type: 'DUPLICATE', message: 'Multiple radiology charges detected. Verify all were necessary.' })
  }
  if (!lineItems.length) {
    redFlags.push({ type: 'INFO', message: 'No CPT codes detected. Paste the full itemized bill for better analysis.' })
  }

  return {
    line_items: lineItems,
    diagnoses,
    extracted_amounts: amounts,
    total_billed_estimated: totalEstimated,
    summary: `Found ${lineItems.length} procedure(s) and ${diagnoses.length} diagnosis code(s)`,
    red_flags: redFlags,
  }
}
