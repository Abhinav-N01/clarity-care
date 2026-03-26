import { useState } from 'react'
import { decodeEOB, explainDenial, CLAIMS_FLOWS } from '../lib/insuranceDecoder'
import Navbar from '../components/Navbar'

// ─── 5 Realistic Sample EOBs ──────────────────────────────────────────────────
const SAMPLE_EOBS = [
  {
    id: 1,
    label: 'Knee MRI',
    patient: 'Emily Carter',
    insurer: 'Aetna PPO',
    tag: 'Radiology',
    tagColor: 'bg-blue-100 text-blue-700',
    scenario: 'Partial payment — deductible applied',
    text: `EXPLANATION OF BENEFITS — NOT A BILL
Aetna Health Insurance
P.O. Box 14079, Lexington, KY 40512
Member Services: 1-800-872-3862

Member Name: Emily Carter
Member ID: AET-4421-78234
Group Number: GRP-88210
Claim Number: 2024-AET-00912847
Date of Service: 09/18/2024
Date Processed: 09/25/2024

Provider: Advanced Orthopaedic Imaging Center
Rendering Provider NPI: 1234512345
Provider Address: 555 Radiology Blvd, Austin, TX 78701

SERVICE DETAIL
Service: MRI Knee Without Contrast (CPT 73721)
Diagnosis: M17.11 — Primary osteoarthritis, right knee

Amount Billed: $2,100.00
Allowed Amount: $847.50
Contractual Adjustment (CO-45): -$1,252.50
Deductible Applied: $500.00
Coinsurance (20%): $69.50
Plan Paid: $278.00
Patient Responsibility: $569.50

IMPORTANT NOTES:
• $1,252.50 is a contractual write-off — you do NOT owe this amount
• $500.00 has been applied to your 2024 annual deductible
• Remaining deductible after this claim: $0.00 (deductible met)
• In-network provider — correct rates applied

RUNNING TOTALS (2024):
Deductible Met: $1,500.00 / $1,500.00 ✓
Out-of-Pocket Total: $892.00 / $6,000.00

This is not a bill. Contact Aetna Member Services with questions.`,
  },
  {
    id: 2,
    label: 'ER Visit',
    patient: 'James Robinson',
    insurer: 'United Healthcare HMO',
    tag: 'Emergency',
    tagColor: 'bg-red-100 text-red-700',
    scenario: 'Multi-service ER — denial code CO-97',
    text: `EXPLANATION OF BENEFITS — NOT A BILL
UnitedHealthcare
P.O. Box 30555, Salt Lake City, UT 84130
Member Services: 1-866-801-4409

Member Name: James Robinson
Member ID: UHC-9900-44123
Group Number: GRP-22087
Claim Number: 2024-UHC-05541892
Date of Service: 10/02/2024
Date Processed: 10/10/2024

Provider: Riverside General Hospital — Emergency Department
Provider Address: 1500 Hospital Way, Denver, CO 80203

SERVICE DETAIL
Service 1: ED Visit, High Complexity (CPT 99285)
Diagnosis: R07.9 — Chest pain, unspecified
  Amount Billed: $2,800.00 | Allowed: $1,240.00 | Plan Paid: $890.00 | Patient Responsibility: $350.00

Service 2: EKG 12-Lead (CPT 93000)
  Amount Billed: $425.00 | Allowed: $0.00 | Plan Paid: $0.00
  Adjustment Code: CO-97 — Service considered bundled with ER visit
  Patient Responsibility: $0.00

Service 3: Chest X-Ray 2 Views (CPT 71046)
  Amount Billed: $895.00 | Allowed: $312.00 | Plan Paid: $312.00 | Patient Responsibility: $0.00

Service 4: Troponin I (CPT 84484)
  Amount Billed: $285.00 | Allowed: $95.00 | Plan Paid: $95.00 | Patient Responsibility: $0.00

Service 5: Comprehensive Metabolic Panel (CPT 80053)
  Amount Billed: $310.00 | Allowed: $88.00 | Plan Paid: $88.00 | Patient Responsibility: $0.00

CLAIM TOTALS:
Amount Billed: $4,715.00
Total Allowed: $1,735.00
Contractual Adjustment (CO-45): -$2,980.00
Plan Paid: $1,385.00
Patient Responsibility: $350.00

Adjustment Reason Codes: CO-45, CO-97

NOTES:
• CO-97: EKG bundled with ED visit — this is a correct coding adjustment per NCCI guidelines
• ER copay of $350 applies as this is your first ER visit this benefit year
• Out-of-network protection applies (No Surprises Act) — only in-network cost-sharing charged

Running Out-of-Pocket: $350.00 / $7,500.00 (family deductible applies)
This is not a bill. Review your provider's invoice before paying.`,
  },
  {
    id: 3,
    label: 'Therapy Denied',
    patient: 'Sophia Martinez',
    insurer: 'Cigna PPO',
    tag: 'Mental Health',
    tagColor: 'bg-purple-100 text-purple-700',
    scenario: 'Full denial — CO-50 medical necessity',
    text: `EXPLANATION OF BENEFITS — CLAIM DENIED
Cigna Health and Life Insurance Company
P.O. Box 188061, Chattanooga, TN 37422
Member Services: 1-800-997-1654

Member Name: Sophia Martinez
Member ID: CIG-7712-09821
Group Number: GRP-55401-A
Claim Number: 2024-CIG-08834117
Date of Service: 10/15/2024 through 11/05/2024
Date Processed: 11/12/2024

Provider: Serenity Behavioral Health Associates
Rendering Provider: Dr. Rachel Kim, PhD — Licensed Psychologist
NPI: 9988776655

SERVICE DETAIL — SESSIONS DENIED
Session 1 (10/15): Individual Psychotherapy, 60 min (CPT 90837) — $250.00 DENIED
Session 2 (10/22): Individual Psychotherapy, 60 min (CPT 90837) — $250.00 DENIED
Session 3 (10/29): Individual Psychotherapy, 60 min (CPT 90837) — $250.00 DENIED
Session 4 (11/05): Individual Psychotherapy, 60 min (CPT 90837) — $250.00 DENIED

Total Billed: $1,000.00
Amount Allowed: $0.00
Plan Paid: $0.00
Patient Responsibility: $1,000.00

DENIAL REASON:
Adjustment Code: CO-50
Reason: Services denied as not medically necessary based on clinical review.
Cigna's clinical guidelines require documented treatment plan and prior authorization
for ongoing psychotherapy beyond 8 sessions.

YOUR APPEAL RIGHTS:
You have the right to appeal this decision within 180 days.
Request: Internal Appeal → External Independent Review (if internal appeal denied)
For urgent care appeals, a decision will be made within 72 hours.

Peer-to-peer review available: Request your provider call 1-800-Cigna-MD.

IMPORTANT: The Mental Health Parity Act requires mental health benefits be
covered no more restrictively than medical benefits. If you believe this denial
violates parity, contact your state's insurance commissioner.

This is not a bill. Contact Cigna Member Services at 1-800-997-1654.`,
  },
  {
    id: 4,
    label: 'Colonoscopy Billed Wrong',
    patient: 'David Kim',
    insurer: 'BlueCross BlueShield',
    tag: 'Billing Error',
    tagColor: 'bg-amber-100 text-amber-700',
    scenario: 'Preventive coded as diagnostic — you owe $0',
    text: `EXPLANATION OF BENEFITS — NOT A BILL
BlueCross BlueShield of Illinois
225 N. Michigan Avenue, Chicago, IL 60601
Member Services: 1-877-860-2742

Member Name: David Kim
Member ID: BCB-5541-22987
Group Number: GRP-IL-77720
Claim Number: 2024-BCB-03318842
Date of Service: 11/20/2024
Date Processed: 11/28/2024

Provider: Chicago GI Associates
Rendering Provider: Dr. Michael Torres, MD — Gastroenterology
NPI: 1122334455
Facility: Northwest Ambulatory Surgery Center

SERVICE DETAIL
Service: Colonoscopy (CPT 45378)
Diagnosis Code Billed: K92.1 — Melena (diagnostic reason)
Actual Clinical Situation: Routine screening, age 52, asymptomatic

Amount Billed: $3,200.00
Allowed Amount: $1,680.00
Contractual Adjustment (CO-45): -$1,520.00
Deductible Applied: $336.00
Coinsurance (20%): $268.80
Plan Paid: $1,075.20
Patient Responsibility: $604.80

BILLING ISSUE DETECTED:
⚠️  This colonoscopy appears to have been billed as DIAGNOSTIC (K92.1 — Melena)
    rather than as a PREVENTIVE SCREENING procedure.

    Under the ACA, routine screening colonoscopies for adults 45+ are covered 100%
    with NO patient cost-sharing, regardless of deductible.

    If you had this colonoscopy as a routine screening (no symptoms), you may owe $0.

RECOMMENDED ACTION:
1. Call your provider's billing office and ask them to verify the diagnosis code
2. If billed in error, request a corrected claim submitted as a screening colonoscopy
3. The correct coding should result in: Patient Responsibility = $0.00
4. You may be entitled to a refund of any amount already paid

Potential patient savings if corrected: $604.80

RUNNING TOTALS (2024):
Deductible Met: $604.80 / $1,500.00

This is not a bill. Always compare this EOB to your provider's invoice.`,
  },
  {
    id: 5,
    label: 'Medicare Diabetes',
    patient: 'Linda Thompson',
    insurer: 'Medicare Part B + Humana Medigap G',
    tag: 'Medicare',
    tagColor: 'bg-teal-100 text-teal-700',
    scenario: 'Multi-service diabetes management — Part B vs Part D',
    text: `MEDICARE SUMMARY NOTICE — EXPLANATION OF BENEFITS
Centers for Medicare & Medicaid Services
7500 Security Blvd, Baltimore, MD 21244

Beneficiary Name: Linda Thompson
Medicare Number: 1EG4-TE5-MK91
Date: December 1, 2024
Period Covered: October 1, 2024 – October 31, 2024

Provider: Sunrise Diabetes & Endocrinology Center
Claim Number: 2024-MED-P-8834-0092

SERVICE DETAIL

Service 1: Office Visit, Established Patient, Moderate (CPT 99214) — 10/08/2024
  Medicare Approved Amount: $142.00
  Medicare Paid (80%): $113.60
  Medigap Plan G Paid (20%): $28.40
  You Owe: $0.00

Service 2: Hemoglobin A1c (CPT 83036) — 10/08/2024
  Medicare Approved Amount: $48.50
  Medicare Paid (80%): $38.80
  Medigap Plan G Paid (20%): $9.70
  You Owe: $0.00

Service 3: Diabetic Shoe Fitting & Shoes (HCPCS A5500) — 10/15/2024
  Medicare Approved Amount: $178.00
  Medicare Paid (80%): $142.40
  Medigap Plan G Paid (20%): $35.60
  You Owe: $0.00

Service 4: Insulin (regular, U-100) — 10/08/2024
  Amount Billed: $185.00
  Medicare Part B Paid: $0.00
  Adjustment Code: CO-96 — Insulin covered under Medicare Part D, not Part B
  Patient Responsibility: $185.00

CLAIM TOTALS:
Total Billed: $553.50
Medicare Part B Paid: $294.80
Medigap Plan G Paid: $73.70
Your Part D (Insulin): $185.00 — Submit to your Part D plan separately
Total Out-of-Pocket: $185.00

IMPORTANT NOTES:
• CO-96 on insulin: Insulin is generally covered under Medicare Part D — submit to your
  Part D drug plan (Humana Enhanced Rx). If using an insulin pump, Part B may cover it.
• Medigap Plan G covers all Medicare-approved cost-sharing except the Part B deductible
• 2024 Part D insulin cap: $35/month maximum under Inflation Reduction Act
• Annual diabetes preventive services (A1c, foot exam, eye exam) covered at 100%

Contact Medicare: 1-800-633-4227 | medicare.gov
Contact Humana Medigap: 1-800-457-4708`,
  },
]

const DENIAL_QUICK_CODES = ['CO-50', 'CO-97', 'CO-197', 'CO-4', 'PR-1', 'PR-96', 'N180', 'CO-45', 'CO-109', 'OA-23']

const URGENCY_COLORS = {
  critical: 'bg-red-50 border-red-300 text-red-800',
  high:     'bg-orange-50 border-orange-200 text-orange-800',
  medium:   'bg-amber-50 border-amber-200 text-amber-800',
  low:      'bg-green-50 border-green-200 text-green-800',
}

// ─── Screen ────────────────────────────────────────────────────────────────────
export default function InsuranceDecoderScreen({ navigate }) {
  const [tab, setTab] = useState('eob')
  const [activeEOB, setActiveEOB] = useState(null)
  const [eobText, setEobText] = useState('')
  const [eobResult, setEobResult] = useState(null)

  const [denialCode, setDenialCode] = useState('')
  const [appealCtx, setAppealCtx] = useState({ memberName: '', dos: '', provider: '', service: '', amount: '', claimNum: '', insurer: '' })
  const [denialResult, setDenialResult] = useState(null)
  const [showLetter, setShowLetter] = useState(false)

  const [claimFlow, setClaimFlow] = useState(null)
  const [claimStep, setClaimStep] = useState(0)
  const [claimAnswers, setClaimAnswers] = useState({})
  const [claimResult, setClaimResult] = useState(null)

  const loadEOB = (eob) => {
    setActiveEOB(eob.id)
    setEobText(eob.text)
    setEobResult(null)
  }

  const runDecode = () => {
    if (eobText.trim()) setEobResult(decodeEOB(eobText))
  }

  const runDenial = () => {
    if (denialCode.trim()) setDenialResult(explainDenial(denialCode, appealCtx))
  }

  const handleClaimAnswer = (stepId, answer) => {
    const flow = CLAIMS_FLOWS[claimFlow]
    const newAnswers = { ...claimAnswers, [stepId]: answer }
    setClaimAnswers(newAnswers)
    if (claimStep + 1 >= flow.steps.length) {
      setClaimResult(flow.result(newAnswers))
    } else {
      setClaimStep(claimStep + 1)
    }
  }

  const resetClaims = () => { setClaimFlow(null); setClaimStep(0); setClaimAnswers({}); setClaimResult(null) }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50/20 flex flex-col">
      <Navbar navigate={navigate} />
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Insurance Decoder</h1>
          <p className="text-gray-500 mt-1 text-sm">Decode your EOB, understand denials, or get step-by-step claims help.</p>
        </div>

        {/* Tabs */}
        <div className="bg-white border border-gray-200 rounded-2xl p-1 flex gap-1 mb-6 shadow-sm w-full sm:w-fit">
          {[
            { id: 'eob', label: '📄 Decode EOB' },
            { id: 'denial', label: '⚖️ Appeals Advocate' },
            { id: 'claims', label: '🤖 Claims Bot' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t.id ? 'bg-[#2c6b55] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB: DECODE EOB ── */}
        {tab === 'eob' && (
          <div>
            {/* Sample EOB selector */}
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Load a sample EOB</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-6">
              {SAMPLE_EOBS.map(eob => (
                <button key={eob.id} onClick={() => loadEOB(eob)}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    activeEOB === eob.id ? 'border-[#2c6b55] bg-[#2c6b55]/5 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                  }`}>
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${eob.tagColor}`}>{eob.tag}</span>
                  <p className="text-xs font-semibold text-gray-800 mt-2 leading-tight">{eob.patient}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-tight">{eob.insurer}</p>
                  <p className="text-xs text-gray-300 mt-1 leading-tight italic">{eob.scenario}</p>
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-semibold text-gray-700">Paste your EOB</label>
                {eobText && <button onClick={() => { setEobText(''); setEobResult(null); setActiveEOB(null) }}
                  className="text-xs text-gray-400 hover:text-gray-600">Clear</button>}
              </div>
              <textarea value={eobText} onChange={e => { setEobText(e.target.value); setActiveEOB(null); setEobResult(null) }}
                className="w-full bg-gray-50 rounded-xl p-4 text-xs font-mono h-52 resize-none outline-none text-gray-600 placeholder-gray-300 border border-gray-100 focus:border-[#2c6b55]/40 transition-colors leading-relaxed"
                placeholder="Paste your Explanation of Benefits here, or load a sample above…" />
              <button onClick={runDecode} disabled={!eobText.trim()}
                className="mt-4 bg-[#2c6b55] hover:bg-[#245a47] text-white font-semibold px-8 py-3 rounded-xl disabled:opacity-40 transition-all active:scale-95 text-sm shadow-sm">
                Decode EOB
              </button>
            </div>

            {eobResult && <EOBResults result={eobResult} />}
          </div>
        )}

        {/* ── TAB: APPEALS ADVOCATE ── */}
        {tab === 'denial' && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-800 mb-1">Appeals Advocate</h2>
              <p className="text-xs text-gray-400 mb-4">Enter your denial code and optional details to generate a personalized, legally-grounded appeal letter.</p>

              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Denial Code *</label>
                  <input value={denialCode} onChange={e => { setDenialCode(e.target.value.toUpperCase()); setDenialResult(null) }}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none border border-gray-100 focus:border-[#2c6b55]/40 transition-colors font-mono"
                    placeholder="e.g. CO-50" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Your Name</label>
                  <input value={appealCtx.memberName} onChange={e => setAppealCtx(a => ({ ...a, memberName: e.target.value }))}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none border border-gray-100 focus:border-[#2c6b55]/40 transition-colors"
                    placeholder="Full name" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Service / Procedure</label>
                  <input value={appealCtx.service} onChange={e => setAppealCtx(a => ({ ...a, service: e.target.value }))}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none border border-gray-100 focus:border-[#2c6b55]/40 transition-colors"
                    placeholder="e.g. MRI, therapy sessions" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Provider Name</label>
                  <input value={appealCtx.provider} onChange={e => setAppealCtx(a => ({ ...a, provider: e.target.value }))}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none border border-gray-100 focus:border-[#2c6b55]/40 transition-colors"
                    placeholder="Doctor or hospital name" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Date of Service</label>
                  <input value={appealCtx.dos} onChange={e => setAppealCtx(a => ({ ...a, dos: e.target.value }))}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none border border-gray-100 focus:border-[#2c6b55]/40 transition-colors"
                    placeholder="MM/DD/YYYY" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Amount Denied</label>
                  <input value={appealCtx.amount} onChange={e => setAppealCtx(a => ({ ...a, amount: e.target.value }))}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none border border-gray-100 focus:border-[#2c6b55]/40 transition-colors"
                    placeholder="$0.00" />
                </div>
              </div>

              {/* Quick code chips */}
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2">Quick select a code:</p>
                <div className="flex flex-wrap gap-2">
                  {DENIAL_QUICK_CODES.map(c => (
                    <button key={c} onClick={() => { setDenialCode(c); setDenialResult(null) }}
                      className={`text-xs px-3 py-1.5 rounded-full font-mono font-medium transition-colors border ${
                        denialCode === c ? 'bg-[#2c6b55] text-white border-[#2c6b55]' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-[#2c6b55] hover:text-[#2c6b55]'
                      }`}>{c}</button>
                  ))}
                </div>
              </div>

              <button onClick={runDenial} disabled={!denialCode.trim()}
                className="bg-[#2c6b55] hover:bg-[#245a47] text-white font-semibold px-8 py-3 rounded-xl disabled:opacity-40 transition-all active:scale-95 text-sm shadow-sm">
                Analyze Denial + Generate Appeal
              </button>
            </div>

            {denialResult && <DenialResults result={denialResult} showLetter={showLetter} setShowLetter={setShowLetter} />}
          </div>
        )}

        {/* ── TAB: CLAIMS BOT ── */}
        {tab === 'claims' && (
          <div>
            {!claimFlow ? (
              /* Flow selector */
              <div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
                  <h2 className="font-bold text-gray-800 mb-1">Claims Assistant</h2>
                  <p className="text-xs text-gray-400">What do you need help with today? I'll walk you through it step by step.</p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(CLAIMS_FLOWS).map(([key, flow]) => (
                    <button key={key} onClick={() => { setClaimFlow(key); setClaimStep(0); setClaimAnswers({}); setClaimResult(null) }}
                      className="text-left bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-[#2c6b55]/40 hover:shadow transition-all group">
                      <span className="text-2xl">{flow.icon}</span>
                      <p className="font-bold text-gray-800 mt-2 text-sm group-hover:text-[#2c6b55] transition-colors">{flow.title}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : !claimResult ? (
              /* Step wizard */
              <ClaimsWizard
                flow={CLAIMS_FLOWS[claimFlow]}
                step={claimStep}
                answers={claimAnswers}
                onAnswer={handleClaimAnswer}
                onBack={resetClaims}
              />
            ) : (
              /* Result */
              <ClaimsResult result={claimResult} onReset={resetClaims} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── EOB Results ───────────────────────────────────────────────────────────────
function EOBResults({ result }) {
  const { meta, financial, savings, coverage_pct, denial_codes, decoded_terms, action_items, appeal_recommended } = result

  return (
    <div className="space-y-4">
      {/* Alert banner for denials */}
      {appeal_recommended && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <span className="text-lg shrink-0">⚠️</span>
          <div>
            <p className="font-bold text-red-800 text-sm">Denial codes detected — appeal recommended</p>
            <p className="text-xs text-red-600 mt-0.5">Switch to the <strong>Appeals Advocate</strong> tab to generate a personalized appeal letter for: {denial_codes.join(', ')}</p>
          </div>
        </div>
      )}

      {/* Patient/claim info */}
      {meta && (meta.member || meta.provider) && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-3 text-sm">Claim Details</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Member', value: meta.member },
              { label: 'Insurance', value: meta.insurer },
              { label: 'Provider', value: meta.provider },
              { label: 'Date of Service', value: meta.dos },
              { label: 'Claim #', value: meta.claim_num },
              { label: 'Processed', value: meta.processed },
            ].filter(r => r.value).map(r => (
              <div key={r.label}>
                <p className="text-xs text-gray-400">{r.label}</p>
                <p className="text-sm font-medium text-gray-800 truncate">{r.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Financial breakdown */}
      {financial && Object.values(financial).some(v => v !== null) && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 text-sm">Cost Breakdown</h3>
          <div className="space-y-2.5">
            {[
              { key: 'billed_amount',      label: 'Amount Billed',        color: 'text-gray-700',   note: 'What provider charged — you may not owe all of this' },
              { key: 'allowed_amount',     label: 'Allowed Amount',       color: 'text-blue-600',   note: "Insurer's negotiated rate — the difference is written off" },
              { key: 'plan_paid',          label: 'Insurance Paid',       color: 'text-green-600',  note: 'What your insurance actually paid' },
              { key: 'deductible_applied', label: 'Deductible Applied',   color: 'text-orange-500', note: 'Counted toward your annual deductible' },
              { key: 'copay',              label: 'Copay',                color: 'text-purple-600', note: 'Fixed fee for this visit' },
              { key: 'coinsurance',        label: 'Coinsurance',          color: 'text-purple-500', note: 'Your percentage share after deductible' },
              { key: 'not_covered',        label: 'Not Covered',          color: 'text-red-500',    note: 'Amount insurance will not pay' },
              { key: 'patient_owes',       label: 'You Owe',              color: 'text-red-600',    note: 'Your total responsibility — verify this matches your bill', bold: true },
            ].filter(r => financial[r.key] !== null && financial[r.key] !== undefined).map(r => (
              <div key={r.key} className={`flex items-start justify-between gap-4 py-2 ${r.bold ? 'border-t border-gray-100 mt-1' : ''}`}>
                <div>
                  <p className={`text-sm font-semibold ${r.color}`}>{r.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.note}</p>
                </div>
                <p className={`font-bold text-base shrink-0 ${r.color}`}>${financial[r.key].toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
            ))}
          </div>

          {/* Coverage bar */}
          {coverage_pct !== null && (
            <div className="mt-4 pt-3 border-t border-gray-50">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Insurance covered</span>
                <span className="font-bold text-green-600">{coverage_pct}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-400 rounded-full" style={{ width: `${coverage_pct}%` }} />
              </div>
            </div>
          )}

          {savings && savings > 0 && (
            <p className="text-xs text-green-600 mt-3 font-medium">
              💡 Insurance negotiated ${savings.toLocaleString('en-US', { minimumFractionDigits: 2 })} off the billed amount — you are NOT responsible for this difference.
            </p>
          )}
        </div>
      )}

      {/* Denial codes */}
      {denial_codes.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="font-bold text-amber-800 text-sm mb-2">Adjustment / Denial Codes Found</p>
          <div className="flex flex-wrap gap-2">
            {denial_codes.map(c => (
              <span key={c} className="font-mono text-xs bg-white border border-amber-200 text-amber-700 px-2.5 py-1 rounded-full font-semibold">{c}</span>
            ))}
          </div>
          <p className="text-xs text-amber-700 mt-2">Switch to the <strong>Appeals Advocate</strong> tab to decode these and generate appeal letters.</p>
        </div>
      )}

      {/* Terms */}
      {decoded_terms.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-3 text-sm">Terms Found in Your EOB</h3>
          <div className="divide-y divide-gray-50">
            {decoded_terms.map((t, i) => (
              <div key={i} className="py-2.5">
                <p className="text-sm font-semibold text-[#2c6b55]">{t.term}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{t.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action items */}
      <div className="bg-[#2c6b55]/8 border border-[#2c6b55]/20 rounded-xl p-4">
        <p className="font-bold text-[#2c6b55] mb-3 text-sm">✅ Your Action Items</p>
        <ul className="space-y-2">
          {action_items.map((a, i) => (
            <li key={i} className="text-sm text-gray-700 flex gap-2 items-start">
              <span className="text-[#2c6b55] shrink-0 mt-0.5">→</span>{a}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ─── Denial Results ────────────────────────────────────────────────────────────
function DenialResults({ result, showLetter, setShowLetter }) {
  const urgencyStyle = URGENCY_COLORS[result.urgency] || URGENCY_COLORS.medium

  const copyLetter = () => {
    navigator.clipboard?.writeText(result.appeal_template).catch(() => {})
  }

  return (
    <div className="space-y-4">
      {/* Denial summary */}
      <div className={`rounded-xl p-5 border ${urgencyStyle}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm font-bold">{result.code}</span>
              <span className="text-xs bg-white/60 px-2 py-0.5 rounded-full font-medium">{result.short}</span>
            </div>
            <p className="text-sm leading-relaxed font-medium">{result.reason}</p>
          </div>
          <div className="text-right shrink-0 text-xs">
            <p className="font-semibold">Appeal success</p>
            <p className="text-lg font-bold">{result.success_rate}</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-current/20 flex flex-wrap gap-4 text-xs">
          <span>⏰ Deadline: <strong>{result.deadline.split('(')[0].trim()}</strong></span>
          {result.peer_to_peer && <span>📞 <strong>Peer-to-peer review available</strong></span>}
          {result.external_review && <span>🔍 External review available if internal fails</span>}
        </div>
      </div>

      {/* Recommended action */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-3 text-sm">Recommended Action</h3>
        <p className="text-sm text-gray-700 leading-relaxed">{result.recommended_action}</p>
      </div>

      {/* Step-by-step action plan */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-3 text-sm">Step-by-Step Action Plan</h3>
        <ol className="space-y-2.5">
          {result.action_steps.map((step, i) => (
            <li key={i} className="flex gap-3 items-start text-sm text-gray-700">
              <span className="w-5 h-5 rounded-full bg-[#2c6b55] text-white text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Appeal letter */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800 text-sm">Ready-to-Send Appeal Letter</h3>
          <div className="flex gap-2">
            <button onClick={copyLetter}
              className="text-xs bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:border-[#2c6b55] hover:text-[#2c6b55] transition-colors">
              Copy
            </button>
            <button onClick={() => setShowLetter(!showLetter)}
              className="text-xs bg-[#2c6b55] text-white px-3 py-1.5 rounded-lg hover:bg-[#245a47] transition-colors">
              {showLetter ? 'Hide Letter' : 'View Letter'}
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400 mb-3">Fill in the bracketed fields [LIKE THIS] with your details before sending via certified mail.</p>
        {showLetter && (
          <pre className="bg-gray-50 rounded-xl p-4 text-xs whitespace-pre-wrap font-mono text-gray-600 leading-relaxed border border-gray-100 max-h-96 overflow-y-auto">
            {result.appeal_template}
          </pre>
        )}
      </div>
    </div>
  )
}

// ─── Claims Wizard ─────────────────────────────────────────────────────────────
function ClaimsWizard({ flow, step, answers, onAnswer, onBack }) {
  const currentStep = flow.steps[step]
  const progress = Math.round(((step) / flow.steps.length) * 100)

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-5 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
        Back to topics
      </button>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-2xl">{flow.icon}</span>
          <div>
            <p className="font-bold text-gray-800">{flow.title}</p>
            <p className="text-xs text-gray-400">Step {step + 1} of {flow.steps.length}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-gray-100 rounded-full mb-6">
          <div className="h-full bg-[#2c6b55] rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>

        <p className="text-base font-semibold text-gray-800 mb-4">{currentStep.question}</p>

        <div className="space-y-2">
          {currentStep.options.map(opt => (
            <button key={opt} onClick={() => onAnswer(currentStep.id, opt)}
              className="w-full text-left px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 hover:border-[#2c6b55] hover:bg-[#2c6b55]/5 text-sm text-gray-700 transition-all hover:text-[#2c6b55]">
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Claims Result ─────────────────────────────────────────────────────────────
function ClaimsResult({ result, onReset }) {
  return (
    <div>
      <button onClick={onReset} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-5 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
        Start over
      </button>

      <div className="space-y-4">
        <div className="bg-[#2c6b55] rounded-2xl p-5 text-white">
          <p className="font-bold text-lg mb-1">{result.title}</p>
          <p className="text-white/70 text-xs">Personalized to your answers</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <ol className="space-y-3">
            {result.steps.filter(Boolean).map((step, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="w-6 h-6 rounded-full bg-[#2c6b55]/10 text-[#2c6b55] text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">{i + 1}</span>
                <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        {result.tip && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-sm text-blue-800 leading-relaxed">{result.tip}</p>
          </div>
        )}

        <button onClick={onReset}
          className="w-full py-3 rounded-xl border border-gray-200 text-sm text-gray-600 hover:border-[#2c6b55] hover:text-[#2c6b55] transition-colors">
          Get help with something else
        </button>
      </div>
    </div>
  )
}
