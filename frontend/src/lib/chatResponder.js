import { search, lookupCode, typeLabel } from './vectorSearch.js'

/**
 * Returns { content: string, suggestions: string[] }
 *
 * Match order matters — most specific checks come first:
 * 1. Coverage intent  ("am I covered for X", "does insurance cover X")
 * 2. Explanation      ("what is X")
 * 3. Comparison       ("difference between X and Y")
 * 4. Cost / general topic
 * 5. Insurance fundamentals
 * 6. CPT/ICD code lookup + vector search fallback
 */
export function getResponse(message) {
  const msg = message.toLowerCase()
  const hasCoverage = match(msg, ['covered', 'coverage', 'does insurance', 'will insurance', 'is it covered', 'am i covered', 'cover my', 'cover the', 'cover a', 'cover an', 'does my insurance', 'what does insurance'])

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. COVERAGE QUESTIONS — "Am I covered for X?" / "Does insurance cover X?"
  // ═══════════════════════════════════════════════════════════════════════════

  if (hasCoverage && match(msg, ['tooth', 'dental', 'teeth', 'crown', 'root canal', 'implant', 'cavity', 'dentist', 'break a tooth', 'broke'])) {
    return reply(
      `**Does insurance cover dental care?**\n\nMost standard health insurance (medical) does NOT cover routine dental care. Dental is almost always a separate plan.\n\n**With dental insurance:**\n• Preventive (cleanings, X-rays): 100% covered, no deductible\n• Basic (fillings, extractions): 70–80% covered after deductible\n• Major (crowns, root canals): 50% covered after deductible\n• Orthodontics: sometimes covered up to a lifetime max (~$1,500)\n• Annual maximum: most dental plans cap at $1,000–$2,000/year\n\n**If you break a tooth:**\n• Emergency extraction: usually covered under "basic" (70–80%)\n• Crown to restore it: covered under "major" (50%) — expect to pay $500–$900 out-of-pocket\n• Implant to replace it: often NOT covered or only partially covered\n\n**Without dental insurance:** Ask about dental discount plans (DentalPlans.com) — $100–$200/year for 20–50% discounts at member dentists.`,
      ['How much does a dental crown cost?', 'What is a dental implant?', 'How do I find affordable dental care?', 'Is orthodontics covered by insurance?']
    )
  }

  if (hasCoverage && match(msg, ['mri', 'magnetic resonance', 'scan', 'imaging', 'ct scan', 'x-ray', 'ultrasound'])) {
    return reply(
      `**Am I covered for an MRI or imaging?**\n\nYes — if your doctor orders it as medically necessary, most insurance covers MRI, CT, and X-rays. Here's what to expect:\n\n**MRI:**\n• Requires a doctor's order (cannot self-refer)\n• Most plans require prior authorization — your doctor submits this\n• After deductible + coinsurance: typically $100–$500 out-of-pocket\n• Out-of-network imaging center: may cost significantly more\n\n**CT Scan:**\n• Usually covered similarly to MRI\n• May not require prior auth for emergency CTs\n\n**X-Ray:**\n• Almost always covered with just a copay ($20–$50)\n• Rarely needs prior authorization\n\n**💡 Key tips:**\n• Always ask: "Is prior authorization required for this scan?"\n• Outpatient imaging centers (RadNet, SimonMed) charge 50–70% less than hospital radiology — same scanner, same quality\n• Confirm the imaging center is in-network before scheduling`,
      ['What is prior authorization?', 'How do I find a cheaper imaging center?', 'What is the difference between MRI and CT scan?', 'How much does an MRI cost without insurance?']
    )
  }

  if (hasCoverage && match(msg, ['surgery', 'operation', 'procedure', 'knee', 'hip', 'appendix', 'gallbladder', 'hernia'])) {
    return reply(
      `**Is my surgery covered by insurance?**\n\nMost medically necessary surgeries are covered, but here's what to verify before scheduling:\n\n**Before surgery — checklist:**\n• ✅ Get prior authorization (your surgeon's office usually handles this)\n• ✅ Confirm your surgeon is in-network\n• ✅ Confirm the surgical facility (hospital or ASC) is in-network\n• ✅ Confirm the anesthesiologist is in-network (they often aren't!)\n• ✅ Check your deductible balance — surgery usually hits your deductible first\n\n**What you'll typically owe:**\n• Deductible (if not yet met) + coinsurance (usually 20%)\n• Most major surgeries hit your out-of-pocket maximum\n• After hitting OOP max: insurance covers 100%\n\n**Elective vs. emergency:**\n• Emergency surgery: covered even out-of-network (No Surprises Act)\n• Elective surgery: must be in-network, may need pre-auth\n\n💡 Call your insurance before surgery and ask: "What is my estimated patient responsibility for CPT code [your procedure code]?"`,
      ['What is prior authorization?', 'What is an out-of-pocket maximum?', 'Is anesthesia billed separately?', 'What is the No Surprises Act?']
    )
  }

  if (hasCoverage && match(msg, ['therapy', 'mental health', 'psychiatrist', 'counseling', 'psychotherapy', 'depression', 'anxiety'])) {
    return reply(
      `**Is mental health therapy covered by insurance?**\n\nYes — the Mental Health Parity and Addiction Equity Act requires insurers to cover mental health the same as physical health.\n\n**What's covered:**\n• Outpatient therapy sessions: copay or 20% coinsurance (same as a specialist visit)\n• Psychiatrist visits (medication management): covered as specialist\n• Inpatient psychiatric care: covered same as medical hospitalization\n• Substance use treatment: covered\n\n**Typical costs with insurance:**\n• Therapy session (50 min): $20–$60 copay, or 20% after deductible\n• Psychiatrist: $40–$70 copay\n\n**Common coverage issues:**\n• Plans may limit to "medically necessary" visits — appeal if sessions are denied\n• Finding in-network therapists can be difficult (provider shortage)\n• Telehealth therapy often has lower copays ($0–$30)\n\n💡 If your plan's network is too narrow, ask about "out-of-network exception" — insurers must cover OON if no adequate in-network provider exists.`,
      ['How do I find an in-network therapist?', 'What is telehealth therapy?', 'Can my therapy be denied?', 'What is the Mental Health Parity Act?']
    )
  }

  if (hasCoverage && match(msg, ['physical therapy', 'pt ', 'rehab', 'physiotherapy'])) {
    return reply(
      `**Is physical therapy covered by insurance?**\n\nYes — most plans cover PT, but with limits:\n\n**Typical coverage:**\n• Session copay: $30–$60, or 20% coinsurance after deductible\n• Annual session limit: 20–60 visits per year (varies by plan)\n• Requires a doctor's referral on most HMO plans\n• PPO plans: can often self-refer\n\n**What requires prior auth:**\n• Extended PT beyond the initial approved sessions\n• PT for chronic conditions (may require ongoing medical necessity documentation)\n\n**What's usually NOT covered:**\n• Maintenance PT (when you've plateaued and aren't actively improving)\n• Massage therapy or yoga as standalone PT\n\n💡 In many states you can see a PT directly without a referral (Direct Access laws). This saves you a PCP visit copay.`,
      ['How many PT sessions does insurance cover?', 'Do I need a referral for physical therapy?', 'How much does PT cost?', 'What is occupational therapy?']
    )
  }

  if (hasCoverage && match(msg, ['preventive', 'annual', 'physical', 'checkup', 'wellness', 'vaccine', 'flu shot', 'screening'])) {
    return reply(
      `**What preventive care is covered 100% for free?**\n\nUnder the ACA, all Marketplace and most employer plans must cover these at $0 cost to you — no copay, no deductible:\n\n**Always free:**\n• Annual wellness exam / physical\n• All CDC-recommended vaccines (flu, COVID, shingles, HPV, etc.)\n• Blood pressure screening\n• Cholesterol screening (adults 35+)\n• Diabetes screening\n• Depression screening\n• Colorectal cancer screening (colonoscopy, Cologuard) — adults 45+\n• Mammogram — women 40–75\n• Pap smear — women\n• STI screening\n• Obesity counseling\n\n**⚠️ Watch out for this trap:**\nIf your doctor orders extra lab tests during your physical that aren't on the preventive list, those get billed under your deductible. Tell your doctor: "Keep this visit preventive-only."`,
      ['What vaccines are covered for free?', 'Why did I get a bill after my free physical?', 'Is a colonoscopy free?', 'What is an annual deductible?']
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. EXPLANATION QUESTIONS — "What is X?"
  // ═══════════════════════════════════════════════════════════════════════════

  if (match(msg, ['what is a dental crown', 'what is a crown', 'what does a crown do'])) {
    return reply(
      `**What is a dental crown?**\n\nA crown is a tooth-shaped cap placed over a damaged tooth to restore its shape, size, and strength.\n\n**When you need one:**\n• Tooth cracked or broken\n• Large cavity that can't be filled\n• After a root canal (to protect the weakened tooth)\n• Worn-down teeth\n\n**Types and costs:**\n• Porcelain/ceramic (looks natural): $1,000–$1,800\n• Porcelain-fused-to-metal: $1,000–$1,500\n• Full metal (gold): $600–$2,500\n\n**Process:** 2 visits — first to reshape the tooth and take impressions, second to cement the permanent crown.\n\n**With dental insurance:** typically 50% covered under "major services" after deductible. Expect to pay $500–$900 out-of-pocket.`,
      ['How much does a root canal cost?', 'Is a dental crown covered by insurance?', 'What is the difference between a crown and a filling?', 'How long does a dental crown last?']
    )
  }

  if (match(msg, ['what is a root canal', 'root canal procedure', 'root canal treatment'])) {
    return reply(
      `**What is a root canal?**\n\nA root canal removes infected or inflamed pulp (the soft tissue inside your tooth) to save the tooth from extraction.\n\n**Why it's needed:**\n• Deep cavity reaching the pulp\n• Cracked tooth with pulp exposure\n• Repeated dental procedures on one tooth\n• Trauma to the tooth\n\n**What to expect:**\n• Local anesthesia — generally not painful during the procedure\n• 1–2 visits, each 60–90 minutes\n• After: mild soreness for a few days\n• A crown is usually placed afterward to protect the tooth\n\n**Cost:**\n• Front tooth (1 canal): $700–$1,200\n• Back molar (3–4 canals): $1,000–$1,800\n• With dental insurance: 50% covered under major services\n\n💡 A root canal saves your natural tooth — far cheaper than extraction + implant ($3,000–$5,000).`,
      ['Is a root canal covered by insurance?', 'Do I need a crown after a root canal?', 'What is a dental crown?', 'How much does a tooth extraction cost?']
    )
  }

  if (match(msg, ['what is contrast', 'contrast dye', 'with contrast', 'without contrast', 'gadolinium'])) {
    return reply(
      `**What is contrast dye for MRI/CT?**\n\nContrast dye is a substance injected into a vein before imaging to make certain structures show up more clearly.\n\n**MRI contrast:** Gadolinium — highlights tumors, inflammation, blood vessels, and the brain's blood-brain barrier.\n\n**CT contrast:** Iodine-based dye — shows blood vessels, organs, and soft tissue detail.\n\n**When it's used:**\n• Suspected tumor or cancer\n• Looking at blood vessels (angiography)\n• Checking brain, spine inflammation\n• Abdominal/pelvic CT for detailed organ views\n\n**Cost difference:**\n• Without contrast: $400–$2,000\n• With contrast: add $200–$500\n\n**Side effects:** Usually minimal — warmth, metallic taste. Allergic reactions are rare (~0.1%). Let your doctor know if you have kidney disease before receiving contrast.`,
      ['How much does an MRI cost?', 'Will insurance cover contrast MRI?', 'What is the difference between MRI and CT scan?', 'What is prior authorization?']
    )
  }

  if (match(msg, ['difference between mri and ct', 'mri vs ct', 'ct vs mri', 'mri or ct', 'ct or mri'])) {
    return reply(
      `**MRI vs CT Scan — what's the difference?**\n\n| | MRI | CT Scan |\n|---|---|---|\n| Technology | Magnetic fields | X-rays (radiation) |\n| Speed | 30–60 minutes | 5–10 minutes |\n| Detail | Better soft tissue | Better bone/dense tissue |\n| Cost | $400–$3,500 | $300–$2,500 |\n| Radiation | None | Yes (low-moderate) |\n\n**Use MRI for:** Brain, spinal cord, joints, muscles, tumors, MS, stroke follow-up\n\n**Use CT for:** Trauma/emergencies, lung, bone fractures, abdominal organs, appendicitis, rapid stroke assessment\n\n**With insurance:** Both require a doctor's order. CT is often approved faster. MRI may need prior authorization.\n\n💡 If your doctor orders a CT and you're concerned about radiation, ask if an MRI would answer the same question.`,
      ['How much does an MRI cost?', 'Do I need prior authorization for a CT scan?', 'What is contrast dye?', 'How do I find a cheaper imaging center?']
    )
  }

  if (match(msg, ['what is an eob', 'what does eob mean', 'what is explanation of benefits'])) {
    return reply(
      `**What is an EOB (Explanation of Benefits)?**\n\nAn EOB is a statement from your insurance company after a medical visit — it is NOT a bill.\n\n**What it shows:**\n• What your provider charged\n• The "allowed amount" (negotiated rate between insurer and provider)\n• What your insurance paid\n• What YOU owe (deductible, copay, or coinsurance)\n\n**Example:**\nProvider charges: $500\nAllowed amount: $280 (insurance's negotiated rate)\nInsurance pays: $224 (80%)\nYou owe: $56 (20% coinsurance)\n\n**Always wait** for the actual bill from your provider before paying. The EOB amount and the provider's bill should match.\n\n💡 Compare your EOB to the itemized bill line by line. If they don't match, call your provider's billing office — billing errors affect up to 80% of medical bills.`,
      ['What are denial codes on an EOB?', 'What does CO-97 mean?', 'How do I dispute a charge on my EOB?', 'Use the Insurance Decoder tab to decode your EOB']
    )
  }

  if (match(msg, ['what is a deductible', 'explain deductible', 'how does deductible work'])) {
    return reply(
      `**What is a deductible?**\n\nYour deductible is the amount you pay out-of-pocket each year before your insurance starts sharing costs.\n\n**How it works:**\n• Deductible: $1,500\n• You pay the first $1,500 of covered care yourself (100%)\n• After $1,500: insurance kicks in — you pay coinsurance (e.g. 20%)\n• After your out-of-pocket maximum: insurance pays 100%\n\n**Resets every January 1st.**\n\n**What counts toward your deductible:**\n• Most covered medical services\n\n**What does NOT count:**\n• Preventive care (free under ACA)\n• Premiums (monthly insurance payment)\n• Some copays (plan-dependent)\n\n💡 If you've met your deductible late in the year, schedule non-urgent procedures before December 31st — they'll cost less.`,
      ['What is coinsurance?', 'What is an out-of-pocket maximum?', 'What is a copay?', 'What is preventive care?']
    )
  }

  if (match(msg, ['what is copay', 'what is a copay', 'how does copay work', 'what is co-pay'])) {
    return reply(
      `**What is a copay?**\n\nA copay is a fixed dollar amount you pay for a specific service at the time of your visit — regardless of the total cost.\n\n**Typical copays:**\n• Primary care visit: $20–$40\n• Specialist visit: $40–$70\n• Urgent care: $50–$100\n• Emergency room: $100–$350\n• Generic prescription: $5–$20\n• Brand-name prescription: $30–$80\n• Telehealth visit: $0–$30\n\n**Important:** Copays usually apply before meeting your deductible on HMO plans. On some PPO plans, you pay your deductible first, then copays kick in.\n\n**Do copays count toward your deductible?**\nUsually no — but copays DO count toward your out-of-pocket maximum.`,
      ['What is a deductible?', 'What is an out-of-pocket maximum?', 'What is the difference between HMO and PPO?', 'What is coinsurance?']
    )
  }

  if (match(msg, ['cheapest way to fix', 'affordable dental', 'cheap dental', 'dental school', 'low cost dental'])) {
    return reply(
      `**Most affordable ways to fix dental problems:**\n\n**1. Dental schools** — 50–70% cheaper, supervised by licensed dentists\n• Find one at ada.org/dental-schools\n• Wait times can be longer but quality is good\n\n**2. Community health centers (FQHCs)** — sliding-scale fees based on income, sometimes free\n• Find one at findahealthcenter.hrsa.gov\n\n**3. Dental discount plans** — $100–$200/year membership, 20–50% off at member dentists\n• DentalPlans.com, Careington, Delta Dental discount plan\n\n**4. Negotiate directly** — ask dental offices for a cash-pay discount (often 10–30% off)\n\n**5. Prioritize extractions over implants** — if budget is very tight, an extraction ($150–$400) may be the immediate fix vs. an implant ($3,000–$5,000)\n\n**6. Apply for Medicaid** — covers emergency dental in most states, plus more comprehensive care in expansion states`,
      ['Does Medicaid cover dental?', 'What is a dental discount plan?', 'How much does a dental implant cost?', 'How do I find a dental school near me?']
    )
  }

  if (match(msg, ['what is prior authorization', 'how does prior auth work', 'what is pre-auth', 'what is pa required'])) {
    return reply(
      `**What is prior authorization?**\n\nPrior authorization (PA) is advance approval from your insurance company before receiving certain services, tests, or medications.\n\n**Commonly requires PA:**\n• MRI and CT scans\n• Specialist procedures\n• Brand-name medications (especially biologics)\n• Elective surgeries\n• Mental health inpatient stays\n• Durable medical equipment\n\n**How it works:**\n1. Your doctor submits a PA request with medical necessity documentation\n2. Insurer reviews — typically 1–3 business days (urgent = 24–72 hrs)\n3. Approved, denied, or modified\n\n**If denied:**\n• Your doctor can request a peer-to-peer review (doctor speaks directly to insurance medical director) — reverses ~40% of denials\n• You can file a formal appeal\n\n⚠️ If you receive care without required PA, you may owe the full cost — always check first.`,
      ['What happens if prior auth is denied?', 'What is a peer-to-peer review?', 'How do I appeal a denied claim?', 'What is medical necessity?']
    )
  }

  if (match(msg, ['what is the no surprises act', 'no surprises', 'surprise bill law', 'surprise billing law'])) {
    return reply(
      `**The No Surprises Act (effective January 2022)**\n\nThis law protects you from unexpected out-of-network bills in specific situations:\n\n**Protected situations:**\n• Out-of-network ER providers — even at an in-network hospital\n• Out-of-network specialists (anesthesiologists, radiologists, pathologists) at an in-network facility\n• Air ambulance services\n\n**How protection works:**\nYou pay only your in-network cost-sharing (copay/coinsurance). The provider and insurer resolve the difference through arbitration — you're not involved.\n\n**NOT protected:**\n• Ground ambulance (legislation pending)\n• Knowingly choosing an out-of-network provider\n• Services at a facility you chose that's out-of-network\n\n**If you get a surprise bill:**\n1. File a complaint at cms.gov/nosurprises\n2. Contact your state insurance commissioner\n3. Dispute through your insurer (120-day window)\n\n💡 Always ask before any procedure: "Are all providers — including the anesthesiologist — in-network?"`,
      ['Is my anesthesiologist covered under No Surprises Act?', 'What is balance billing?', 'How do I dispute a surprise bill?', 'What does in-network mean?']
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. GENERAL TOPIC HANDLERS — Cost info and explanations
  // ═══════════════════════════════════════════════════════════════════════════

  // PHARMACY
  if (match(msg, ['goodrx', 'good rx', 'pharmacy discount', 'prescription discount', 'drug discount', 'prescription savings'])) {
    return reply(
      `**GoodRx** can cut prescription costs by 40–80% — often cheaper than using insurance.\n\n**How to use it:**\n• Go to GoodRx.com or download the free app\n• Search your drug name and dosage\n• Pick the cheapest nearby pharmacy\n• Show the coupon at the counter — no insurance card needed\n\n**Best for:** Generics, drugs not on your formulary, high-deductible plans, uninsured patients.\n\n💡 **Cost Plus Drugs** (costplusdrugs.com) by Mark Cuban offers even lower prices on 1,000+ generics — some as low as $3–$10/month.`,
      ['How do generic drugs compare to brand name?', 'What are patient assistance programs?', 'What is a drug formulary?', 'How do I save on insulin?']
    )
  }

  if (match(msg, ['generic drug', 'generic medication', 'brand name', 'name brand drug', 'switch to generic'])) {
    return reply(
      `**Generic vs. brand-name drugs**\n\nGenerics are FDA-approved to be chemically identical to brand-name drugs — same active ingredient, same dosage, same effect.\n\n**Cost difference:**\n• Brand name: $100–$500+/month\n• Generic: $4–$40/month\n\n**How to switch:**\n• Ask your doctor: "Is there a generic available?"\n• Ask the pharmacist to substitute automatically\n• Check your formulary — generics are Tier 1 (lowest copay)\n\n💡 Walmart, Costco, and Target offer generic lists starting at $4 for a 30-day supply.`,
      ['What is GoodRx?', 'What is a drug formulary?', 'What are patient assistance programs?', 'How do I save on insulin?']
    )
  }

  if (match(msg, ['patient assistance', 'manufacturer coupon', 'copay card', 'drug assistance', 'free medication', 'pap program', 'needymeds', 'rxassist'])) {
    return reply(
      `**Patient Assistance Programs (PAPs)** can get you brand-name drugs free or near-free.\n\n**Programs to check:**\n• NeedyMeds.org — largest free database of PAPs\n• RxAssist.org — searchable PAP directory\n• Manufacturer websites (Pfizer RxPathways, Lilly Cares, AstraZeneca AZ&Me)\n• Manufacturer copay cards — reduce brand copays to $0–$10/month\n\n**Who qualifies:** Usually uninsured/underinsured, or income under 400% of federal poverty level.\n\n💡 Ask your doctor's office — many have social workers who handle PAP enrollment for patients.`,
      ['What is GoodRx?', 'How do generic drugs save money?', 'What is Medicare Part D?', 'What is a formulary?']
    )
  }

  if (match(msg, ['insulin', 'diabetes medication', 'ozempic', 'metformin', 'glp-1', 'wegovy', 'mounjaro'])) {
    return reply(
      `**Diabetes medication costs:**\n\n• Metformin (generic): $4–$10/month\n• Insulin (OTC): Walmart's ReliOn insulin ~$25/vial without prescription\n• Ozempic / Wegovy: $900–$1,000/month — check manufacturer savings cards\n• Mounjaro: $1,000+/month — Eli Lilly savings program brings it to $25–$150/month\n\n**Ways to save:**\n• GoodRx for generics\n• Manufacturer PAP programs for brand-name GLP-1s\n• Cost Plus Drugs for metformin, glipizide\n• Ask doctor for samples\n• 90-day mail-order supply (25% cheaper)\n\n💡 Medicare Part D caps insulin at $35/month (Inflation Reduction Act, 2023).`,
      ['What is GoodRx?', 'What are patient assistance programs?', 'What does Medicare cover for diabetes?', 'What is an A1c test?']
    )
  }

  if (match(msg, ['mail order', 'mail-order pharmacy', '90 day supply', '90-day supply'])) {
    return reply(
      `**Mail-order pharmacy** offers a 90-day supply for the price of a 60-day — saving ~25–33% on maintenance medications.\n\n**Best for:** Long-term medications (blood pressure, cholesterol, diabetes, thyroid, antidepressants).\n\n**How to set up:**\n1. Call member services on your insurance card — ask for their mail-order pharmacy\n2. Ask your doctor to write a 90-day prescription\n3. First fill takes 7–10 days — set up auto-refill after\n\n💡 CVS Caremark, Express Scripts, and OptumRx are the big three. Some plans require mail-order for maintenance drugs after 2–3 retail fills.`,
      ['What is GoodRx?', 'How do generic drugs save money?', 'What is a drug formulary?', 'What are patient assistance programs?']
    )
  }

  if (match(msg, ['formulary', 'drug list', 'tier 1', 'tier 2', 'tier 3', 'drug tier'])) {
    return reply(
      `**Drug formulary tiers** — your insurance's covered drug list:\n\n• Tier 1 — Generic: $0–$20 copay\n• Tier 2 — Preferred brand: $30–$60 copay\n• Tier 3 — Non-preferred brand: $60–$100 copay\n• Tier 4 — Specialty drugs: $100–$500 or 20–33% coinsurance\n\n**If your drug isn't on the formulary:**\n1. Ask your doctor for a "formulary exception" with a medical necessity letter\n2. Ask for a therapeutic alternative on a lower tier\n3. Use GoodRx — sometimes cheaper than your insurance copay\n\n💡 Formularies change every year. Always check at open enrollment.`,
      ['What is GoodRx?', 'How do I appeal a denied drug?', 'What is prior authorization?', 'What are patient assistance programs?']
    )
  }

  // DENTAL COSTS
  if (match(msg, ['tooth', 'dental', 'root canal', 'extraction', 'implant', 'cavity', 'crown', 'oral surgery', 'dentist', 'teeth'])) {
    return reply(
      `**Dental procedure costs (without insurance):**\n\n• Routine cleaning: $75–$200\n• X-rays (full mouth): $100–$250\n• Filling: $150–$300 per tooth\n• Root canal (front tooth): $700–$1,200\n• Root canal (molar): $1,000–$1,800\n• Dental crown: $1,000–$1,800\n• Tooth extraction (simple): $150–$400\n• Wisdom tooth removal (surgical): $350–$800 per tooth\n• Dental implant: $3,000–$5,000 per tooth\n\n**With dental insurance:** 100% on cleanings, 80% on fillings, 50% on major work — after a ~$50–$100 deductible.\n\n💡 Dental schools offer the same procedures at 50–70% off. Search ada.org for accredited schools near you.`,
      ['Is dental covered by my health insurance?', 'What is a dental crown?', 'What is a root canal?', 'What is the cheapest way to fix a broken tooth?']
    )
  }

  // VISION
  if (match(msg, ['eye', 'vision', 'glasses', 'contacts', 'lasik', 'cataract', 'optometrist', 'ophthalmologist'])) {
    return reply(
      `**Vision care costs:**\n\n• Eye exam: $100–$200 (often free with vision insurance)\n• Glasses (frames + lenses): $200–$600 retail; Zenni.com: $10–$50 online\n• Contact lenses: $200–$700/year\n• LASIK: $2,000–$3,000 per eye (not covered by insurance, but FSA/HSA eligible)\n• Cataract surgery: $3,000–$5,000 per eye (covered by Medicare Part B)\n\n**With vision insurance:** Typically covers one exam + one pair of glasses or contacts per year.\n\n💡 Costco Optical and 1-800-Contacts often have significantly lower prices than retail chains.`,
      ['Is LASIK covered by insurance?', 'Can I use HSA for glasses?', 'What does vision insurance cover?', 'What does Medicare cover for eye care?']
    )
  }

  // MRI COSTS
  if (match(msg, ['mri', 'magnetic resonance'])) {
    return reply(
      `**MRI costs by body part:**\n\n• Brain MRI: $400–$3,500\n• Spine MRI: $500–$3,000\n• Knee MRI: $700–$2,800\n• Abdominal MRI: $500–$3,500\n• With contrast dye: add $200–$500\n\n**With insurance:** Typically $100–$500 out-of-pocket after deductible and coinsurance.\n\n💡 Outpatient imaging centers (RadNet, SimonMed) charge 50–75% less than hospital radiology — same quality scanner. Always ask for a referral to a freestanding imaging center.`,
      ['Am I covered for an MRI?', 'What is the difference between MRI and CT scan?', 'What is contrast dye?', 'Do I need prior authorization for an MRI?']
    )
  }

  // CT SCAN COSTS
  if (match(msg, ['ct scan', 'cat scan', 'computed tomography'])) {
    return reply(
      `**CT scan costs by body area:**\n\n• Head/brain CT: $300–$1,800\n• Chest CT: $400–$2,500\n• Abdomen + pelvis CT: $500–$3,000\n• With contrast: add $200–$500\n\n**With insurance:** Typically $100–$400 after deductible.\n\n**CT vs MRI:** CT is faster, cheaper, better for emergencies and bone. MRI has no radiation and better soft tissue detail.\n\n💡 Ask your doctor if an X-ray could answer the same question — it's 5–10x cheaper.`,
      ['What is the difference between MRI and CT?', 'Am I covered for a CT scan?', 'What is contrast dye?', 'How much does an MRI cost?']
    )
  }

  // X-RAY
  if (match(msg, ['x-ray', 'xray', 'radiograph'])) {
    return reply(
      `**X-ray costs by body part:**\n\n• Chest X-ray (2 views): $100–$400\n• Hand or wrist: $100–$200\n• Knee: $150–$300\n• Lumbar spine: $200–$500\n\n**With insurance:** Usually just your copay ($20–$50 in-network).\n\n💡 Urgent care X-rays cost $100–$150 total — much cheaper than hospital radiology ($400+) for the same image.`,
      ['What is the difference between X-ray and MRI?', 'What is CPT code 71046?', 'Is an X-ray covered by insurance?', 'How much does an urgent care visit cost?']
    )
  }

  // ULTRASOUND
  if (match(msg, ['ultrasound', 'sonogram'])) {
    return reply(
      `**Ultrasound costs:**\n\n• Abdominal ultrasound: $200–$900\n• Pelvic ultrasound: $200–$800\n• Pregnancy ultrasound: $200–$500 (usually covered by insurance)\n• Echocardiogram (heart): $1,000–$3,000\n\n**With insurance:** Typically a copay or 20% coinsurance after deductible. Pregnancy ultrasounds are covered as prenatal care.\n\n💡 Ultrasound uses sound waves — zero radiation, which is why it's preferred in pregnancy.`,
      ['Is an ultrasound covered during pregnancy?', 'What is an echocardiogram?', 'How much does a heart echo cost?', 'What does CPT 76700 mean?']
    )
  }

  // SURGERY COSTS
  if (match(msg, ['appendectomy', 'appendix', 'appendicitis'])) {
    return reply(
      `**Appendectomy costs:**\n\n• Laparoscopic: $10,000–$35,000\n• Open surgery: $15,000–$40,000\n• Hospital stay (1–3 days): $3,000–$12,000/day additional\n\n**With insurance:** Deductible + coinsurance — typically $1,500–$5,000 out-of-pocket. Emergency surgery almost always hits your out-of-pocket maximum.\n\n💡 Focus on financial assistance after the fact — most nonprofit hospitals have charity care programs that can reduce or forgive the bill.`,
      ['How do I apply for hospital financial assistance?', 'What is an out-of-pocket maximum?', 'Is emergency surgery covered by insurance?', 'How do I dispute a hospital bill?']
    )
  }

  if (match(msg, ['knee', 'hip', 'replacement', 'arthroplasty', 'joint replacement'])) {
    return reply(
      `**Joint replacement costs:**\n\n• Knee replacement: $25,000–$55,000 total\n• Hip replacement: $25,000–$50,000 total\n• Outpatient surgery center: 30–40% cheaper than hospital\n\n**With insurance:**\n• Deductible + coinsurance: typically $3,000–$8,000 out-of-pocket\n• Usually hits your out-of-pocket maximum\n• Always get prior authorization — your surgeon's office handles this\n\n💡 Confirm that both your surgeon AND the facility are in-network. Anesthesia is billed separately — verify the anesthesiologist is also in-network.`,
      ['Is knee replacement covered by insurance?', 'What is prior authorization?', 'Does anesthesia bill separately?', 'What is an out-of-pocket maximum?']
    )
  }

  // CARDIAC
  if (match(msg, ['heart attack', 'cardiac arrest', 'stent', 'bypass', 'cabg', 'angioplasty', 'heart surgery'])) {
    return reply(
      `**Cardiac procedure costs:**\n\n• Heart attack hospitalization (3–5 days): $35,000–$100,000\n• Cardiac catheterization: $7,000–$15,000\n• Coronary stent: $20,000–$50,000\n• Bypass surgery (CABG): $50,000–$150,000\n• Pacemaker implant: $25,000–$50,000\n\n**With insurance:** These almost always hit your out-of-pocket maximum. After that, insurance covers 100%.\n\n💡 After a heart attack, cardiac rehabilitation is covered by Medicare and most insurance — it significantly reduces re-hospitalization rates.`,
      ['What is an out-of-pocket maximum?', 'What does Medicare cover for heart care?', 'How do I dispute a hospital bill?', 'What is cardiac rehabilitation?']
    )
  }

  if (match(msg, ['ekg', 'ecg', 'electrocardiogram', 'echocardiogram', 'heart rhythm'])) {
    return reply(
      `**Cardiac test costs:**\n\n• EKG (12-lead): $50–$350 (CPT 93000)\n• Echocardiogram: $1,000–$3,500 (CPT 93306)\n• Stress test: $200–$1,500 (CPT 93015)\n• Holter monitor (24–48hr): $200–$500\n• Cardiac catheterization: $7,000–$15,000 (CPT 93458)\n\n**With insurance:** Usually 80–100% covered after deductible for diagnostics ordered by your cardiologist.`,
      ['What is an echocardiogram?', 'What does CPT 93306 mean?', 'How much does a cardiologist visit cost?', 'Am I covered for cardiac tests?']
    )
  }

  // MENTAL HEALTH
  if (match(msg, ['therapy', 'therapist', 'psychotherapy', 'psychiatrist', 'counseling', 'mental health'])) {
    return reply(
      `**Mental health care costs:**\n\n• Therapist/psychologist session (50 min): $100–$300\n• Psychiatrist (medication management): $200–$500\n• Telehealth therapy (BetterHelp, Talkspace): $60–$100/week\n• Inpatient psychiatric: $1,200–$2,000/day\n\n**With insurance:** The Mental Health Parity Act requires equal coverage. Typical copay: $20–$60 per session.\n\n💡 Open Path Collective connects people to therapists at $30–$80/session. Community mental health centers offer sliding-scale fees sometimes as low as $0.`,
      ['Is therapy covered by my insurance?', 'How do I find an in-network therapist?', 'What is telehealth therapy?', 'What is the Mental Health Parity Act?']
    )
  }

  // PHYSICAL THERAPY
  if (match(msg, ['physical therapy', 'physiotherapy', 'occupational therapy', 'pt session'])) {
    return reply(
      `**Physical therapy costs:**\n\n• Initial evaluation: $150–$350 (CPT 97162)\n• Follow-up session: $100–$300\n• Typical course: 12–20 sessions\n\n**With insurance:** $30–$60 copay or 20% coinsurance. Most plans limit to 20–60 visits/year.\n\n💡 In many states (Direct Access laws) you can see a PT without a doctor's referral — saves you a PCP visit copay.`,
      ['Is physical therapy covered by insurance?', 'How many PT sessions does insurance cover?', 'What is occupational therapy?', 'Is PT covered after surgery?']
    )
  }

  // CANCER
  if (match(msg, ['cancer', 'chemotherapy', 'chemo', 'radiation therapy', 'oncology', 'immunotherapy'])) {
    return reply(
      `**Cancer treatment costs:**\n\n• Chemotherapy per cycle: $1,000–$12,000+\n• Radiation (full course): $10,000–$50,000\n• Immunotherapy per infusion: $5,000–$30,000\n• Targeted therapy (oral): $5,000–$20,000/month\n• Bone marrow transplant: $300,000–$800,000\n\n**With insurance:** Cancer treatment almost always hits your out-of-pocket maximum. After that, insurance covers 100%.\n\n💡 CancerCare (cancercare.org) offers financial assistance. Most cancer centers have dedicated financial navigators — ask at your first appointment.`,
      ['What is an out-of-pocket maximum?', 'What are patient assistance programs for cancer drugs?', 'What does Medicare cover for cancer?', 'How do I apply for financial assistance?']
    )
  }

  // PREGNANCY
  if (match(msg, ['pregnancy', 'prenatal', 'delivery', 'birth', 'labor', 'obgyn', 'ob-gyn', 'maternity', 'c-section', 'cesarean', 'epidural'])) {
    return reply(
      `**Pregnancy and delivery costs:**\n\n• Prenatal care (all visits): $2,000–$4,000\n• Vaginal delivery: $8,000–$15,000\n• C-section: $15,000–$30,000\n• Epidural: $2,000–$5,000 (billed separately!)\n• NICU (per day): $3,000–$10,000+\n• Newborn's first exam: $300–$600\n\n**With insurance:** Maternity and newborn care are ACA essential benefits — covered after deductible + coinsurance.\n\n💡 Watch for surprise bills from the anesthesiologist — they often bill separately and may be out-of-network. The No Surprises Act provides some protection.`,
      ['Is an epidural covered by insurance?', 'What is a global OB billing package?', 'Is my baby automatically covered after birth?', 'What is the No Surprises Act?']
    )
  }

  // PEDIATRIC
  if (match(msg, ['child', 'pediatric', 'baby', 'newborn', 'pediatrician', 'well child', 'well-child'])) {
    return reply(
      `**Pediatric care costs:**\n\n• Well-child visits: $100–$350 (FREE with insurance under ACA)\n• Sick visit: $100–$250\n• Vaccines (full schedule): $1,500+ without insurance (FREE with insurance)\n• Ear infection visit: $100–$200\n\n**With insurance:** All well-child visits and CDC-recommended vaccines are covered 100% — no copay, no deductible.\n\n💡 If uninsured: CHIP (Children's Health Insurance Program) covers kids up to age 19 for families earning up to 200–300% of the federal poverty level — often for free or very low cost.`,
      ['What does CHIP cover?', 'What vaccines are free for kids?', 'What is preventive care?', 'How do I add my newborn to insurance?']
    )
  }

  // EMERGENCY ROOM
  if (match(msg, ['emergency', 'er visit', 'emergency room', 'urgent care', 'freestanding er'])) {
    return reply(
      `**ER vs Urgent Care:**\n\n🏥 **Emergency Room:**\n• Facility fee alone: $500–$3,000+\n• Total bill: $1,500–$10,000+ depending on severity\n• With insurance: $100–$1,500 after copay + deductible\n\n🚑 **Urgent Care:**\n• Typical visit: $100–$250 total\n• With insurance: $20–$75 copay\n\n**Use urgent care for:** Cuts, sprains, minor infections, fever, UTIs, rashes.\n**Use ER for:** Chest pain, stroke symptoms, head trauma, severe difficulty breathing, life-threatening issues.\n\n💡 "Freestanding ERs" look like urgent care clinics but bill at full ER rates — check signage carefully before entering.`,
      ['Is the ER covered by my insurance?', 'What is a facility fee?', 'What is surprise billing?', 'How much does an ambulance cost?']
    )
  }

  // AMBULANCE
  if (match(msg, ['ambulance', 'paramedic', 'ems', 'air ambulance', 'medevac'])) {
    return reply(
      `**Ambulance costs:**\n\n• Ground ambulance: $500–$3,000\n• Air ambulance (helicopter): $12,000–$100,000+\n\n**Insurance coverage:**\n• Most plans cover emergency ambulance when medically necessary\n• Air ambulances are now protected under the No Surprises Act\n• Ground ambulances are NOT yet fully protected (pending legislation)\n\n💡 If you receive a large ambulance bill, call and negotiate — many companies will settle for 20–50% of the bill, especially if you're uninsured.`,
      ['What is the No Surprises Act?', 'Is an ambulance covered by insurance?', 'How do I negotiate a medical bill?', 'What does ER insurance cover?']
    )
  }

  // PREVENTIVE CARE
  if (match(msg, ['annual physical', 'yearly checkup', 'preventive', 'wellness visit', 'free physical', 'well visit'])) {
    return reply(
      `**Preventive care — what's free under the ACA:**\n\n✅ Always covered 100% (no copay, no deductible):\n• Annual wellness exam\n• All CDC-recommended vaccines\n• Blood pressure and cholesterol screening\n• Diabetes screening\n• Colorectal cancer screening (colonoscopy) — adults 45+\n• Mammogram — women 40–75\n• Pap smear — women\n• Depression screening\n\n**⚠️ Billing trap:** If your doctor orders extra lab tests during your physical that aren't on the preventive list, those get billed under your deductible. Tell your doctor: "Keep this visit preventive-only."`,
      ['What vaccines are covered for free?', 'Why did I get a bill after my free physical?', 'Is a colonoscopy free?', 'What is a deductible?']
    )
  }

  // VACCINES
  if (match(msg, ['vaccine', 'vaccination', 'flu shot', 'covid vaccine', 'shingles', 'pneumonia shot', 'immunization'])) {
    return reply(
      `**Vaccines — what's covered free:**\n\n✅ Free with insurance (ACA-required):\n• Flu shot (annual)\n• COVID-19 vaccine\n• Shingles (Shingrix) — adults 50+\n• Pneumonia (Prevnar, Pneumovax)\n• HPV — up to age 26\n• Hepatitis A and B\n• Tdap / Tetanus\n• All childhood vaccines on CDC schedule\n\n**Without insurance:** $20–$250 depending on the vaccine. Walgreens, CVS, and local health departments offer most vaccines.\n\n💡 vaccines.gov lists free and low-cost vaccine locations near you.`,
      ['What does preventive care cover?', 'Is the flu shot free with insurance?', 'What vaccines does Medicare cover?', 'Where can I get free vaccines?']
    )
  }

  // TELEHEALTH
  if (match(msg, ['telehealth', 'telemedicine', 'virtual visit', 'video visit', 'online doctor'])) {
    return reply(
      `**Telehealth costs:**\n\n• With insurance: $0–$50 copay (many plans have $0 telehealth since 2020)\n• Without insurance: $50–$150 per visit\n• Direct-pay: Teladoc ($75), MDLive ($82), Amazon Clinic (from $35)\n\n**Best for:** Cold/flu, UTIs, rashes, mental health, prescription refills, follow-ups.\n**Not suitable for:** Chest pain, stroke, severe injuries, physical exam required.\n\n💡 Many employers offer free telehealth through their Employee Assistance Program (EAP) — check your HR benefits page.`,
      ['What is the cost of an urgent care visit?', 'Does my insurance cover telehealth?', 'What is an EAP?', 'Can I get prescriptions through telehealth?']
    )
  }

  // COLONOSCOPY
  if (match(msg, ['colonoscopy', 'colon cancer', 'colorectal', 'cologuard'])) {
    return reply(
      `**Colonoscopy costs:**\n\n• Screening colonoscopy (preventive, age 45+): FREE with insurance — ACA-mandated\n• Diagnostic colonoscopy (if you have symptoms): deductible applies — $500–$1,500 out-of-pocket\n• Without insurance: $1,000–$4,000\n• Cologuard (at-home stool test): $500–$700 — often covered as preventive alternative\n\n**⚠️ Billing trap:** If a polyp is removed during your "free" screening, some insurers reclassify it as diagnostic and apply cost-sharing. Ask your insurer in advance: "Will polyp removal change my cost-sharing?"`,
      ['Is a colonoscopy free with insurance?', 'What is Cologuard?', 'What is the difference between screening and diagnostic?', 'What does CPT 45378 mean?']
    )
  }

  // EOB
  if (match(msg, ['eob', 'explanation of benefits'])) {
    return reply(
      `**EOB (Explanation of Benefits)** is NOT a bill — it's a summary from your insurer after a medical visit.\n\n**What it shows:**\n• What your provider charged\n• The allowed amount (negotiated rate)\n• What insurance paid\n• What YOU owe\n\n**Example:**\nProvider charges: $500 → Allowed: $280 → Insurance pays: $224 → You owe: $56\n\n**Always wait** for the actual bill from your provider before paying.\n\n💡 Compare your EOB to the itemized bill — billing errors affect up to 80% of medical bills. Use the Insurance Decoder tab to decode your EOB.`,
      ['What is an EOB exactly?', 'What are denial codes on an EOB?', 'How do I dispute a charge?', 'What does CO-97 mean?']
    )
  }

  // DENIAL CODES
  if (match(msg, ['co-4', 'co-11', 'co-16', 'co-97', 'co-50', 'pr-1', 'pr-2', 'denial code', 'adjustment code', 'remark code'])) {
    return reply(
      `**Common claim denial codes:**\n\n• **CO-4** — Service inconsistent with diagnosis → ask doctor to resubmit with corrected codes\n• **CO-11** — Diagnosis inconsistent with procedure → verify and resubmit\n• **CO-16** — Claim lacks information → provider must resubmit with complete info\n• **CO-50** — Non-covered service → appeal with medical necessity documentation\n• **CO-97** — Bundled service (included in another code) — often correct, ask for explanation\n• **PR-1** — Deductible not met → correct if you haven't met your deductible\n• **PR-2** — Coinsurance — your required share\n• **PR-96** — Prior authorization not obtained → your provider's responsibility to fix\n\n💡 Use the Insurance Decoder tab to look up any code and generate an appeal letter.`,
      ['How do I appeal a denied claim?', 'What is prior authorization?', 'What is an EOB?', 'What does bundled service mean?']
    )
  }

  // APPEAL
  if (match(msg, ['appeal', 'denied claim', 'claim denied', 'fight my insurance', 'insurance refused'])) {
    return reply(
      `**How to appeal a denied insurance claim:**\n\nAppeals succeed 40–60% of the time — always worth filing.\n\n**Step-by-step:**\n1. Get the denial letter — it must state the specific reason and denial code\n2. Ask your doctor for a **Letter of Medical Necessity**\n3. Gather supporting records (clinical notes, test results, specialist letters)\n4. File within the deadline (usually **180 days** from denial date)\n5. If internal appeal fails → request **external review** (legally required for most plans)\n\n**Peer-to-peer review:** Your doctor calls the insurance medical director directly — reverses ~40% of denials before a formal appeal.\n\n💡 Use the Insurance Decoder tab to generate a pre-filled appeal letter template.`,
      ['What is a Letter of Medical Necessity?', 'What is a peer-to-peer review?', 'What are common denial codes?', 'What is external appeal review?']
    )
  }

  // BILLING ERRORS
  if (match(msg, ['overcharge', 'billing error', 'wrong charge', 'dispute bill', 'negotiate', 'lower my bill', 'reduce my bill', 'itemized bill'])) {
    return reply(
      `**Medical billing errors affect up to 80% of bills. Here's how to fight back:**\n\n1. **Request an itemized bill** — hospitals must provide this by law\n2. **Request your medical records** — verify every charge matches a service you received\n3. **Look for:**\n   • Duplicate charges (same code twice)\n   • Upcoding (higher visit level than documented)\n   • Unbundling (separate billing of normally bundled services)\n   • Services you didn't receive\n4. **Call billing** and reference specific line items\n5. **Ask about charity care** — most nonprofit hospitals must offer financial assistance\n\n💡 Medical billing advocates (fee: 20–35% of savings) can negotiate for you — useful for large bills.`,
      ['How do I get an itemized bill?', 'What is hospital charity care?', 'How do I apply for financial assistance?', 'What is upcoding?']
    )
  }

  // FINANCIAL ASSISTANCE
  if (match(msg, ['financial assistance', 'charity care', 'hardship', "can't afford", 'cannot afford', 'hospital discount'])) {
    return reply(
      `**Hospital financial assistance — what you can get:**\n\nNonprofit hospitals are required by law to have charity care programs:\n\n• Sliding-scale discounts — sometimes free if income <200% federal poverty level\n• Uninsured discount: 30–60% off for not having insurance\n• Interest-free payment plans — always ask\n• Medical debt forgiveness — some hospitals settle for 10–20 cents on the dollar\n\n**How to apply:**\n1. Call hospital billing and say: "I'd like to apply for financial assistance"\n2. Request the charity care application\n3. Submit proof of income (pay stubs or tax return)\n4. Approval usually in 2–4 weeks\n\n💡 Dollar For (dollarfor.org) is a free service that applies for hospital assistance on your behalf — they do the paperwork.`,
      ['How do I negotiate a medical bill?', 'What is a payment plan for medical bills?', 'Can medical debt be forgiven?', 'What is a medical billing advocate?']
    )
  }

  // INSURANCE FUNDAMENTALS
  if (match(msg, ['deductible'])) {
    return reply(
      `**Deductible** = the amount you pay before insurance starts covering costs.\n\nExample: $1,500 deductible\n• You pay first $1,500 of covered care (100%)\n• After $1,500: insurance pays (you pay coinsurance, e.g. 20%)\n• After out-of-pocket max: insurance pays 100%\n\nResets every January 1st. Preventive care (physicals, vaccines) is always free — no deductible.`,
      ['What is coinsurance?', 'What is an out-of-pocket maximum?', 'What is a copay?', 'What is a high-deductible health plan?']
    )
  }

  if (match(msg, ['copay', 'co-pay'])) {
    return reply(
      `**Copay** = a fixed dollar amount you pay at time of service.\n\nTypical copays:\n• Primary care: $20–$40\n• Specialist: $40–$70\n• Urgent care: $50–$100\n• ER: $100–$350\n• Generic prescription: $5–$20\n• Telehealth: $0–$30\n\nCopays count toward your out-of-pocket maximum — but usually NOT toward your deductible.`,
      ['What is a deductible?', 'What is an out-of-pocket maximum?', 'What is the difference between HMO and PPO?', 'What is coinsurance?']
    )
  }

  if (match(msg, ['coinsurance'])) {
    return reply(
      `**Coinsurance** = your percentage share of costs after meeting your deductible.\n\nExample (80/20 plan):\n• Insurance pays: 80%\n• You pay: 20%\n• On a $5,000 bill: you owe $1,000\n\nThis continues until you hit your out-of-pocket maximum — after that, insurance pays 100%.`,
      ['What is an out-of-pocket maximum?', 'What is a deductible?', 'What is a copay?', 'What is a premium?']
    )
  }

  if (match(msg, ['out-of-pocket maximum', 'out of pocket max', 'oop max', 'maximum out of pocket'])) {
    return reply(
      `**Out-of-pocket maximum (OOP max)** = the most you'll pay in a year for covered services. After you hit it, insurance pays 100%.\n\n**2024 ACA limits:**\n• Individual: $9,450\n• Family: $18,900\n\n**What counts:** Deductibles, copays, coinsurance.\n**What does NOT count:** Premiums, out-of-network costs (on some plans).\n\n💡 If facing major surgery or cancer treatment, you'll likely hit your OOP max — plan your cash flow for the year accordingly.`,
      ['What is a deductible?', 'What is coinsurance?', 'What is a premium?', 'What happens after I hit my OOP max?']
    )
  }

  if (match(msg, ['premium', 'monthly premium', 'monthly insurance payment'])) {
    return reply(
      `**Premium** = the monthly amount you pay to keep your insurance active, regardless of whether you use it.\n\n**2024 averages:**\n• Individual employer plan: ~$700/month total (you pay ~$150, employer ~$550)\n• ACA Marketplace individual: $400–$800/month before subsidies\n\nHigher premium → lower deductible. Lower premium → higher deductible.\n\n💡 If income is 100–400% of federal poverty level, ACA subsidies can significantly reduce your premium — sometimes to $0.`,
      ['What is a deductible?', 'What is an HMO vs PPO?', 'What are ACA subsidies?', 'What is a high-deductible health plan?']
    )
  }

  if (match(msg, ['prior authorization', 'prior auth', 'pre-authorization', 'pre-auth', 'pa required'])) {
    return reply(
      `**Prior authorization (PA)** = advance approval required from your insurer before receiving certain services.\n\n**Commonly requires PA:** MRI/CT scans, specialty drugs, elective surgery, mental health inpatient stays.\n\n**How it works:**\n1. Your doctor submits a PA request with medical necessity documentation\n2. Insurer reviews — typically 1–3 business days\n3. Approved, denied, or modified\n\n**If denied:** Your doctor can request a peer-to-peer review (doctor calls insurance medical director) — reverses ~40% of denials.\n\n⚠️ If you receive care without required PA, you may owe the full cost.`,
      ['What happens if PA is denied?', 'What is a peer-to-peer review?', 'How do I appeal a denied claim?', 'What is medical necessity?']
    )
  }

  if (match(msg, ['hmo', 'health maintenance organization'])) {
    return reply(
      `**HMO (Health Maintenance Organization)**\n\n✅ Lower premiums and copays\n✅ Simple structure\n❌ Must choose a primary care physician (PCP)\n❌ Need a referral to see specialists\n❌ Usually no out-of-network coverage (except emergencies)\n\n**Best for:** People with a trusted PCP who rarely need specialists and want lower monthly costs.`,
      ['What is a PPO?', 'Do I need a referral to see a specialist?', 'What is a primary care physician?', 'What is the difference between HMO and PPO?']
    )
  }

  if (match(msg, ['ppo', 'preferred provider organization'])) {
    return reply(
      `**PPO (Preferred Provider Organization)**\n\n✅ See any doctor or specialist — no referral needed\n✅ Some out-of-network coverage\n✅ More flexibility for complex health needs\n❌ Higher premiums than HMO\n❌ More expensive if you go out-of-network\n\n**Best for:** People with complex conditions, frequent specialist visits, or who value flexibility.\n\n💡 Always check that both your doctor AND the facility are in-network — surgeons can be in-network while their hospital is not.`,
      ['What is an HMO?', 'What is in-network vs out-of-network?', 'What is balance billing?', 'What is the No Surprises Act?']
    )
  }

  if (match(msg, ['hsa', 'health savings account', 'fsa', 'flexible spending', 'hdhp', 'high deductible'])) {
    return reply(
      `**HSA vs FSA — tax-advantaged healthcare accounts:**\n\n**HSA (Health Savings Account)** — requires an HDHP plan\n• 2024 limit: $4,150 individual / $8,300 family\n• Triple tax advantage: contributions pre-tax, growth tax-free, withdrawals tax-free for medical\n• Unused funds roll over forever — becomes retirement account at 65\n\n**FSA (Flexible Spending Account)** — available with any plan\n• 2024 limit: $3,050\n• Use-it-or-lose-it (some plans allow $610 rollover)\n• Great for: glasses, dental, copays, prescriptions\n\n💡 HSA is the only triple tax-advantaged account in the US — maximize it if you can handle the higher HDHP deductible.`,
      ['What can I spend my HSA on?', 'Is LASIK eligible for HSA?', 'What is a high-deductible health plan?', 'What is a deductible?']
    )
  }

  if (match(msg, ['cobra', 'lost job', 'lost insurance', 'laid off', 'between jobs', 'leaving job'])) {
    return reply(
      `**COBRA** lets you keep your employer health insurance after leaving a job — but you pay the full premium.\n\n**Typical COBRA cost:** $500–$700/month (individual) or $1,500–$2,000/month (family).\n\n**Better alternatives:**\n• ACA Marketplace — job loss is a qualifying life event (special enrollment). May be cheaper with subsidies\n• Medicaid — if income dropped significantly\n• Spouse's employer plan\n\n💡 You have 60 days to elect COBRA. Coverage is retroactive — you can wait until you have a claim to decide, then pay the back premiums.`,
      ['How do ACA subsidies work?', 'What is Medicaid?', 'What is a qualifying life event?', 'How do I enroll in ACA Marketplace?']
    )
  }

  if (match(msg, ['medicare', 'part a', 'part b', 'part d', 'advantage plan', 'medigap', 'supplement plan'])) {
    return reply(
      `**Medicare overview:**\n\n• **Part A** (Hospital): Free for most. Covers inpatient hospital, skilled nursing, hospice.\n• **Part B** (Medical): ~$174.70/month. Covers doctor visits, outpatient care, preventive services.\n• **Part C** (Medicare Advantage): Bundled A+B through a private insurer — may include dental/vision.\n• **Part D** (Prescriptions): Separate drug plan — premiums vary.\n• **Medigap**: Fills gaps in Original Medicare (deductibles, coinsurance). Plan G is popular.\n\n**2024 key costs:**\n• Part A deductible: $1,632 per benefit period\n• Part B deductible: $240/year → 20% coinsurance after\n\n💡 Medicare Part D caps out-of-pocket drug costs at $2,000/year starting 2025 (IRA).`,
      ['What is Medicare Part D?', 'What is a Medigap plan?', 'When do I enroll in Medicare?', 'What is Medicare Advantage?']
    )
  }

  if (match(msg, ['medicaid', 'chip', 'state insurance', 'low income insurance', 'free insurance'])) {
    return reply(
      `**Medicaid** provides free or very low-cost coverage for low-income individuals and families.\n\n**Who qualifies:**\n• Adults with income under ~138% of federal poverty level (expansion states)\n• Children (CHIP): up to 200–300% FPL depending on state\n• Pregnant women, elderly, disabled individuals\n\n**Coverage:** Doctor visits, hospital, prescriptions, dental, mental health (varies by state).\n\n**Costs:** Often $0 premium, $0–$3 copays.\n\n💡 Apply at HealthCare.gov or your state Medicaid office. Job loss or income drop allows enrollment at any time.`,
      ['What is CHIP for children?', 'Does Medicaid cover dental?', 'How do I apply for Medicaid?', 'What is ACA Marketplace insurance?']
    )
  }

  if (match(msg, ['surprise bill', 'no surprises act', 'balance billing', 'balance bill'])) {
    return reply(
      `**The No Surprises Act (2022)** protects you from unexpected out-of-network bills in specific situations.\n\n✅ **Protected:**\n• Out-of-network ER providers at in-network hospitals\n• Out-of-network anesthesiologists, radiologists, pathologists at in-network facilities\n• Air ambulance services\n\n❌ **NOT protected:**\n• Ground ambulance (pending legislation)\n• Knowingly choosing an out-of-network provider\n\n**If you get a surprise bill:**\n1. Dispute it with your insurer within 120 days\n2. File a complaint at cms.gov/nosurprises\n3. Contact your state insurance commissioner`,
      ['What is balance billing?', 'How do I dispute a surprise bill?', 'Is my anesthesiologist covered?', 'What does in-network mean?']
    )
  }

  if (match(msg, ['blood test', 'blood work', 'lab test', 'cbc', 'metabolic panel', 'lipid panel', 'cholesterol test', 'a1c test'])) {
    return reply(
      `**Common blood test costs:**\n\n• CBC (blood count): $30–$100 (CPT 85025)\n• Comprehensive metabolic panel: $40–$150 (CPT 80053)\n• Lipid panel (cholesterol): $30–$100 (CPT 80061)\n• Hemoglobin A1c (diabetes): $30–$90 (CPT 83036)\n• TSH (thyroid): $40–$100 (CPT 84443)\n\n**With insurance:** Usually free as part of your annual physical. Otherwise, a copay or applied to deductible.\n\n💡 Walk-in labs (LabCorp, Quest) offer self-pay pricing without a doctor's order — often $30–$80. Everlywell offers home blood tests from $50.`,
      ['Are blood tests covered at my annual physical?', 'What does a CBC test for?', 'What is a normal A1c level?', 'How much does a metabolic panel cost?']
    )
  }

  if (match(msg, ['how much', 'cost of', 'price of', 'what does it cost', 'how expensive', 'afford'])) {
    return reply(
      `For a specific cost estimate, use the **Treatment Cost Estimator** tab.\n\nQuick reference (without insurance):\n• Office visit (primary care): $100–$300\n• Specialist visit: $200–$500\n• Urgent care: $100–$250\n• ER visit: $1,000–$5,000+\n• Blood work panel: $100–$400\n• X-ray: $100–$400\n• MRI: $400–$3,500\n• CT scan: $300–$2,500\n• Common outpatient surgery: $5,000–$30,000\n\nWhat specific procedure are you asking about?`,
      ['How much does an MRI cost?', 'What does a specialist visit cost?', 'How much is a colonoscopy?', 'How much does surgery typically cost?']
    )
  }

  if (match(msg, ['insurance', 'coverage', 'in-network', 'out of network'])) {
    return reply(
      `Coverage always depends on your specific plan, but general rules:\n\n• **In-network care:** Cheaper — providers have negotiated rates with your insurer\n• **Out-of-network:** More expensive — may not count toward your deductible\n• **Preventive care:** Always 100% covered (ACA)\n• **Emergency care:** Always covered — even out-of-network ER (No Surprises Act)\n• **Mental health:** Must be covered equally to physical care (parity law)\n\n**Before any procedure, ask:**\n1. Is my provider in-network?\n2. Is the facility in-network?\n3. Is prior authorization required?\n4. What is my deductible balance?`,
      ['What is in-network vs out-of-network?', 'What is prior authorization?', 'What is the difference between HMO and PPO?', 'What does my insurance cover?']
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. CPT / ICD-10 CODE LOOKUP
  // ═══════════════════════════════════════════════════════════════════════════

  const codeMatch = message.trim().match(/\b([A-Z]\d{2}\.?\d*[A-Z]?\d?|[A-Z]\d{3,5}|[89][0-9]{4}|[0-9]{5})\b/i)
  if (codeMatch) {
    const entry = lookupCode(codeMatch[1])
    if (entry) {
      const costLine = entry.cost_range ? `\n💰 Typical cost: ${entry.cost_range}` : ''
      const catLine  = entry.category   ? `\n📂 Category: ${entry.category}`        : ''
      return reply(
        `**${typeLabel(entry.type)}: ${entry.code}**\n\n**${entry.title}**\n\n${entry.description}${costLine}${catLine}\n\nFor more details and related codes, try the **Code Search** tab.`,
        ['What is a related procedure?', 'How much does this cost with insurance?', 'What diagnosis codes relate to this?', 'What does this look like on a bill?']
      )
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. VECTOR SEARCH FALLBACK
  // ═══════════════════════════════════════════════════════════════════════════

  const vectorResults = search(message, { topK: 3, minScore: 0.07 })
  if (vectorResults.length > 0) {
    const top = vectorResults[0]
    const costLine = top.cost_range ? `\n💰 Typical cost: ${top.cost_range}` : ''
    let content = `**${top.title}**\n\n${top.description}${costLine}`
    if (vectorResults.length > 1) {
      content += '\n\n**Related topics:**'
      vectorResults.slice(1).forEach(r => {
        content += `\n• ${r.title}${r.cost_range ? ' — ' + r.cost_range : ''}`
      })
    }
    content += '\n\nFor a detailed search, try the **Code Search** tab.'
    return reply(content, [
      'How much does this cost with insurance?',
      'Is this covered by insurance?',
      'What is a related procedure?',
      'What CPT code is this billed under?',
    ])
  }

  return reply(
    `I can help with:\n• **Procedure costs** — "how much does a knee replacement cost?"\n• **Coverage questions** — "am I covered for an MRI?"\n• **Prescription savings** — "how do I save on my medication?"\n• **Insurance terms** — "what is a deductible?"\n• **CPT or ICD-10 codes** — just type the code (e.g. 99213 or I10)\n• **Denied claims** — "how do I appeal a denied claim?"\n\nWhat would you like to know?`,
    ['How much does an MRI cost?', 'Am I covered for an MRI?', 'What is a deductible?', 'How do I appeal a denied claim?']
  )
}

function reply(content, suggestions = []) {
  return { content, suggestions }
}

function match(msg, keywords) {
  return keywords.some(k => msg.includes(k))
}
