import { EOB_TERMS } from './data'

// ─── Extended denial code database ────────────────────────────────────────────
const DENIAL_DB = {
  'CO-4':   { short: 'Service/Diagnosis Mismatch', reason: 'The procedure code does not match the diagnosis code on the claim. The service billed is inconsistent with the medical condition reported.', action: 'Ask your provider to review and correct the CPT or ICD-10 codes and resubmit. Request a corrected claim (not an appeal).', successRate: '85%', type: 'billing_error', urgency: 'high' },
  'CO-11':  { short: 'Diagnosis Code Issue', reason: 'The diagnosis code used is not covered or does not justify the procedure billed.', action: 'Request your provider verify the diagnosis code and resubmit. Your doctor may need to provide documentation of medical necessity.', successRate: '70%', type: 'billing_error', urgency: 'high' },
  'CO-16':  { short: 'Missing Information', reason: 'The claim is missing required information — such as a referring physician NPI, authorization number, or member ID.', action: 'Contact your provider\'s billing office. They must resubmit with the missing information. This is the provider\'s responsibility to fix.', successRate: '90%', type: 'billing_error', urgency: 'medium' },
  'CO-45':  { short: 'Contractual Adjustment', reason: 'The amount exceeds the in-network contracted rate between your insurer and provider. This is NOT a denial — it\'s a write-off the provider absorbs.', action: 'No action needed. You are NOT responsible for this portion. Confirm your provider is in-network and ensure your bill only shows the allowed amount.', successRate: 'N/A', type: 'adjustment', urgency: 'low' },
  'CO-50':  { short: 'Not Medically Necessary', reason: 'Your insurance determined the service was not medically necessary based on their clinical guidelines — even if your doctor ordered it.', action: 'File an internal appeal immediately with a Letter of Medical Necessity from your doctor. Cite specific clinical guidelines. Request a peer-to-peer review.', successRate: '50%', type: 'denial', urgency: 'high' },
  'CO-96':  { short: 'Non-Covered Charge', reason: 'This service is not covered under your current benefit plan.', action: 'Review your plan documents to confirm. If you believe it should be covered, appeal citing your plan\'s Evidence of Coverage. Check if a different CPT code applies.', successRate: '30%', type: 'denial', urgency: 'medium' },
  'CO-97':  { short: 'Service Bundled/Included', reason: 'This service is considered included in another procedure already billed and cannot be billed separately under correct coding rules.', action: 'Ask your provider to verify whether unbundling is appropriate (NCCI edits). If they believe it is separately billable, they must appeal with documentation.', successRate: '40%', type: 'coding', urgency: 'medium' },
  'CO-109': { short: 'Not Covered — Claim Period', reason: 'The claim was submitted for a date of service outside your coverage period.', action: 'Verify your coverage dates. If you had active coverage, contact your insurer with proof of enrollment. If coverage lapsed, contact HR or your marketplace.', successRate: '60%', type: 'eligibility', urgency: 'high' },
  'CO-119': { short: 'Benefit Maximum Reached', reason: 'You have reached the maximum benefit allowed for this service under your plan for the current benefit period.', action: 'Review your plan\'s annual or lifetime benefit limits. Consider appealing if limits violate mental health parity or ACA rules. Consider supplemental coverage.', successRate: '25%', type: 'denial', urgency: 'medium' },
  'CO-167': { short: 'Diagnosis Not Covered', reason: 'The diagnosis code submitted is not covered under your benefit plan for this service.', action: 'Ask your doctor if an alternative, covered diagnosis code is clinically accurate. File an appeal with clinical documentation supporting medical necessity.', successRate: '45%', type: 'denial', urgency: 'high' },
  'CO-197': { short: 'Prior Authorization Missing', reason: 'This service required prior authorization from your insurance, which was not obtained before the service was performed.', action: 'If your provider failed to get prior auth, contact them — it is typically their responsibility. Request retroactive authorization citing medical necessity.', successRate: '35%', type: 'auth', urgency: 'high' },
  'CO-204': { short: 'Service Not Covered Under Plan', reason: 'This specific service is not a covered benefit under your health plan.', action: 'Review your plan\'s Evidence of Coverage. If you believe coverage should apply, appeal citing plan language. Consider if a different code category would be covered.', successRate: '25%', type: 'denial', urgency: 'medium' },
  'OA-23':  { short: 'Workers\' Compensation Issue', reason: 'The insurer believes this condition may be related to a work injury and should be billed to Workers\' Compensation instead of health insurance.', action: 'If this is NOT a work injury, provide documentation to your insurer confirming it\'s unrelated. A letter from your employer or treating physician can help.', successRate: '65%', type: 'coordination', urgency: 'high' },
  'PR-1':   { short: 'Deductible Applied', reason: 'This amount was applied to your annual deductible. You must pay your deductible in full before insurance begins sharing costs.', action: 'This is typically correct. Check your current deductible balance on your insurer\'s member portal. If you\'ve already met your deductible, call member services immediately.', successRate: 'N/A', type: 'adjustment', urgency: 'low' },
  'PR-2':   { short: 'Coinsurance Amount', reason: 'This is your required coinsurance — your percentage share of costs after meeting your deductible.', action: 'Verify the percentage matches your plan documents. If the coinsurance rate seems wrong, call member services with your plan documents ready.', successRate: 'N/A', type: 'adjustment', urgency: 'low' },
  'PR-3':   { short: 'Copay Amount', reason: 'This is your required copay for the service. Copays are fixed amounts defined in your plan and are your responsibility.', action: 'Verify the copay amount matches your insurance card and plan documents. If charged incorrectly (e.g., PCP rate vs. specialist rate), call member services.', successRate: 'N/A', type: 'adjustment', urgency: 'low' },
  'PR-96':  { short: 'Prior Auth — Member Responsibility', reason: 'Prior authorization was required but was not obtained. Because the provider failed to get authorization, the insurer holds you responsible for the cost.', action: 'Contact your provider — if they failed to get prior auth, they should waive your responsibility. File an appeal citing medical urgency if applicable.', successRate: '40%', type: 'auth', urgency: 'high' },
  'PR-204': { short: 'Service Not Covered Under Plan', reason: 'This service is excluded from your benefit plan entirely.', action: 'Review your plan\'s exclusions list. Appeal if you believe it should be covered. If truly excluded, ask your doctor about alternative covered approaches.', successRate: '20%', type: 'denial', urgency: 'medium' },
  'N30':    { short: 'Pre-Existing Condition Limitation', reason: 'The claim relates to a pre-existing condition that may be subject to a waiting period or exclusion.', action: 'Pre-existing condition exclusions are illegal for most plans under the ACA (since 2014). Appeal immediately citing ACA Section 1201.', successRate: '80%', type: 'aca_violation', urgency: 'critical' },
  'N180':   { short: 'Mental Health Parity Issue', reason: 'Mental health or substance use benefits were limited in a way that may violate the Mental Health Parity and Addiction Equity Act.', action: 'This may be illegal. File an appeal citing the Mental Health Parity Act (MHPAEA). Contact your state insurance commissioner if appeal fails.', successRate: '70%', type: 'parity_violation', urgency: 'critical' },
}

// ─── Parse EOB text ────────────────────────────────────────────────────────────
export function decodeEOB(text, eobMeta = {}) {
  const lower = text.toLowerCase()

  // Extract financial columns
  const financial = parseEOBFinancials(text)

  // Find EOB terms used in the text
  const foundTerms = Object.entries(EOB_TERMS)
    .filter(([term]) => lower.includes(term))
    .map(([term, explanation]) => ({ term: term.replace(/\b\w/g, c => c.toUpperCase()), explanation }))

  // Extract denial codes
  const denialCodes = extractDenialCodes(text)

  // Extract patient/provider metadata
  const meta = extractEOBMeta(text)

  // Build action items
  const actionItems = buildActionItems(financial, denialCodes, meta)

  // Analyze savings
  const savings = financial.billed_amount && financial.allowed_amount
    ? financial.billed_amount - financial.allowed_amount : null

  // Coverage pct
  const coveragePct = financial.billed_amount && financial.patient_owes
    ? Math.round(((financial.billed_amount - financial.patient_owes) / financial.billed_amount) * 100)
    : null

  return {
    meta,
    financial,
    savings,
    coverage_pct: coveragePct,
    denial_codes: denialCodes,
    decoded_terms: foundTerms.length ? foundTerms : Object.entries(EOB_TERMS).slice(0, 8).map(([t, e]) => ({
      term: t.replace(/\b\w/g, c => c.toUpperCase()), explanation: e,
    })),
    terms_found: foundTerms.length,
    action_items: actionItems,
    has_denial: denialCodes.length > 0,
    appeal_recommended: denialCodes.some(c => {
      const d = DENIAL_DB[c]
      return d && ['denial', 'auth', 'coding', 'aca_violation', 'parity_violation'].includes(d.type)
    }),
  }
}

function parseEOBFinancials(text) {
  const find = (patterns) => {
    for (const p of patterns) {
      const m = text.match(p)
      if (m) return parseFloat(m[1].replace(/,/g, ''))
    }
    return null
  }
  return {
    billed_amount:      find([/(?:amount billed|billed amount|total charges?|charges?)[:\s]+\$?([\d,]+\.?\d{0,2})/i]),
    allowed_amount:     find([/(?:allowed amount|plan allowed|eligible amount|negotiated amount)[:\s]+\$?([\d,]+\.?\d{0,2})/i]),
    plan_paid:          find([/(?:plan paid|insurance paid|amount paid|we paid|plan payment)[:\s]+\$?([\d,]+\.?\d{0,2})/i]),
    deductible_applied: find([/(?:deductible applied|applied to deductible|deductible)[:\s]+\$?([\d,]+\.?\d{0,2})/i]),
    copay:              find([/(?:copay|co-pay)[:\s]+\$?([\d,]+\.?\d{0,2})/i]),
    coinsurance:        find([/(?:coinsurance|co-insurance)[:\s]+\$?([\d,]+\.?\d{0,2})/i]),
    not_covered:        find([/(?:not covered|non-covered|excluded)[:\s]+\$?([\d,]+\.?\d{0,2})/i]),
    patient_owes:       find([/(?:patient responsibility|member responsibility|you owe|your share|amount due|patient amount)[:\s]+\$?([\d,]+\.?\d{0,2})/i]),
  }
}

function extractDenialCodes(text) {
  const codes = []
  const patterns = [
    /\b(CO-\d+)\b/gi,
    /\b(PR-\d+)\b/gi,
    /\b(OA-\d+)\b/gi,
    /\b(N\d{1,3})\b/g,
    /adjustment reason code[:\s]+(\w+-?\d+)/gi,
    /remark code[:\s]+(\w+\d+)/gi,
  ]
  for (const p of patterns) {
    for (const m of text.matchAll(p)) {
      const code = m[1].toUpperCase()
      if (!codes.includes(code)) codes.push(code)
    }
  }
  return codes
}

function extractEOBMeta(text) {
  const find = (patterns) => {
    for (const p of patterns) {
      const m = text.match(p)
      if (m) return m[1]?.trim()
    }
    return null
  }
  return {
    member:    find([/member(?:\s+name)?:\s*(.+)/i, /patient:\s*(.+)/i, /insured:\s*(.+)/i]),
    claim_num: find([/claim\s*(?:#|number|no\.?):\s*(.+)/i]),
    provider:  find([/provider(?:\s+name)?:\s*(.+)/i, /rendering provider:\s*(.+)/i]),
    insurer:   find([/(?:insurance company|insurer|plan|payer):\s*(.+)/i]),
    dos:       find([/date of service:\s*(.+)/i, /service date:\s*(.+)/i]),
    processed: find([/(?:processed|processed on|date processed):\s*(.+)/i]),
    group_num: find([/group\s*(?:#|number|no\.?):\s*(.+)/i]),
  }
}

function buildActionItems(financial, denialCodes, meta) {
  const items = [
    'This EOB is NOT a bill — wait for an invoice from your provider before paying anything.',
    'Compare "Amount Billed" vs "Allowed Amount" — you are NOT responsible for the difference (contractual write-off).',
  ]
  if (financial.patient_owes && financial.patient_owes > 0) {
    items.push(`Your total responsibility is $${financial.patient_owes.toLocaleString()} — verify this matches the bill from your provider before paying.`)
  }
  if (denialCodes.length > 0) {
    items.push(`Denial/adjustment codes found: ${denialCodes.join(', ')} — use the Denial Explainer tab to understand each code and generate an appeal letter.`)
  }
  if (financial.deductible_applied && financial.deductible_applied > 0) {
    items.push(`$${financial.deductible_applied.toLocaleString()} applied to your deductible. Check your running deductible balance on your insurer's member portal.`)
  }
  items.push('Call member services (number on back of insurance card) if any amount seems incorrect.')
  items.push('Keep this EOB for your records — you may need it for tax purposes (HSA/FSA) or future appeals.')
  return items
}

// ─── Denial explainer + appeal generator ──────────────────────────────────────
export function explainDenial(code, context = {}) {
  const upper = code.toUpperCase().trim()
  const info = DENIAL_DB[upper]

  const appeal = generateAppealLetter(upper, info, context)
  const steps  = generateActionSteps(upper, info, context)

  return {
    code: upper,
    short: info?.short || 'Unknown Code',
    reason: info?.reason || `Denial code ${upper} was not recognized in our database. Call your insurer's member services for a detailed explanation.`,
    recommended_action: info?.action || 'Call the member services number on the back of your insurance card and ask for a written explanation of this denial.',
    appeal_template: appeal,
    action_steps: steps,
    success_rate: info?.successRate || '40–60%',
    type: info?.type || 'unknown',
    urgency: info?.urgency || 'medium',
    deadline: 'File within 180 days of the denial date (most plans). Check your plan documents for your specific deadline.',
    peer_to_peer: ['CO-50', 'CO-96', 'CO-167', 'CO-197', 'CO-204'].includes(upper),
    external_review: true,
  }
}

function generateActionSteps(code, info, ctx) {
  const steps = []
  if (!info) {
    return ['Call member services on the back of your insurance card', 'Ask for a written explanation of the denial', 'Request the appeals process information']
  }
  if (info.type === 'billing_error') {
    steps.push('Contact your provider\'s billing department immediately')
    steps.push('Ask them to submit a corrected claim (not an appeal) with the correct codes')
    steps.push('Follow up in 5–7 business days to confirm resubmission')
    steps.push('If not resolved, escalate to your insurer\'s member services')
  } else if (info.type === 'denial' || info.type === 'auth') {
    steps.push('Request a Letter of Medical Necessity from your treating physician')
    if (info.peer_to_peer || ['CO-50', 'CO-197'].includes(code)) {
      steps.push('Ask your doctor to request a peer-to-peer review with the insurance medical director (reverses ~40% of denials before formal appeal)')
    }
    steps.push('File an internal appeal within 180 days using the letter below')
    steps.push('If internal appeal fails, request external independent review (legally required for most plans)')
    steps.push('Contact your state\'s insurance commissioner if all else fails')
  } else if (info.type === 'aca_violation' || info.type === 'parity_violation') {
    steps.push('File an urgent appeal citing the specific law violation')
    steps.push('Contact your state insurance commissioner immediately')
    steps.push('Consider filing a complaint with CMS (cms.gov) or DOL (dol.gov)')
    steps.push('Consult a patient advocate or healthcare attorney — many work on contingency')
  } else {
    steps.push('Review your plan\'s Evidence of Coverage for the specific benefit/exclusion')
    steps.push('File an appeal if you believe coverage should apply')
    steps.push('Call member services for a detailed explanation')
  }
  return steps
}

function generateAppealLetter(code, info, ctx) {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const {
    memberName = '[YOUR FULL NAME]',
    memberId   = '[YOUR MEMBER ID]',
    groupNum   = '[YOUR GROUP NUMBER]',
    claimNum   = '[CLAIM NUMBER FROM YOUR EOB]',
    provider   = '[PROVIDER NAME]',
    dos        = '[DATE OF SERVICE]',
    service    = '[SERVICE OR PROCEDURE NAME]',
    amount     = '[AMOUNT DENIED]',
    insurer    = '[INSURANCE COMPANY NAME]',
    diagnosis  = '[DIAGNOSIS / MEDICAL CONDITION]',
  } = ctx

  const legalCitations = getLegalCitations(info?.type)
  const specificRationale = getDenialRationale(code, info, ctx)

  return `${today}

URGENT: FORMAL APPEAL OF DENIED CLAIM

Via: Certified Mail / Return Receipt Requested

${insurer}
Appeals Department
[INSURER ADDRESS]

RE: Member: ${memberName}
    Member ID: ${memberId}
    Group Number: ${groupNum}
    Claim Number: ${claimNum}
    Date of Service: ${dos}
    Provider: ${provider}
    Service: ${service}
    Amount Denied: ${amount}
    Denial Code: ${code}

Dear Appeals Department,

I am formally appealing the denial of the above-referenced claim under denial code ${code} ("${info?.short || 'Unknown'}"). I respectfully request a full and fair review of this decision.

REASON FOR APPEAL:
${specificRationale}

MEDICAL NECESSITY STATEMENT:
The service described above was ordered by my treating physician as medically necessary for the diagnosis and treatment of ${diagnosis}. Medical necessity is supported by:
  1. My physician's clinical assessment and treatment plan
  2. Established clinical practice guidelines for this condition
  3. My documented medical history and prior treatment attempts
  4. [ATTACH: Letter of Medical Necessity from Dr. _______]

LEGAL BASIS FOR THIS APPEAL:
${legalCitations}

DOCUMENTATION ENCLOSED:
  ☐ Copy of the Explanation of Benefits (EOB) showing denial
  ☐ Letter of Medical Necessity from treating physician
  ☐ Relevant medical records and clinical notes
  ☐ Prior authorization confirmation (if applicable)
  ☐ Clinical guidelines supporting medical necessity
  ☐ Copy of insurance card (front and back)

REQUEST FOR PEER-TO-PEER REVIEW:
I also request that my treating physician, [DOCTOR NAME, MD], be given the opportunity to conduct a peer-to-peer review with your medical director. Please contact my physician's office at [DOCTOR PHONE NUMBER] to arrange this call within 5 business days.

REQUESTED OUTCOME:
I request that you reverse the denial and process this claim for payment according to my in-network benefits. If this appeal is denied, please provide:
  1. The specific clinical criteria used to make the determination
  2. The name and credentials of the reviewing clinician
  3. Instructions for requesting an external independent review

RESPONSE DEADLINE:
Please respond within 30 days for standard appeals, or 72 hours for urgent/expedited review.

If you do not resolve this matter in my favor, I will pursue all available remedies including:
  • External independent review (as required by law)
  • Filing a complaint with the [STATE] Department of Insurance
  • Filing a complaint with the Centers for Medicare & Medicaid Services
  • Consulting legal counsel regarding ERISA violations (if applicable)

Sincerely,

${memberName}
[ADDRESS]
[PHONE NUMBER]
[EMAIL ADDRESS]

Enclosures: As listed above`
}

function getLegalCitations(type) {
  if (type === 'aca_violation') {
    return `Under the Affordable Care Act (ACA) § 1201, health insurers are prohibited from denying coverage based on pre-existing conditions. This denial may violate federal law. Under ACA § 2719, I have the right to an internal appeal and external review.`
  }
  if (type === 'parity_violation') {
    return `Under the Mental Health Parity and Addiction Equity Act (MHPAEA), mental health and substance use disorder benefits must be covered no more restrictively than medical and surgical benefits. This denial may violate MHPAEA. I request a detailed comparative analysis of how this benefit limitation compares to analogous medical/surgical benefits.`
  }
  if (type === 'auth') {
    return `Under ACA § 2719 and ERISA § 503, I have the right to a full and fair review of this adverse benefit determination. Prior authorization requirements must be applied consistently and transparently per my plan documents.`
  }
  return `Under the Affordable Care Act (ACA) § 2719 and, if applicable, ERISA § 503, I have the right to a full and fair appeal of this adverse benefit determination. My plan must provide a written explanation of the specific reason(s) for denial and the clinical criteria used in making this decision.`
}

function getDenialRationale(code, info, ctx) {
  if (code === 'CO-50') {
    return `My claim was denied as "not medically necessary" (CO-50). However, this determination is incorrect. My treating physician determined this service was medically necessary based on my documented condition (${ctx.diagnosis || 'my diagnosis'}). I dispute the insurer's medical necessity determination and request that a qualified clinician familiar with my complete medical history and current guidelines conduct a thorough review.`
  }
  if (code === 'CO-197' || code === 'PR-96') {
    return `My claim was denied for lack of prior authorization (${code}). However, [choose applicable: (a) my provider confirms prior authorization was obtained, authorization number: ____; OR (b) this was an urgent/emergency service that did not allow time for prior authorization; OR (c) my provider was not properly informed of the prior authorization requirement]. In the case of urgent medical need, retroactive authorization should be granted.`
  }
  if (code === 'CO-4' || code === 'CO-11') {
    return `My claim was denied due to a coding mismatch (${code}). I believe this is a billing error by my provider's office. I have contacted the provider's billing department and requested a corrected claim be submitted. I respectfully ask that you hold this claim pending receipt of the corrected submission.`
  }
  return `My claim was denied under code ${code} ("${info?.short || 'unknown reason'}"). I believe this denial was made in error. The service provided was medically necessary and covered under my benefit plan. I am submitting this appeal with supporting documentation and respectfully request a full review.`
}

// ─── Claims Bot logic ──────────────────────────────────────────────────────────
export const CLAIMS_FLOWS = {
  new_claim: {
    title: 'File a New Claim',
    icon: '📋',
    steps: [
      { id: 'service', question: 'What type of service are you claiming?', options: ['Doctor visit', 'Hospital stay', 'Prescription drug', 'Mental health', 'Surgery/procedure', 'Lab or imaging', 'Other'] },
      { id: 'network', question: 'Was your provider in-network or out-of-network?', options: ['In-network', 'Out-of-network', "I'm not sure"] },
      { id: 'auth', question: 'Did you get prior authorization before the service?', options: ['Yes, I have an auth number', 'No, it was an emergency', 'No — I forgot / provider said it wasn\'t needed', "I'm not sure"] },
    ],
    result: (answers) => ({
      title: 'How to File Your Claim',
      steps: [
        'Collect your EOB (your insurer sends this automatically after the provider bills)',
        'Log in to your insurer\'s member portal or call member services to check claim status',
        'If you paid out-of-pocket (e.g., out-of-network), download your insurer\'s claim form at their website',
        'Attach your itemized receipt, diagnosis, and any referral letters',
        answers.auth === 'No — I forgot / provider said it wasn\'t needed'
          ? '⚠️ Since no prior auth was obtained, your claim may be partially denied. Gather medical necessity documentation from your doctor.'
          : 'Submit online, by mail, or via fax. Keep a copy of everything.',
        'Claims are typically processed within 30 days. You\'ll receive an EOB in the mail or online.',
      ],
      tip: answers.network === 'Out-of-network'
        ? '💡 Out-of-network claims may require manual submission. Your cost-sharing (deductible, coinsurance) will likely be higher, and the allowed amount lower.'
        : '💡 In-network claims are typically filed automatically by your provider. If you haven\'t received an EOB within 45 days, call member services.',
    }),
  },

  check_status: {
    title: 'Check Claim Status',
    icon: '🔍',
    steps: [
      { id: 'has_claim_num', question: 'Do you have a claim number?', options: ['Yes', 'No — only have date of service'] },
      { id: 'timeframe', question: 'How long ago was the service?', options: ['Less than 2 weeks', '2–4 weeks', '1–3 months', 'More than 3 months'] },
      { id: 'got_eob', question: 'Have you received an EOB (Explanation of Benefits)?', options: ['Yes', 'No', "I don't know what that is"] },
    ],
    result: (answers) => ({
      title: 'How to Check Your Claim Status',
      steps: [
        '1. Log in to your insurer\'s member portal (website or app) — go to "Claims" or "Claim Status"',
        answers.has_claim_num === 'Yes'
          ? '2. Search by your claim number for instant status'
          : '2. Search by date of service and provider name',
        answers.timeframe === 'Less than 2 weeks'
          ? '3. Claims under 2 weeks may still be processing — allow up to 30 days'
          : '3. Call member services (number on back of insurance card) if not showing online',
        answers.got_eob === 'No' && answers.timeframe !== 'Less than 2 weeks'
          ? '4. ⚠️ No EOB after 30+ days may indicate the provider hasn\'t submitted the claim yet — call your provider\'s billing office'
          : '4. Your EOB is the official record of how your claim was processed',
        '5. If claim shows as denied, use the Denial Explainer tab to understand your options',
      ],
      tip: '💡 Most insurers also have a mobile app where you can track claims in real-time. Teladoc and many telehealth services show claim status within 24 hours.',
    }),
  },

  dispute_denial: {
    title: 'Dispute a Denial',
    icon: '⚖️',
    steps: [
      { id: 'denial_code', question: 'Do you know your denial code from your EOB?', options: ['Yes — I have the code', 'No — just know it was denied', "Haven't received EOB yet"] },
      { id: 'denial_reason', question: 'What reason was given for the denial?', options: ['Not medically necessary', 'Prior auth not obtained', 'Out-of-network provider', 'Service not covered', 'Billing/coding error', 'Other / unknown'] },
      { id: 'urgency', question: 'How urgent is resolving this?', options: ['I need the service soon (ongoing care)', 'I already received the service and got a bill', 'Not urgent — planning ahead'] },
    ],
    result: (answers) => ({
      title: 'Your Denial Appeal Plan',
      steps: [
        answers.denial_code === "Haven't received EOB yet"
          ? '1. Wait for your EOB or request it from your insurer — you need the denial code before appealing'
          : '1. Use the Denial Explainer tab to decode your denial code and generate a personalized appeal letter',
        '2. Call your doctor\'s office and request a "Letter of Medical Necessity" explaining why this service was required',
        answers.denial_reason === 'Not medically necessary'
          ? '3. Ask your doctor to request a peer-to-peer review with the insurance medical director — this reverses ~40% of denials before formal appeal'
          : '3. Gather your medical records, doctor\'s orders, and any prior authorization records',
        '4. File your internal appeal within 180 days of the denial date',
        answers.urgency === 'I need the service soon (ongoing care)'
          ? '5. ⚡ Request an expedited appeal — insurers must respond within 72 hours for urgent care situations'
          : '5. Standard appeals: insurer must respond within 30 days (pre-service) or 60 days (post-service)',
        '6. If internal appeal fails: request an external independent review — this is free and legally required for most plans',
      ],
      tip: answers.denial_reason === 'Billing/coding error'
        ? '💡 Billing errors often resolve faster with a corrected claim (not an appeal). Call your provider\'s billing office first.'
        : '💡 40–60% of insurance appeals are successful. Document everything in writing and keep copies of all correspondence.',
    }),
  },

  understand_eob: {
    title: 'Understand My EOB',
    icon: '📄',
    steps: [
      { id: 'confusing_part', question: 'What part of your EOB is confusing?', options: ['Why I owe money', 'The difference between "billed" and "allowed"', 'What "deductible applied" means', 'Adjustment/denial codes', 'All of it'] },
      { id: 'amount_concern', question: 'Is the "patient responsibility" amount concerning?', options: ['Yes — seems too high', 'I want to understand it', 'No — just want to learn'] },
    ],
    result: (answers) => ({
      title: 'Understanding Your EOB',
      steps: [
        'Use the "Decode EOB" tab above to paste your EOB text — we\'ll break down every number.',
        answers.confusing_part === 'The difference between "billed" and "allowed"'
          ? 'KEY CONCEPT: "Amount Billed" is what the provider charges. "Allowed Amount" is your insurer\'s negotiated rate. The difference is written off — you never owe it.'
          : '',
        answers.confusing_part === 'What "deductible applied" means'
          ? 'KEY CONCEPT: "Deductible Applied" means this amount counted toward your annual deductible. You pay it 100% until your deductible is met, then insurance starts sharing costs.'
          : '',
        answers.amount_concern === 'Yes — seems too high'
          ? '⚠️ If patient responsibility seems high: (1) verify you\'re being billed the "allowed amount" not the full billed amount, (2) check if your deductible is actually met, (3) confirm in-network rate was applied'
          : 'Remember: the EOB is NOT a bill. Wait for an invoice from your provider before paying.',
        'If you see denial or adjustment codes (e.g., CO-45, PR-1), use the Denial Explainer tab to decode them.',
      ].filter(Boolean),
      tip: '💡 Billing errors affect up to 80% of medical bills. Always compare your EOB to the provider\'s invoice line by line before paying.',
    }),
  },

  financial_help: {
    title: 'Get Financial Help',
    icon: '💰',
    steps: [
      { id: 'situation', question: 'What is your situation?', options: ['Received a large unexpected bill', 'Cannot afford my share', 'Uninsured or underinsured', 'Hit my out-of-pocket maximum'] },
      { id: 'amount', question: 'What is the approximate amount you\'re struggling with?', options: ['Under $500', '$500–$2,000', '$2,000–$10,000', 'Over $10,000'] },
      { id: 'insurance', question: 'Do you have health insurance?', options: ['Yes — through employer', 'Yes — through ACA/Marketplace', 'Yes — Medicare', 'Yes — Medicaid', 'No insurance'] },
    ],
    result: (answers) => ({
      title: 'Your Financial Assistance Options',
      steps: [
        answers.situation === 'Received a large unexpected bill'
          ? '1. Request an itemized bill and compare to your EOB — billing errors affect up to 80% of bills'
          : '1. Contact the hospital or provider billing department and ask about financial assistance programs',
        answers.amount === 'Over $10,000' || answers.amount === '$2,000–$10,000'
          ? '2. Apply for hospital charity care — nonprofit hospitals must offer financial assistance. Ask for the application by name.'
          : '2. Ask your provider about interest-free payment plans — most will offer 12–24 month plans',
        answers.insurance === 'No insurance'
          ? '3. Ask for an "uninsured discount" — typically 30–60% off the billed amount just for not having insurance'
          : '3. Verify your out-of-pocket maximum — if you\'ve hit it, insurance should cover 100% of remaining costs',
        '4. Dollar For (dollarfor.org) is a FREE service that applies to hospital financial assistance programs on your behalf',
        answers.situation === 'Hit my out-of-pocket maximum'
          ? '5. ✅ Once you hit your OOP max, insurance covers 100%. Call your insurer immediately and confirm the date you hit your maximum.'
          : '5. NeedyMeds.org for prescription assistance, RxAssist.org for brand-name drug programs',
        'Never ignore medical debt — always call and negotiate. Hospitals rarely send to collections while a payment plan or assistance application is active.',
      ],
      tip: answers.amount === 'Over $10,000'
        ? '💡 Consider a medical billing advocate (fee: 20–35% of savings). For very large bills they can often negotiate to 10–20 cents on the dollar.'
        : '💡 Medical debt is treated differently under credit reporting rules since 2023 — bills under $500 no longer appear on credit reports.',
    }),
  },
}
