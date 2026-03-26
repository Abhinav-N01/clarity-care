import { CPT_CODES } from './data'

const INSURANCE_FACTORS = { PPO: 1.0, HMO: 0.85, HDHP: 0.95, Medicare: 0.75, Medicaid: 0.6 }
const FACILITY_FACTORS  = { Hospital: 1.3, Outpatient: 1.0, Clinic: 0.8 }
const EXPENSIVE_ZIPS    = ['100', '941', '900', '021', '941', '100']

export function estimateCost({ cpt_code, insurance_type, facility_type, age, zip_code }) {
  const cpt = CPT_CODES[cpt_code]
  if (!cpt) return { error: 'Unknown procedure code' }

  const base = cpt.avg_cost
  const insuranceFactor = INSURANCE_FACTORS[insurance_type] ?? 1.0
  const facilityFactor  = FACILITY_FACTORS[facility_type]  ?? 1.0
  const stateFactor     = EXPENSIVE_ZIPS.includes((zip_code || '').slice(0, 3)) ? 1.35
                        : ['3','4','5'].includes((zip_code || '')[0]) ? 0.85 : 1.0
  const ageFactor       = age >= 65 ? 1.1 : 1.0

  const totalCost    = base * facilityFactor * stateFactor
  const patientCost  = totalCost * insuranceFactor * ageFactor * 0.25  // ~25% avg patient share

  const tips = ['Always request an itemized bill', 'Ask about payment plans before your visit']
  if (facility_type === 'Hospital') tips.push('Outpatient surgery centers can cost 50–70% less for the same procedure')
  if (insurance_type === 'HDHP')    tips.push('You likely have an HSA — use it for tax-free payment')
  if (['Medicare','Medicaid'].includes(insurance_type)) tips.push('Ask about programs to reduce cost-sharing for low-income patients')

  return {
    predicted_patient_cost: Math.round(patientCost),
    low_estimate:  Math.round(patientCost * 0.7),
    high_estimate: Math.round(patientCost * 1.4),
    confidence: 'Medium (±35%)',
    procedure: cpt.description,
    national_avg_total: base,
    tips,
  }
}
