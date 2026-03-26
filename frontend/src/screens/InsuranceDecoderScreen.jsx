import { useState } from 'react'
import { decodeEOB, explainDenial } from '../lib/insuranceDecoder'
import Navbar from '../components/Navbar'

const SAMPLE_EOBS = [
  {
    label: 'Sample 1 — Emily Carter · Aetna PPO · Knee MRI',
    tag: 'Imaging · CO-45 adjustment',
    text: `EXPLANATION OF BENEFITS
Aetna PPO Plan — Member Services: 1-800-872-3862
─────────────────────────────────────────────────
Member: Emily Carter               Member ID: AET-4821093
Group #: GRP-00441                 Claim #: AET-2024-7741882
Date of Service: 09/12/2024        Processed: 09/20/2024
─────────────────────────────────────────────────
Provider: Northside Radiology Associates (IN-NETWORK)
Referring Physician: Dr. Kevin Marsh, MD (Orthopedics)

SERVICES RENDERED
─────────────────────────────────────────────────
CPT 73721 — MRI Right Knee w/ Contrast
  Amount Billed:        $2,450.00
  Allowed Amount:       $1,180.00
  Contractual Adj (CO-45): $1,270.00
  Deductible Applied:   $500.00
  Coinsurance (20%):    $136.00
  Plan Paid:            $544.00
  Patient Responsibility: $636.00

CPT 99213 — Office Consultation (Pre-Auth Visit)
  Amount Billed:        $320.00
  Allowed Amount:       $195.00
  Contractual Adj (CO-45): $125.00
  Deductible Applied:   $0.00
  Copay:                $30.00
  Plan Paid:            $165.00
  Patient Responsibility: $30.00

─────────────────────────────────────────────────
CLAIM TOTALS
  Total Billed:         $2,770.00
  Total Allowed:        $1,375.00
  Total Adjustments:    $1,395.00
  Deductible Applied:   $500.00
  Copay:                $30.00
  Coinsurance:          $136.00
  Plan Paid:            $709.00
  Patient Responsibility: $666.00

DEDUCTIBLE STATUS: $500.00 of $1,500.00 annual deductible met
OUT-OF-POCKET STATUS: $666.00 of $4,000.00 annual maximum met

This is NOT a bill. Please wait for a statement from your provider.
Prior authorization obtained: AUTH-2024-00881-MRI`,
  },
  {
    label: 'Sample 2 — James Robinson · UHC HMO · ER Visit',
    tag: 'Emergency · CO-97 bundling denial',
    text: `EXPLANATION OF BENEFITS
UnitedHealthcare HMO Select — Member Services: 1-866-414-1959
─────────────────────────────────────────────────
Member: James Robinson             Member ID: UHC-9034712
Group #: GRP-78812                 Claim #: UHC-2024-3301654
Date of Service: 11/03/2024        Processed: 11/15/2024
─────────────────────────────────────────────────
Provider: Riverside General Hospital — Emergency Dept (IN-NETWORK)
Attending: Dr. Patricia Nguyen, MD (Emergency Medicine)
Diagnosis: Acute chest pain, rule out ACS (ICD-10: R07.9)

SERVICES RENDERED
─────────────────────────────────────────────────
CPT 99285 — ER Visit, High Medical Decision Complexity
  Amount Billed:        $4,200.00
  Allowed Amount:       $2,850.00
  Contractual Adj (CO-45): $1,350.00
  Deductible Applied:   $0.00
  ER Copay:             $150.00
  Plan Paid:            $2,700.00
  Patient Responsibility: $150.00

CPT 93000 — 12-Lead EKG with Interpretation
  Amount Billed:        $380.00
  Allowed Amount:       $0.00
  Denial Code (CO-97):  $380.00   ← DENIED: Bundled with E&M service
  Patient Responsibility: $0.00

CPT 80053 — Comprehensive Metabolic Panel
  Amount Billed:        $520.00
  Allowed Amount:       $210.00
  Contractual Adj (CO-45): $310.00
  Plan Paid:            $210.00
  Patient Responsibility: $0.00

CPT 71046 — Chest X-Ray, 2 Views
  Amount Billed:        $680.00
  Allowed Amount:       $290.00
  Contractual Adj (CO-45): $390.00
  Plan Paid:            $290.00
  Patient Responsibility: $0.00

CPT 93454 — Coronary Angiography
  Amount Billed:        $8,100.00
  Allowed Amount:       $5,200.00
  Contractual Adj (CO-45): $2,900.00
  Deductible Applied:   $0.00
  Coinsurance (20%):    $1,040.00
  Plan Paid:            $4,160.00
  Patient Responsibility: $1,040.00

─────────────────────────────────────────────────
CLAIM TOTALS
  Total Billed:         $13,880.00
  Total Allowed:        $8,550.00
  Total Adjustments:    $4,950.00
  Denied (CO-97):       $380.00
  ER Copay:             $150.00
  Coinsurance:          $1,040.00
  Plan Paid:            $7,360.00
  Patient Responsibility: $1,190.00

DEDUCTIBLE STATUS: $3,000.00 annual deductible — FULLY MET this year
OUT-OF-POCKET STATUS: $1,190.00 of $6,500.00 annual maximum met

NOTE: CPT 93000 (EKG) denied under CO-97 as it is considered integral
to and bundled with the high-complexity E&M service (CPT 99285).
You are not responsible for denied bundled charges.

This is NOT a bill. Please wait for a statement from your provider.`,
  },
  {
    label: 'Sample 3 — Sophia Martinez · Cigna PPO · Therapy DENIED',
    tag: 'Mental Health · CO-50 full denial',
    text: `EXPLANATION OF BENEFITS
Cigna PPO Open Access — Member Services: 1-800-244-6224
─────────────────────────────────────────────────
Member: Sophia Martinez            Member ID: CIG-2204857
Group #: GRP-55109                 Claim #: CIG-2024-9918432
Date of Service: 10/28/2024        Processed: 11/08/2024
─────────────────────────────────────────────────
Provider: Greenview Behavioral Health Center (OUT-OF-NETWORK)
Therapist: Dr. Allison Brooks, PsyD (Licensed Psychologist)
Diagnosis: Major Depressive Disorder, recurrent (ICD-10: F33.1)

SERVICES RENDERED
─────────────────────────────────────────────────
CPT 90837 — Individual Psychotherapy, 60 min
  Amount Billed:        $250.00
  Allowed Amount:       $0.00
  Denial Code (CO-50):  $250.00   ← DENIED: Not medically necessary per plan criteria
  Plan Paid:            $0.00
  Patient Responsibility: $250.00

CPT 90837 — Individual Psychotherapy, 60 min (Session 2)
  Amount Billed:        $250.00
  Allowed Amount:       $0.00
  Denial Code (CO-50):  $250.00   ← DENIED: Not medically necessary per plan criteria
  Plan Paid:            $0.00
  Patient Responsibility: $250.00

CPT 90791 — Psychiatric Diagnostic Evaluation
  Amount Billed:        $375.00
  Allowed Amount:       $0.00
  Denial Code (CO-50):  $375.00   ← DENIED: Not medically necessary per plan criteria
  Plan Paid:            $0.00
  Patient Responsibility: $375.00

─────────────────────────────────────────────────
CLAIM TOTALS
  Total Billed:         $875.00
  Total Denied (CO-50): $875.00
  Plan Paid:            $0.00
  Patient Responsibility: $875.00

⚠ APPEAL NOTICE: You have the right to appeal this decision.
  Internal appeal deadline: 180 days from date of this notice (05/07/2025)
  External review available under ACA §2719 if internal appeal is denied.

  This denial may violate the Mental Health Parity and Addiction Equity
  Act (MHPAEA), which prohibits insurers from applying more restrictive
  criteria to mental health benefits than comparable medical/surgical benefits.

  To request a peer-to-peer review, have your provider call:
  Cigna Clinical Review: 1-855-333-5722

This is NOT a bill. Please wait for a statement from your provider.`,
  },
  {
    label: 'Sample 4 — David Kim · BCBS · Colonoscopy Billing Error',
    tag: 'Preventive vs Diagnostic · billing error',
    text: `EXPLANATION OF BENEFITS
Blue Cross Blue Shield PPO — Member Services: 1-888-630-2583
─────────────────────────────────────────────────
Member: David Kim                  Member ID: BCBS-7710293
Group #: GRP-44027                 Claim #: BCBS-2024-5541900
Date of Service: 08/22/2024        Processed: 09/04/2024
─────────────────────────────────────────────────
Provider: Westside Gastroenterology Specialists (IN-NETWORK)
Physician: Dr. Michael Torres, MD (Gastroenterology)
Diagnosis Billed: Colon polyp found, benign (ICD-10: K63.5)
Actual Purpose: Routine colorectal cancer screening (age 52)

SERVICES RENDERED
─────────────────────────────────────────────────
CPT 45385 — Colonoscopy w/ Removal of Lesion (Diagnostic code used)
  Amount Billed:        $3,800.00
  Allowed Amount:       $2,400.00
  Contractual Adj (CO-45): $1,400.00
  Deductible Applied:   $800.00
  Coinsurance (20%):    $320.00
  Plan Paid:            $1,280.00
  Patient Responsibility: $1,120.00

  ⚠ BILLING ALERT: Provider billed using DIAGNOSTIC colonoscopy code
  (45385) instead of PREVENTIVE screening code (G0121). Because a polyp
  was removed during your routine screening, the procedure was reclassified
  as diagnostic, triggering cost-sharing that does NOT apply to preventive care.

  Under the ACA, routine colorectal cancer screenings are covered at 100%
  with no cost-sharing for in-network providers. You may be eligible for
  a full reimbursement if you request a billing correction.

  Correct code for preventive screening with incidental polypectomy: G0121
  Potential patient savings if corrected: $1,120.00

─────────────────────────────────────────────────
CLAIM TOTALS
  Total Billed:         $3,800.00
  Total Allowed:        $2,400.00
  Total Adjustments:    $1,400.00
  Deductible Applied:   $800.00
  Coinsurance:          $320.00
  Plan Paid:            $1,280.00
  Patient Responsibility: $1,120.00

DEDUCTIBLE STATUS: $800.00 of $1,500.00 annual deductible met

⚠ ACTION RECOMMENDED: Contact your provider's billing department and
request the claim be rebilled as a preventive screening (G0121).
Reference: ACA Preventive Services coverage mandate (§2713).

This is NOT a bill. Please wait for a statement from your provider.`,
  },
  {
    label: 'Sample 5 — Linda Thompson · Medicare Part B · Diabetes Management',
    tag: 'Medicare · CO-96 Part D redirect',
    text: `EXPLANATION OF BENEFITS
Medicare Part B Summary Notice — CMS
─────────────────────────────────────────────────
Beneficiary: Linda Thompson        Medicare ID: 1EG4-TE5-MK72
Claim Type: Part B Outpatient      Claim #: CMS-2024-B-4421837
Date of Service: 10/05/2024        Processed: 10/18/2024
─────────────────────────────────────────────────
Provider: Valley Primary Care Associates (Medicare-Participating)
Physician: Dr. Sandra Okafor, MD (Internal Medicine)
Diagnosis: Type 2 Diabetes Mellitus w/ Peripheral Neuropathy (ICD-10: E11.40)

SERVICES RENDERED
─────────────────────────────────────────────────
CPT 99214 — Office Visit, Moderate Medical Decision Complexity
  Amount Billed:        $380.00
  Medicare Approved:    $148.60
  Contractual Adj (CO-45): $231.40
  Medicare Paid (80%):  $118.88
  Your Coinsurance (20%): $29.72
  Patient Responsibility: $29.72

HCPCS A4253 — Blood Glucose Test Strips (100 count)
  Amount Billed:        $85.00
  Medicare Approved:    $34.20
  Contractual Adj (CO-45): $50.80
  Medicare Paid (80%):  $27.36
  Your Coinsurance (20%): $6.84
  Patient Responsibility: $6.84

NDC 00169-7501 — Insulin Glargine (Lantus) 10mL vial
  Amount Billed:        $320.00
  Medicare Approved:    $0.00
  Denial Code (CO-96):  $320.00   ← NOT COVERED under Part B
  Plan Paid:            $0.00
  Patient Responsibility: $0.00 (covered under Part D — see below)

CPT 97110 — Therapeutic Exercise (Physical Therapy, 15 min units x4)
  Amount Billed:        $240.00
  Medicare Approved:    $96.00
  Contractual Adj (CO-45): $144.00
  Medicare Paid (80%):  $76.80
  Your Coinsurance (20%): $19.20
  Patient Responsibility: $19.20

─────────────────────────────────────────────────
CLAIM TOTALS
  Total Billed:         $1,025.00
  Medicare Approved:    $278.80
  Total Adjustments:    $426.20
  Not Covered (CO-96):  $320.00 (insulin — submit to Part D plan)
  Medicare Paid:        $223.04
  Your Coinsurance (20%): $55.76
  Patient Responsibility: $55.76

Part B Deductible Status: $240.00 annual deductible — FULLY MET

NOTE on CO-96 (Insulin): Insulin is NOT covered under Medicare Part B
except in limited circumstances (insulin pump users). Please submit
your Lantus claim to your Medicare Part D prescription drug plan.
Contact your Part D plan: 1-800-XXX-XXXX (see your Part D card).

Medigap Plan G: Your Medigap policy will cover your $55.76 coinsurance.
Submit this EOB to your Medigap insurer for secondary claim processing.

This is NOT a bill. Please wait for a statement from your provider.`,
  },
]

const SUMMARY_LABELS = {
  billed_amount:      { label: 'Amount Billed',      color: 'text-gray-700',   note: 'What the provider charged' },
  allowed_amount:     { label: 'Allowed Amount',     color: 'text-blue-600',   note: "Max your insurer will pay — you're not responsible for the rest" },
  plan_paid:          { label: 'Insurance Paid',     color: 'text-green-600',  note: 'What your insurance actually covered' },
  deductible_applied: { label: 'Deductible Applied', color: 'text-orange-500', note: 'Counted toward your annual deductible' },
  copay:              { label: 'Copay',              color: 'text-purple-600', note: 'Your fixed fee for this visit' },
  patient_owes:       { label: 'You Owe',            color: 'text-red-600',    note: 'Your total responsibility — this is what to pay' },
}

export default function InsuranceDecoderScreen({ navigate }) {
  const [mode, setMode] = useState('eob')
  const [eobText, setEobText] = useState('')
  const [denialCode, setDenialCode] = useState('')
  const [amount, setAmount] = useState('')
  const [result, setResult] = useState(null)
  const [sampleOpen, setSampleOpen] = useState(false)

  const runDecodeEOB = () => setResult({ type: 'eob', data: decodeEOB(eobText) })
  const runExplainDenial = () => setResult({ type: 'denial', data: explainDenial(denialCode, '', parseFloat(amount) || 0) })

  const loadSample = (sample) => {
    setEobText(sample.text)
    setResult(null)
    setSampleOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar navigate={navigate} />
      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Insurance Decoder</h1>
          <p className="text-gray-500 mt-1">Decode your Explanation of Benefits or understand a claim denial.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-1.5 flex gap-1 mb-6 shadow-sm w-fit">
          {[{id:'eob',label:'Decode EOB'},{id:'denial',label:'Explain Denial'}].map(m => (
            <button key={m.id} onClick={() => { setMode(m.id); setResult(null) }}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                mode === m.id ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {m.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          {mode === 'eob' ? (
            <>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-semibold text-gray-700">Paste your Explanation of Benefits</label>

                {/* Sample EOB dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setSampleOpen(o => !o)}
                    className="text-xs text-blue-500 font-medium bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1.5">
                    Load sample EOB
                    <svg className={`w-3 h-3 transition-transform ${sampleOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {sampleOpen && (
                    <div className="absolute right-0 top-9 z-20 w-80 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                      {SAMPLE_EOBS.map((s, i) => (
                        <button key={i} onClick={() => loadSample(s)}
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0">
                          <p className="text-xs font-semibold text-gray-800">Sample {i + 1} — {s.label.split(' — ')[1]}</p>
                          <p className="text-xs text-blue-500 mt-0.5">{s.tag}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <textarea value={eobText} onChange={e => setEobText(e.target.value)}
                className="w-full bg-gray-50 rounded-xl p-4 text-sm h-52 resize-none outline-none text-gray-600 placeholder-gray-300 border border-gray-100 focus:border-blue-300 transition-colors font-mono"
                placeholder="Paste your EOB text here — or click 'Load sample EOB' to try with a realistic example..." />
              <button onClick={runDecodeEOB} disabled={!eobText}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl disabled:opacity-40 transition-all active:scale-95 text-sm shadow-sm shadow-blue-200">
                Decode EOB
              </button>
            </>
          ) : (
            <>
              <label className="text-sm font-semibold text-gray-700 block mb-3">Enter your denial code</label>
              <div className="flex gap-3 mb-3">
                <input value={denialCode} onChange={e => setDenialCode(e.target.value)}
                  className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none text-gray-700 placeholder-gray-300 border border-gray-100 focus:border-blue-300 transition-colors"
                  placeholder="e.g. CO-4, PR-1, OA-23" />
                <input value={amount} onChange={e => setAmount(e.target.value)}
                  className="w-36 bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none text-gray-700 placeholder-gray-300 border border-gray-100 focus:border-blue-300 transition-colors"
                  placeholder="Amount ($)" type="number" />
              </div>
              <div className="flex gap-2 mb-4 flex-wrap">
                {['CO-4','CO-45','CO-50','CO-97','PR-1','PR-204','OA-23','CO-96'].map(c => (
                  <button key={c} onClick={() => setDenialCode(c)}
                    className="bg-blue-50 text-blue-600 text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100 transition-colors">{c}</button>
                ))}
              </div>
              <button onClick={runExplainDenial} disabled={!denialCode}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl disabled:opacity-40 transition-all active:scale-95 text-sm shadow-sm shadow-blue-200">
                Explain Denial
              </button>
            </>
          )}
        </div>

        {result?.type === 'eob' && (
          <div className="space-y-5">
            {result.data.eob_summary && Object.keys(result.data.eob_summary).length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4">Your Cost Breakdown</h3>
                <div className="space-y-3">
                  {Object.entries(result.data.eob_summary).map(([key, value]) => {
                    const meta = SUMMARY_LABELS[key]
                    if (!meta) return null
                    return (
                      <div key={key} className="flex items-start justify-between gap-4 pb-3 border-b border-gray-50 last:border-0">
                        <div>
                          <p className={`text-sm font-semibold ${meta.color}`}>{meta.label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{meta.note}</p>
                        </div>
                        <p className={`font-bold text-base flex-shrink-0 ${meta.color}`}>${value.toLocaleString('en-US', {minimumFractionDigits:2})}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {result.data.denial_codes?.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                <p className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                  <span className="text-red-500">⚠</span> Denial Codes Detected
                </p>
                <div className="space-y-2">
                  {result.data.denial_codes.map((c, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">{c.code}</span>
                        <span className="text-sm text-red-700 ml-2">{c.reason}</span>
                      </div>
                      <button onClick={() => { setMode('denial'); setDenialCode(c.code.replace('CO-','CO-').replace('PR-','PR-')); setResult(null) }}
                        className="text-xs text-blue-500 font-medium hover:underline flex-shrink-0 ml-2">
                        Explain →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-1">
                {result.data.showed_all ? 'EOB Terms Glossary' : `Terms Found (${result.data.terms_found})`}
              </h3>
              {result.data.showed_all && <p className="text-xs text-gray-400 mb-3">Full glossary of EOB terms for reference.</p>}
              <div className="divide-y divide-gray-100 mt-2">
                {result.data.decoded_terms.map((t, i) => (
                  <div key={i} className="py-3">
                    <p className="text-sm font-semibold text-blue-600">{t.term}</p>
                    <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{t.explanation}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-green-50 border border-green-100 rounded-xl p-5">
              <p className="font-semibold text-green-800 mb-3">Your Action Items</p>
              <ul className="space-y-2">
                {result.data.action_items.map((a, i) => (
                  <li key={i} className="text-sm text-green-700 flex gap-2"><span className="text-green-500 flex-shrink-0">✓</span>{a}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {result?.type === 'denial' && (
          <div className="space-y-5">
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <p className="text-xs font-bold text-red-500 mb-1">DENIAL CODE {result.data.code}</p>
              <p className="text-base font-bold text-red-800 mb-2">{result.data.reason}</p>
              <p className="text-sm text-red-700 leading-relaxed">{result.data.recommended_action}</p>
              <div className="flex gap-4 mt-3 text-xs text-gray-500">
                <span>Success rate: <strong className="text-green-600">{result.data.success_rate}</strong></span>
                <span>Deadline: <strong>{result.data.deadline}</strong></span>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-3">Ready-to-Send Appeal Letter</h3>
              <pre className="bg-gray-50 rounded-xl p-4 text-xs whitespace-pre-wrap font-mono text-gray-600 leading-relaxed border border-gray-100">{result.data.appeal_template}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
