import { useState } from 'react'
import { parseBill } from '../lib/billParser'
import Navbar from '../components/Navbar'

const SAMPLE_BILLS = [
  {
    id: 1,
    label: 'ER Visit',
    patient: 'Marcus Johnson',
    hospital: 'Metropolitan General Hospital',
    tag: 'Emergency',
    text: `ITEMIZED PATIENT STATEMENT
Metropolitan General Hospital
1200 Hospital Drive, New York, NY 10001
NPI: 1234567890  |  Tax ID: 13-4567890

Patient Name: Marcus Johnson
Date of Birth: 06/15/1978
Account #: 2024-MGH-11038
Date of Service: 11/03/2024
Insurance: BlueCross BlueShield PPO
Member ID: BCB-789456123
Rendering Provider: Dr. Alicia Torres, MD

DIAGNOSIS CODES: R07.9, I10, J06.9

SERVICE DETAIL
CODE  | DESCRIPTION                              | BILLED    | INS PAID  | YOU OWE
99285 | ED Visit, High Complexity                | $2,400.00 | $1,152.00 | $288.00
71046 | Chest X-Ray, 2 Views                     |   $890.00 |   $427.20 | $106.80
93000 | EKG, 12-Lead with Interpretation         |   $425.00 |   $204.00 |  $51.00
85025 | CBC with Differential                    |   $285.00 |   $136.80 |  $34.20
80053 | Comprehensive Metabolic Panel            |   $310.00 |   $148.80 |  $37.20

Note: Facility Fee charged separately by hospital administration.

BILLED TOTAL:      $4,310.00
INSURANCE ADJ:    -$1,241.20
INSURANCE PAID:    $2,068.80
PATIENT BALANCE:   $517.20

Payment due within 30 days. Call (212) 555-0100 for billing questions.`,
  },

  {
    id: 2,
    label: 'Knee Replacement',
    patient: 'Sarah Chen',
    hospital: 'Northside Orthopedic Medical Center',
    tag: 'Surgery',
    text: `NORTHSIDE ORTHOPEDIC MEDICAL CENTER
4500 Medical Parkway, Chicago, IL 60601
Phone: (312) 555-0200  |  NPI: 9876543210

PATIENT BILLING STATEMENT

Patient Name: Sarah Chen
Date of Birth: 03/22/1962
Account #: NOMC-2024-8821
Date of Service: 10/14/2024 – 10/16/2024
Insurance: Aetna PPO
Member ID: AET-332145678
Attending Physician: Dr. Kevin Patel, MD — Orthopedic Surgery

DIAGNOSIS CODES: M17.11, Z96.651

ITEMIZED CHARGES
CODE  | DESCRIPTION                              | BILLED     | INS PAID   | YOU OWE
27447 | Total Knee Replacement, Right            | $38,500.00 | $28,500.00 | $4,250.00
01402 | Anesthesia — Knee Replacement            |  $3,200.00 |  $2,400.00 |   $400.00
73562 | X-Ray Knee, 3 Views (Pre-op)             |    $420.00 |    $315.00 |    $52.50
73721 | MRI Knee Without Contrast (Pre-op)       |  $2,100.00 |  $1,575.00 |   $262.50
97162 | Physical Therapy Evaluation              |    $350.00 |    $262.50 |    $43.75
99232 | Subsequent Hospital Care, Day 2          |    $280.00 |    $210.00 |    $35.00

Note: Anesthesia billed by Windy City Anesthesia Group (separate provider).
Room & Board / Facility Fee billed on separate statement.

BILLED TOTAL:      $44,850.00
INSURANCE ADJ:    -$11,337.50
INSURANCE PAID:    $33,262.50
PATIENT BALANCE:    $5,043.75

Deductible Applied: $1,500.00  |  Coinsurance (15%): $3,543.75
Questions? Call Sarah Chen Billing Specialist: (312) 555-0211`,
  },

  {
    id: 3,
    label: 'Cardiac Workup',
    patient: 'Robert Williams',
    hospital: 'Mercy Heart & Vascular Institute',
    tag: 'Cardiac',
    text: `MERCY HEART & VASCULAR INSTITUTE
800 Cardiac Way, Houston, TX 77002
NPI: 5551234567  |  Tax ID: 74-2345678

EXPLANATION OF CHARGES

Patient: Robert Williams
DOB: 09/08/1955
Account: MHVI-2024-30041
Service Dates: 09/25/2024 – 09/25/2024
Insurance: Medicare Part B + Humana Medigap Plan G
Member ID: 1EG4-TE5-MK72
Provider: Dr. Sandra Okonkwo, MD — Cardiology

DIAGNOSIS CODES: I25.10, I20.9, R07.9, I10, E78.5

PROFESSIONAL SERVICES
CODE  | DESCRIPTION                              | BILLED    | INS PAID  | YOU OWE
99214 | Office Visit, Moderate Complexity        |   $380.00 |   $286.00 |  $57.00
93000 | EKG, 12-Lead                             |   $210.00 |   $157.50 |  $31.50
93306 | Echocardiogram, Complete                 | $2,100.00 | $1,575.00 | $315.00
93015 | Cardiovascular Stress Test               | $1,450.00 | $1,087.50 | $217.50
93458 | Left Heart Cath with Coronary Angiogram  | $9,500.00 | $7,125.00 | $712.50
85025 | CBC with Differential                    |   $195.00 |   $146.25 |  $29.25
80061 | Lipid Panel                              |   $165.00 |   $123.75 |  $24.75
84443 | Thyroid Stimulating Hormone (TSH)        |   $120.00 |    $90.00 |  $18.00
83036 | Hemoglobin A1c                           |   $110.00 |    $82.50 |  $16.50

Note: EKG (93000) and Office Visit (99214) billed same day — modifier -25 required.
Catheterization lab facility fee billed separately.

BILLED TOTAL:     $14,230.00
INSURANCE ADJ:    -$4,556.25
INSURANCE PAID:    $9,673.50
PATIENT BALANCE:   $1,421.75

Medigap Plan G covers most cost-sharing. Verify with Humana before paying.`,
  },

  {
    id: 4,
    label: 'Chemotherapy',
    patient: 'Maria Rodriguez',
    hospital: 'Pacific University Cancer Center',
    tag: 'Oncology',
    text: `PACIFIC UNIVERSITY CANCER CENTER
3100 Oncology Blvd, Los Angeles, CA 90024
NPI: 3331122334  |  Phone: (310) 555-0400

PATIENT ACCOUNT STATEMENT

Patient Name: Maria Rodriguez
Date of Birth: 11/30/1968
Account #: PUCC-2024-5517
Date of Service: 10/08/2024
Insurance: Cigna HMO
Member ID: CIG-886123490
Referring Physician: Dr. James Liu, MD — Oncology
Rendering Provider: Infusion Nursing Staff / Dr. Liu

DIAGNOSIS CODES: C50.911, Z79.811

ITEMIZED SERVICES
CODE  | DESCRIPTION                              | BILLED    | INS PAID  | YOU OWE
99214 | Office Visit, Moderate Complexity        |   $395.00 |   $296.25 |  $98.75
96413 | Chemotherapy Infusion, Hour 1            | $2,200.00 | $1,650.00 | $550.00
96415 | Chemotherapy Infusion, Hour 2            |   $750.00 |   $562.50 | $187.50
96415 | Chemotherapy Infusion, Hour 3            |   $750.00 |   $562.50 | $187.50
96360 | IV Hydration, Initial 31 Minutes         |   $375.00 |   $281.25 |  $93.75
96372 | Anti-nausea Injection (Ondansetron)      |   $185.00 |   $138.75 |  $46.25
85025 | CBC with Differential (Pre-chemo check)  |   $195.00 |   $146.25 |  $48.75
36415 | Blood Draw / Venipuncture                |    $45.00 |    $33.75 |  $11.25

Note: Infusion log available upon request. Verify 3 hours of infusion time with nursing notes.
Financial assistance programs available — ask your care coordinator.

BILLED TOTAL:      $4,895.00
INSURANCE ADJ:    -$1,223.75
INSURANCE PAID:    $3,671.25
PATIENT BALANCE:   $1,223.75

Hardship waiver available. Contact Maria Gomez, Financial Counselor: (310) 555-0411`,
  },

  {
    id: 5,
    label: 'OB Delivery',
    patient: 'Jennifer Park',
    hospital: 'Lakewood Women\'s Health Center',
    tag: 'Obstetric',
    text: `LAKEWOOD WOMEN'S HEALTH CENTER
2200 Lakeview Drive, Seattle, WA 98101
NPI: 7778889990  |  Tax ID: 91-3456789

ITEMIZED HOSPITAL BILL

Patient Name: Jennifer Park
Date of Birth: 07/14/1990
Account #: LWHC-2024-9934
Admission: 12/01/2024  |  Discharge: 12/03/2024
Insurance: United Healthcare PPO
Member ID: UHC-441256789
Attending OB: Dr. Priya Mehta, MD — Obstetrics & Gynecology

DIAGNOSIS CODES: Z34.32, Z37.0, O09.523

PROFESSIONAL SERVICES
CODE  | DESCRIPTION                              | BILLED    | INS PAID  | YOU OWE
59400 | Routine OB Care, Vaginal Delivery        | $9,800.00 | $7,350.00 | $1,225.00
59430 | Postpartum Care (30 days)                | $1,200.00 |   $900.00 |   $150.00
99460 | Newborn Initial Hospital Evaluation      |   $450.00 |   $337.50 |    $56.25
00400 | Anesthesia — Epidural (Labor)            | $2,800.00 | $2,100.00 |   $350.00
86900 | Blood Typing, ABO                        |    $85.00 |    $63.75 |    $10.63
86901 | Blood Typing, Rh(D)                      |    $85.00 |    $63.75 |    $10.63

Note: 59400 Global OB package typically includes postpartum care. Billing postpartum
separately (59430) may constitute unbundling. Verify with your insurer.
Anesthesia by Seattle Anesthesia Partners — separate provider. Confirm in-network status.
Newborn pediatrician bill sent separately.

BILLED TOTAL:     $14,420.00
INSURANCE ADJ:    -$3,605.00
INSURANCE PAID:    $10,815.00
PATIENT BALANCE:   $1,802.51

Congratulations on your new arrival! For billing questions: (206) 555-0200`,
  },
]

const SEVERITY_STYLES = {
  error:   { bar: 'bg-red-50 border-red-200',   badge: 'bg-red-100 text-red-700',    icon: '⚠️' },
  warning: { bar: 'bg-amber-50 border-amber-200', badge: 'bg-amber-100 text-amber-700', icon: '⚡' },
  info:    { bar: 'bg-blue-50 border-blue-200',  badge: 'bg-blue-100 text-blue-700',  icon: 'ℹ️' },
}

const TAG_COLORS = {
  Emergency: 'bg-red-100 text-red-700',
  Surgery:   'bg-purple-100 text-purple-700',
  Cardiac:   'bg-pink-100 text-pink-700',
  Oncology:  'bg-orange-100 text-orange-700',
  Obstetric: 'bg-teal-100 text-teal-700',
}

export default function BillTranslatorScreen({ navigate }) {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [activeBill, setActiveBill] = useState(null)

  const loadSample = (bill) => {
    setActiveBill(bill.id)
    setText(bill.text)
    setResult(null)
  }

  const translate = () => {
    if (text.trim()) setResult(parseBill(text))
  }

  const clear = () => {
    setText('')
    setResult(null)
    setActiveBill(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/20 flex flex-col">
      <Navbar navigate={navigate} />

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Medical Bill Translator</h1>
          <p className="text-gray-500 mt-1 text-sm">Paste any medical bill — we decode every code, charge, and red flag in plain English.</p>
        </div>

        {/* Sample bill selector */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Load a sample bill</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {SAMPLE_BILLS.map(bill => (
              <button
                key={bill.id}
                onClick={() => loadSample(bill)}
                className={`text-left p-3 rounded-xl border transition-all ${
                  activeBill === bill.id
                    ? 'border-[#2c6b55] bg-[#2c6b55]/5 shadow-sm'
                    : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                }`}
              >
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${TAG_COLORS[bill.tag] || 'bg-gray-100 text-gray-600'}`}>
                  {bill.tag}
                </span>
                <p className="text-xs font-semibold text-gray-800 mt-2 leading-tight">{bill.patient}</p>
                <p className="text-xs text-gray-400 leading-tight mt-0.5 line-clamp-2">{bill.hospital}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Text input */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-semibold text-gray-700">Bill text</label>
            {text && (
              <button onClick={clear} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                Clear
              </button>
            )}
          </div>
          <textarea
            value={text}
            onChange={e => { setText(e.target.value); setActiveBill(null); setResult(null) }}
            className="w-full bg-gray-50 rounded-xl p-4 text-xs font-mono h-52 resize-none outline-none text-gray-600 placeholder-gray-300 border border-gray-100 focus:border-[#2c6b55]/40 transition-colors leading-relaxed"
            placeholder="Paste your medical bill here, or load one of the samples above…"
          />
          <button
            onClick={translate}
            disabled={!text.trim()}
            className="mt-4 bg-[#2c6b55] hover:bg-[#245a47] text-white font-semibold px-8 py-3 rounded-xl disabled:opacity-40 transition-all active:scale-95 text-sm shadow-sm"
          >
            Translate Bill
          </button>
        </div>

        {/* Results */}
        {result && <BillResults result={result} />}
      </div>
    </div>
  )
}

function BillResults({ result }) {
  const { meta, line_items, diagnoses, totals, covered_pct, red_flags, summary } = result

  return (
    <div className="space-y-5">
      {/* Summary banner */}
      <div className="bg-[#2c6b55]/8 border border-[#2c6b55]/20 rounded-xl px-5 py-3">
        <p className="text-sm font-medium text-[#2c6b55]">{summary}</p>
      </div>

      {/* Patient + Hospital info */}
      {(meta.patient || meta.hospital) && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-3 text-sm">Bill Details</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Patient',   value: meta.patient },
              { label: 'Hospital',  value: meta.hospital },
              { label: 'Date',      value: meta.date },
              { label: 'Insurance', value: meta.insurance },
              { label: 'Account',   value: meta.account },
              { label: 'Provider',  value: meta.provider },
            ].filter(r => r.value).map(row => (
              <div key={row.label}>
                <p className="text-xs text-gray-400">{row.label}</p>
                <p className="text-sm font-medium text-gray-800 truncate">{row.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment breakdown */}
      {(totals.billed || totals.patientOwes) && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 text-sm">Payment Breakdown</h3>
          <div className="space-y-2">
            {[
              { label: 'Amount Billed',        value: totals.billed,       color: 'text-gray-800' },
              { label: 'Insurance Adjustment',  value: totals.adjustment ? -totals.adjustment : null, color: 'text-green-600', prefix: '−' },
              { label: 'Insurance Paid',        value: totals.insPaid,      color: 'text-blue-600' },
              { label: 'Your Balance',          value: totals.patientOwes,  color: 'text-red-600',   bold: true },
            ].filter(r => r.value != null).map(row => (
              <div key={row.label} className={`flex justify-between items-center py-2 ${row.bold ? 'border-t border-gray-100 mt-1' : ''}`}>
                <span className={`text-sm ${row.bold ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{row.label}</span>
                <span className={`font-semibold text-sm ${row.color}`}>
                  {row.prefix && row.prefix}${Math.abs(row.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
          {covered_pct !== null && (
            <div className="mt-4 pt-3 border-t border-gray-50">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Insurance covered</span>
                <span className="font-semibold text-green-600">{covered_pct}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-400 rounded-full transition-all" style={{ width: `${covered_pct}%` }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Procedure breakdown */}
      {line_items.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 text-sm">Procedure Breakdown ({line_items.length} services)</h3>
          <div className="divide-y divide-gray-50">
            {line_items.map((item, i) => (
              <div key={i} className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-lg font-mono font-semibold shrink-0">{item.code}</span>
                      <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg shrink-0">{item.category}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-snug">{item.description}</p>
                  </div>
                  {/* Amount columns */}
                  <div className="text-right shrink-0 space-y-0.5">
                    {item.billed != null && (
                      <p className="text-xs text-gray-400">Billed: <span className="text-gray-600">${item.billed.toLocaleString()}</span></p>
                    )}
                    {item.ins_paid != null && (
                      <p className="text-xs text-blue-500">Ins paid: ${item.ins_paid.toLocaleString()}</p>
                    )}
                    {item.pt_owes != null && (
                      <p className="text-sm font-bold text-red-500">You owe: ${item.pt_owes.toLocaleString()}</p>
                    )}
                    {item.billed == null && (
                      <p className="text-sm font-semibold text-gray-600">~${item.avg_cost.toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diagnoses */}
      {diagnoses.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 text-sm">Diagnoses in Plain English</h3>
          <div className="space-y-3">
            {diagnoses.map((d, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-1 bg-purple-200 rounded-full shrink-0" />
                <div>
                  <span className="text-xs text-gray-400 font-mono">{d.code}</span>
                  <p className="text-sm font-semibold text-gray-800">{d.plain_english}</p>
                  <p className="text-xs text-gray-400 leading-snug">{d.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Red flags */}
      {red_flags.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-gray-800 text-sm px-1">Alerts & Red Flags</h3>
          {red_flags.map((flag, i) => {
            const style = SEVERITY_STYLES[flag.severity] || SEVERITY_STYLES.info
            return (
              <div key={i} className={`rounded-xl p-4 border ${style.bar}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm">{style.icon}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.badge}`}>{flag.type}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{flag.message}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
