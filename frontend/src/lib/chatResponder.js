import { search, lookupCode, typeLabel } from './vectorSearch.js'

/**
 * Returns { content: string, suggestions: string[] }
 * content    — the AI reply text
 * suggestions — 3–4 contextual follow-up chips shown after the message
 */
export function getResponse(message) {
  const msg = message.toLowerCase()

  // ─── PHARMACY & DRUG SAVINGS ────────────────────────────────────────────────
  if (match(msg, ['goodrx', 'good rx', 'pharmacy discount', 'prescription discount', 'drug discount', 'prescription savings'])) {
    return reply(
      `GoodRx can cut prescription costs by 40–80% — often cheaper than using insurance.\n\nHow to use it:\n• Go to GoodRx.com or download the app (free)\n• Search your drug and dosage\n• Pick the cheapest nearby pharmacy\n• Show the coupon at the counter — no insurance card needed\n\nBest for: generics, drugs not on your formulary, high-deductible plans, or uninsured.\n\n💡 Tip: Cost Plus Drugs (costplusdrugs.com) by Mark Cuban offers even lower prices on 1,000+ generics — some as low as $3–$10 per month.`,
      ['How do generic drugs compare to brand name?', 'What are patient assistance programs?', 'What is a drug formulary?', 'How do I save on insulin?']
    )
  }

  if (match(msg, ['generic', 'brand name', 'brand-name', 'name brand drug'])) {
    return reply(
      `Generic drugs are chemically identical to brand-name drugs — same active ingredient, same dosage, same effect. The FDA requires they work the same way.\n\nCost difference:\n• Brand name: $100–$500+/month\n• Generic equivalent: $4–$40/month\n\nHow to switch:\n• Ask your doctor "Is there a generic available?"\n• Ask the pharmacist to substitute automatically\n• Check if your formulary gives Tier 1 (lowest copay) to the generic\n\n💡 Stores like Walmart, Costco, and Target offer generic lists starting at $4 for a 30-day supply.`,
      ['What is GoodRx?', 'What is a drug formulary?', 'What are patient assistance programs?', 'How do I read my prescription label?']
    )
  }

  if (match(msg, ['patient assistance', 'manufacturer coupon', 'copay card', 'drug assistance', 'free medication', 'rx assist', 'needymeds', 'pap program'])) {
    return reply(
      `Patient Assistance Programs (PAPs) can get you brand-name drugs free or near-free if you qualify.\n\n**Programs to check:**\n• NeedyMeds.org — largest free database of drug assistance programs\n• RxAssist.org — searchable PAP database\n• Manufacturer websites — most big pharma companies have PAPs (e.g., Pfizer RxPathways, Lilly Cares, AstraZeneca AZ&Me)\n• Manufacturer copay cards — can reduce brand-name copays to $0–$10/month (income limits may apply)\n\n**Who qualifies:** Usually uninsured, underinsured, or income under 400% of the federal poverty level.\n\n💡 Ask your doctor's office — many have social workers who handle PAP enrollment for patients.`,
      ['What is GoodRx?', 'How do generic drugs save money?', 'What is Medicare Part D?', 'How do I appeal a denied prescription?']
    )
  }

  if (match(msg, ['insulin', 'diabetes medication', 'ozempic', 'metformin', 'glp-1', 'wegovy', 'mounjaro'])) {
    return reply(
      `Diabetes medication costs vary widely:\n\n• Metformin (generic): $4–$10/month at most pharmacies\n• Insulin (generic/OTC): Walmart sells ReliOn insulin for ~$25/vial without prescription\n• Ozempic/Wegovy: $900–$1,000/month list price — check manufacturer savings cards\n• Mounjaro: $1,000+/month — Eli Lilly has a savings program (~$25–$150/month with card)\n\n**Ways to save:**\n• GoodRx for generics\n• Manufacturer PAP programs for brand-name GLP-1s\n• Mark Cuban's Cost Plus Drugs for metformin, glipizide, etc.\n• Ask doctor for samples\n• 90-day mail-order supply (usually 25% cheaper)\n\n💡 The Inflation Reduction Act caps Medicare insulin at $35/month.`,
      ['What is GoodRx?', 'What are patient assistance programs?', 'How do I save on prescriptions?', 'What does Medicare cover for diabetes?']
    )
  }

  if (match(msg, ['mail order', 'mail-order pharmacy', '90 day supply', '90-day'])) {
    return reply(
      `Mail-order pharmacies (usually through your insurance) offer a 90-day supply for the price of a 60-day supply — saving ~25–33% on maintenance medications.\n\nBest for: long-term medications (blood pressure, cholesterol, diabetes, thyroid, antidepressants).\n\nHow to set up:\n1. Call the number on your insurance card and ask for the mail-order pharmacy\n2. Ask your doctor to write a 90-day prescription\n3. First fill usually takes 7–10 days; set up auto-refill after\n\n💡 CVS Caremark, Express Scripts, and OptumRx are the big three. Some plans require mail-order for maintenance drugs after 2–3 fills.`,
      ['What is GoodRx?', 'How do generic drugs save money?', 'What is a drug formulary?', 'How much does blood pressure medication cost?']
    )
  }

  if (match(msg, ['formulary', 'drug list', 'tier 1', 'tier 2', 'tier 3', 'drug tier'])) {
    return reply(
      `A formulary is your insurance plan's list of covered drugs, organized into tiers:\n\n• Tier 1 — Generic drugs: $0–$20 copay\n• Tier 2 — Preferred brand: $30–$60 copay\n• Tier 3 — Non-preferred brand: $60–$100 copay\n• Tier 4 — Specialty drugs: $100–$500 copay or 20–33% coinsurance\n\nIf your drug isn't on the formulary:\n1. Ask your doctor for a "formulary exception" — medical necessity letter\n2. Ask for a therapeutic alternative on a lower tier\n3. Use GoodRx — sometimes cheaper than your insurance copay\n\n💡 Formularies change every year. Always check your plan's formulary at open enrollment.`,
      ['What is GoodRx?', 'How do I appeal a denied drug?', 'What is a prior authorization?', 'What are patient assistance programs?']
    )
  }

  // ─── DENTAL ─────────────────────────────────────────────────────────────────
  if (match(msg, ['tooth', 'dental', 'root canal', 'extraction', 'implant', 'cavity', 'crown', 'oral surgery', 'dentist', 'teeth'])) {
    return reply(
      `Dental procedure costs (without insurance):\n• Routine cleaning: $75–$200\n• X-rays (full mouth): $100–$250\n• Filling: $150–$300 per tooth\n• Root canal (front tooth): $700–$1,200\n• Root canal (molar): $1,000–$1,800\n• Dental crown: $1,000–$1,800\n• Tooth extraction (simple): $150–$400\n• Oral surgery / impacted wisdom tooth: $350–$800 per tooth\n• Dental implant: $3,000–$5,000 per tooth\n\nWith dental insurance: typically 100% on cleanings, 80% on fillings, 50% on major work — after a deductible (~$50–$100).\n\n💡 Dental schools offer the same procedures at 50–70% off. Look up your nearest accredited dental school.`,
      ['Does medical insurance cover dental?', 'What is a dental crown?', 'How much does a dental implant cost?', 'What is the cheapest way to fix a broken tooth?']
    )
  }

  // ─── VISION ─────────────────────────────────────────────────────────────────
  if (match(msg, ['eye', 'vision', 'glasses', 'contacts', 'lasik', 'cataract', 'optometrist', 'ophthalmologist'])) {
    return reply(
      `Vision care costs:\n• Eye exam: $100–$200 (often free with vision insurance)\n• Glasses frames + lenses: $200–$600 (Zenni.com: $10–$50 online)\n• Contact lenses: $200–$700/year\n• LASIK: $2,000–$3,000 per eye (not covered by insurance, but FSA/HSA eligible)\n• Cataract surgery: $3,000–$5,000 per eye (covered by Medicare Part B after deductible)\n• Glaucoma treatment: varies widely\n\n💡 1-800-Contacts and Costco Optical often beat retail prices significantly. Vision plans typically cover one exam + one pair of glasses or contacts per year.`,
      ['What does vision insurance cover?', 'Is LASIK covered by insurance?', 'Can I use HSA for glasses?', 'What is covered under Medicare for eye care?']
    )
  }

  // ─── MRI ────────────────────────────────────────────────────────────────────
  if (match(msg, ['mri', 'magnetic resonance'])) {
    return reply(
      `MRI costs vary widely by body part and facility:\n• Brain MRI: $400–$3,500\n• Spine MRI: $500–$3,000\n• Knee MRI: $700–$2,800\n• Abdominal MRI: $500–$3,500\n• With contrast dye: add $200–$500\n\nWith insurance: typically $100–$500 after deductible + coinsurance.\n\n💡 Outpatient imaging centers (RadNet, SimonMed) charge 50–75% less than hospital radiology. Always ask for a referral to a freestanding imaging center — same scanner, dramatically lower price.`,
      ['What is the difference between MRI and CT scan?', 'Will my insurance pre-approve an MRI?', 'What is contrast dye used for?', 'How do I find cheap imaging near me?']
    )
  }

  // ─── CT SCAN ────────────────────────────────────────────────────────────────
  if (match(msg, ['ct scan', 'cat scan', 'computed tomography'])) {
    return reply(
      `CT scan costs by body area:\n• Head/Brain CT: $300–$1,800\n• Chest CT: $400–$2,500\n• Abdomen + Pelvis CT: $500–$3,000\n• With contrast: add $200–$500\n\nWith insurance: typically $100–$400 after deductible.\n\nCT vs MRI: CT is faster (5 min vs 30–60 min), cheaper, uses radiation, and better for bone/trauma. MRI has no radiation and gives better soft tissue detail.\n\n💡 Ask your doctor if an X-ray could answer the same question — it's 5–10x cheaper and no less appropriate for many situations.`,
      ['What is the difference between MRI and CT scan?', 'How much does an X-ray cost?', 'What is contrast dye?', 'What does CPT 74177 mean?']
    )
  }

  // ─── X-RAY ──────────────────────────────────────────────────────────────────
  if (match(msg, ['x-ray', 'xray', 'radiograph'])) {
    return reply(
      `X-ray costs by body part:\n• Chest X-ray (2 views): $100–$400\n• Hand or wrist: $100–$200\n• Knee: $150–$300\n• Spine (lumbar): $200–$500\n• Full dental X-rays: $100–$250\n\nWith insurance: usually just your copay ($20–$50 for in-network).\n\n💡 Urgent care X-rays are much cheaper than hospital radiology — typically $100–$150 total vs. $400+ at a hospital.`,
      ['What is the difference between X-ray and MRI?', 'What is CPT code 71046?', 'Is an X-ray covered by my insurance?', 'How much does an urgent care visit cost?']
    )
  }

  // ─── ULTRASOUND ─────────────────────────────────────────────────────────────
  if (match(msg, ['ultrasound', 'sonogram', 'echo'])) {
    return reply(
      `Ultrasound costs:\n• Abdominal ultrasound: $200–$900\n• Pelvic ultrasound: $200–$800\n• Pregnancy ultrasound: $200–$500 (usually covered by insurance)\n• Echocardiogram (heart ultrasound): $1,000–$3,000\n• Carotid artery ultrasound: $300–$800\n\nWith insurance: typically a copay or 20% coinsurance after deductible.\n\n💡 Ultrasound uses sound waves — no radiation, which is why it's preferred in pregnancy and for children.`,
      ['What is an echocardiogram?', 'Is ultrasound covered during pregnancy?', 'How much does a heart echo cost?', 'What does CPT 76700 mean?']
    )
  }

  // ─── SURGERY TYPES ──────────────────────────────────────────────────────────
  if (match(msg, ['appendectomy', 'appendix', 'appendicitis'])) {
    return reply(
      `Appendectomy costs:\n• Laparoscopic (minimally invasive): $10,000–$35,000\n• Open surgery: $15,000–$40,000\n• Hospital stay (1–3 days): adds $3,000–$12,000/day\n\nWith insurance: deductible + coinsurance (typically $1,500–$5,000 out-of-pocket).\n\n💡 This is an emergency procedure — you usually can't shop around. Focus on appealing if denied, and ask about financial assistance programs at the hospital.`,
      ['How do I appeal a denied surgery claim?', 'What is a facility fee?', 'Does anesthesia bill separately?', 'How do I apply for hospital financial assistance?']
    )
  }

  if (match(msg, ['gallbladder', 'cholecystectomy', 'gallstone'])) {
    return reply(
      `Gallbladder removal (cholecystectomy) costs:\n• Laparoscopic: $8,000–$25,000\n• Open surgery: $12,000–$30,000\n• Outpatient surgery center: typically 40–60% cheaper than hospital\n\nWith insurance: $1,000–$5,000 out-of-pocket depending on deductible and coinsurance.\n\n💡 If non-emergency, ask about having it done at an ambulatory surgical center (ASC) — same procedure, much lower facility fee.`,
      ['What is a facility fee?', 'How much does anesthesia cost?', 'What is an ambulatory surgery center?', 'How do I compare surgery costs?']
    )
  }

  if (match(msg, ['hernia', 'hernia repair'])) {
    return reply(
      `Hernia repair costs:\n• Inguinal hernia (laparoscopic): $4,000–$12,000\n• Ventral hernia repair: $5,000–$15,000\n• Outpatient surgery center: 30–50% cheaper than hospital\n\nWith insurance: $500–$3,000 typical out-of-pocket.\n\n💡 Most hernia repairs are elective (not urgent), which gives you time to compare facility prices and ensure your surgeon AND the facility are both in-network.`,
      ['What is in-network vs out-of-network?', 'Does anesthesia bill separately?', 'What is prior authorization for surgery?', 'How do I get a second opinion?']
    )
  }

  if (match(msg, ['knee', 'hip', 'replacement', 'arthroplasty', 'joint replacement'])) {
    return reply(
      `Joint replacement costs:\n• Knee replacement: $25,000–$55,000 total\n• Hip replacement: $25,000–$50,000 total\n• Outpatient setting (same-day): up to 40% cheaper than inpatient\n\nWith insurance (after deductible + coinsurance):\n• Typical out-of-pocket: $3,000–$8,000\n• Usually hits your out-of-pocket maximum\n\n💡 Always get pre-authorization (PA). Ask your surgeon about an outpatient surgery center — Medicare now covers same-day knee/hip replacement, and most commercial insurers follow.`,
      ['What is prior authorization?', 'Does anesthesia bill separately?', 'What is an out-of-pocket maximum?', 'What is physical therapy after surgery?']
    )
  }

  if (match(msg, ['spine', 'back surgery', 'spinal fusion', 'discectomy', 'laminectomy'])) {
    return reply(
      `Spine surgery costs:\n• Discectomy (disc removal): $15,000–$50,000\n• Spinal fusion (1 level): $25,000–$75,000\n• Laminectomy: $20,000–$50,000\n• Multi-level fusion: $60,000–$150,000+\n\nWith insurance: $3,000–$10,000 out-of-pocket (usually hits OOP max).\n\n💡 Spine surgery has significant variability in outcomes. Always get at least 2 surgeon opinions, and exhaust physical therapy and injections first — insurers often require this before approving surgery.`,
      ['What is prior authorization for surgery?', 'What is physical therapy?', 'What is an out-of-pocket maximum?', 'How do I get a second opinion covered?']
    )
  }

  // ─── CARDIAC ────────────────────────────────────────────────────────────────
  if (match(msg, ['heart attack', 'myocardial infarction', 'cardiac arrest', 'stent', 'bypass', 'cabg', 'angioplasty'])) {
    return reply(
      `Cardiac procedure costs:\n• Heart attack hospitalization (3–5 days): $35,000–$100,000\n• Cardiac catheterization: $7,000–$15,000\n• Coronary stent placement: $20,000–$50,000\n• Bypass surgery (CABG): $50,000–$150,000\n• Pacemaker implant: $25,000–$50,000\n\nWith insurance: these usually hit your out-of-pocket maximum quickly.\n\n💡 After a heart attack, you may qualify for cardiac rehabilitation (covered by Medicare and most insurance) — it significantly reduces re-hospitalization risk.`,
      ['What is an out-of-pocket maximum?', 'What does Medicare cover for cardiac care?', 'What is cardiac rehabilitation?', 'How do I dispute a hospital bill?']
    )
  }

  if (match(msg, ['ekg', 'ecg', 'electrocardiogram', 'heart rhythm', 'echocardiogram'])) {
    return reply(
      `Common cardiac test costs:\n• EKG (12-lead): $50–$350 (CPT 93000)\n• Echocardiogram (heart ultrasound): $1,000–$3,500 (CPT 93306)\n• Cardiac stress test: $200–$1,500 (CPT 93015)\n• Holter monitor (24-48 hr): $200–$500\n• Cardiac catheterization: $7,000–$15,000 (CPT 93458)\n\nWith insurance: usually 80–100% covered after deductible for diagnostic tests ordered by your cardiologist.`,
      ['What is the difference between EKG and echocardiogram?', 'What does CPT 93306 mean?', 'How much does a cardiologist visit cost?', 'What is a stress test used for?']
    )
  }

  // ─── MENTAL HEALTH ──────────────────────────────────────────────────────────
  if (match(msg, ['therapy', 'therapist', 'psychotherapy', 'psychiatrist', 'counseling', 'mental health', 'depression', 'anxiety treatment'])) {
    return reply(
      `Mental health care costs:\n• Therapist / psychologist session (50 min): $100–$300\n• Psychiatrist visit (medication management): $200–$500\n• Telehealth therapy (BetterHelp, Talkspace): $60–$100/week\n• Inpatient psychiatric hospitalization: $1,200–$2,000/day\n\nWith insurance: the Mental Health Parity Act requires mental health coverage equal to medical. Most plans cover therapy with a copay ($20–$60) or coinsurance.\n\n💡 Community mental health centers offer sliding-scale fees (sometimes $0–$30/session) based on income. Open Path Collective connects people to therapists at $30–$80/session.`,
      ['Does insurance cover therapy?', 'What is the Mental Health Parity Act?', 'How do I find an in-network therapist?', 'What is telehealth therapy?']
    )
  }

  // ─── PHYSICAL THERAPY ───────────────────────────────────────────────────────
  if (match(msg, ['physical therapy', 'pt ', 'physiotherapy', 'occupational therapy', 'rehab'])) {
    return reply(
      `Physical therapy costs:\n• Initial evaluation: $150–$350 (CPT 97162)\n• Follow-up session: $100–$300 per session\n• Typical course: 12–20 sessions\n• Total out-of-pocket: $500–$2,000 with insurance\n\nMost insurance plans cover physical therapy but may limit sessions per year (typically 20–60). Telehealth PT is emerging as a cheaper option.\n\n💡 You can often self-refer to a PT in many states (Direct Access) without a doctor's referral. Check your state's laws — this saves a visit copay.`,
      ['How many PT sessions does insurance cover?', 'What is occupational therapy?', 'What is the difference between PT and chiropractor?', 'Is PT covered after surgery?']
    )
  }

  // ─── CANCER ─────────────────────────────────────────────────────────────────
  if (match(msg, ['cancer', 'chemotherapy', 'chemo', 'radiation', 'oncology', 'tumor', 'immunotherapy'])) {
    return reply(
      `Cancer treatment costs:\n• Chemotherapy (per cycle): $1,000–$12,000+ depending on drug\n• Radiation therapy (full course): $10,000–$50,000\n• Immunotherapy (per infusion): $5,000–$30,000\n• Targeted therapy (oral): $5,000–$20,000/month\n• Bone marrow transplant: $300,000–$800,000\n\nWith insurance: cancer treatment almost always hits your out-of-pocket maximum. After that, insurance covers 100%.\n\n💡 Resources: Cancer Care (cancercare.org) offers financial assistance. Most cancer centers have financial navigators. Manufacturer PAPs exist for many cancer drugs.`,
      ['What is an out-of-pocket maximum?', 'What are patient assistance programs for cancer drugs?', 'What does Medicare cover for cancer?', 'How do I apply for financial assistance?']
    )
  }

  // ─── PREGNANCY & OB ─────────────────────────────────────────────────────────
  if (match(msg, ['pregnancy', 'prenatal', 'delivery', 'birth', 'labor', 'ob-gyn', 'obgyn', 'maternity', 'c-section', 'cesarean', 'epidural', 'midwife'])) {
    return reply(
      `Pregnancy and delivery costs:\n• Prenatal care (all visits): $2,000–$4,000\n• Vaginal delivery (global OB): $8,000–$15,000\n• C-section: $15,000–$30,000\n• Epidural anesthesia: $2,000–$5,000 (billed separately!)\n• NICU (per day): $3,000–$10,000+\n• Newborn's first exam: $300–$600\n\nWith insurance: most plans cover prenatal + delivery in full after deductible. Watch for surprise bills from anesthesia (separate provider).\n\n💡 The Affordable Care Act requires all Marketplace plans to cover maternity and newborn care as an essential health benefit.`,
      ['Is an epidural covered by insurance?', 'What is a global OB billing package?', 'Is my baby automatically covered after birth?', 'What is a surprise medical bill?']
    )
  }

  // ─── PEDIATRIC ──────────────────────────────────────────────────────────────
  if (match(msg, ['child', 'pediatric', 'baby', 'newborn', 'pediatrician', 'well child', 'well-child'])) {
    return reply(
      `Pediatric care costs:\n• Well-child visits: $100–$350 (FREE with insurance under ACA)\n• Sick visit: $100–$250\n• Vaccines (full schedule): $1,500+ total without insurance (FREE with insurance)\n• Ear infection visit: $100–$200\n• Strep throat test: $80–$200\n\nWith insurance: all well-child visits and CDC-recommended vaccines are covered 100% (no copay, no deductible) under the ACA.\n\n💡 If uninsured: CHIP (Children's Health Insurance Program) covers kids up to 19 in families earning up to 200–300% of federal poverty level — often for free or low cost.`,
      ['What does CHIP cover?', 'What vaccines are covered for free?', 'What is preventive care?', 'How do I add my newborn to insurance?']
    )
  }

  // ─── EMERGENCY ROOM ─────────────────────────────────────────────────────────
  if (match(msg, ['emergency', 'er ', 'er visit', 'emergency room', 'urgent care'])) {
    return reply(
      `ER vs Urgent Care costs:\n\n🏥 Emergency Room:\n• Facility fee alone: $500–$3,000+\n• Total bill: $1,500–$10,000+ depending on severity\n• With insurance: $100–$1,500 after copay + deductible\n\n🚑 Urgent Care:\n• Typical visit: $100–$250 total\n• With insurance: $20–$75 copay usually\n\nUse urgent care for: cuts, sprains, minor infections, high fever, UTIs, mild asthma.\nUse ER for: chest pain, stroke symptoms, head trauma, severe difficulty breathing, life-threatening emergencies.\n\n💡 Many hospital systems now have ER-level facilities called "freestanding ERs" — they bill at full ER rates even for minor issues. Always check before entering.`,
      ['What is a facility fee?', 'Does insurance cover the ER?', 'What is surprise billing?', 'How much does an ambulance cost?']
    )
  }

  // ─── AMBULANCE ──────────────────────────────────────────────────────────────
  if (match(msg, ['ambulance', '911', 'paramedic', 'ems', 'ground transport', 'air ambulance', 'medevac'])) {
    return reply(
      `Ambulance costs are notoriously high:\n• Ground ambulance: $500–$3,000\n• Air ambulance (helicopter): $12,000–$100,000+\n\nInsurance coverage:\n• Most plans cover emergency ambulance but may require it to be "medically necessary"\n• Out-of-network ambulances are common — and before the No Surprises Act, could bill you the difference\n\nThe No Surprises Act (2022): Protects against surprise bills from out-of-network ER providers and air ambulances. Ground ambulances are NOT yet protected (pending legislation).\n\n💡 If you receive a huge ambulance bill, call and negotiate. Many ambulance companies will settle for 20–50% of the bill, especially for uninsured patients.`,
      ['What is the No Surprises Act?', 'What is balance billing?', 'How do I negotiate a medical bill?', 'What does ER insurance cover?']
    )
  }

  // ─── PREVENTIVE CARE ────────────────────────────────────────────────────────
  if (match(msg, ['annual physical', 'yearly checkup', 'preventive', 'wellness visit', 'free physical', 'well visit', 'wellness exam'])) {
    return reply(
      `Annual physicals and preventive care are FREE with insurance under the ACA (no copay, no deductible):\n\n✅ Always covered 100%:\n• Annual wellness exam\n• Blood pressure screening\n• Cholesterol screening (age 35+)\n• Colorectal cancer screening (colonoscopy)\n• Mammogram (women 40–75)\n• Pap smear (women)\n• Diabetes screening\n• Depression screening\n• All ACIP-recommended vaccines\n\n⚠️ Important: If your doctor orders extra tests during your physical (labs not on the preventive list), those may be billed separately under your deductible.\n\n💡 Tell your doctor upfront: "I want to keep this visit preventive-only."`,
      ['What is covered under preventive care?', 'Why did I get a bill after my free physical?', 'What vaccines are covered free?', 'What is a colonoscopy?']
    )
  }

  // ─── VACCINES ───────────────────────────────────────────────────────────────
  if (match(msg, ['vaccine', 'vaccination', 'flu shot', 'covid vaccine', 'tetanus', 'shingles', 'pneumonia shot'])) {
    return reply(
      `Vaccines — what's covered:\n\n✅ Free with insurance (ACA-required):\n• Flu shot (annual)\n• COVID-19 vaccine\n• Tdap / Tetanus\n• Shingles (Shingrix) — adults 50+\n• Pneumonia (Prevnar, Pneumovax)\n• HPV — up to age 26\n• Hepatitis A and B\n• MMR, Varicella, and all childhood vaccines\n\nWithout insurance: $20–$250 depending on the vaccine. Walgreens, CVS, Walmart, and local health departments offer many vaccines.\n\n💡 If uninsured: vaccines.gov lists free and low-cost vaccine locations near you.`,
      ['What does preventive care cover?', 'Is the flu shot free with insurance?', 'What vaccines does Medicare cover?', 'Where can I get free vaccines?']
    )
  }

  // ─── TELEMEDICINE ───────────────────────────────────────────────────────────
  if (match(msg, ['telehealth', 'telemedicine', 'virtual visit', 'video visit', 'online doctor', 'remote doctor'])) {
    return reply(
      `Telehealth costs:\n• With insurance: $0–$50 copay (many plans have $0 telehealth copays since 2020)\n• Without insurance: $50–$150 per visit\n• Direct-pay platforms: Teladoc ($75/visit), MDLive ($82/visit), Amazon Clinic (from $35)\n\nBest for: cold/flu symptoms, UTIs, rashes, mental health, prescription refills, follow-ups.\nNot suitable for: chest pain, stroke, severe injuries, anything requiring physical exam.\n\n💡 Many employers offer free telehealth through their EAP (Employee Assistance Program) — check your HR benefits.`,
      ['What is the cost of an urgent care visit?', 'Does my insurance cover telehealth?', 'What is an EAP?', 'Can I get prescriptions through telehealth?']
    )
  }

  // ─── COLONOSCOPY ────────────────────────────────────────────────────────────
  if (match(msg, ['colonoscopy', 'colon cancer', 'colorectal', 'cologuard'])) {
    return reply(
      `Colonoscopy is free as a preventive screening if you're 45+ with no symptoms:\n• Screening colonoscopy: $0 with insurance (ACA-mandated)\n• Diagnostic colonoscopy (if you have symptoms): billed differently — deductible applies\n• Without insurance: $1,000–$4,000\n• Cologuard (at-home stool test): $500–$700 — often covered by insurance as alternative\n\n⚠️ Billing trap: If a polyp is removed during a "free" screening, some insurers reclassify it as diagnostic and apply cost-sharing. The No Surprises Act partially addresses this.\n\n💡 Ask your insurer in writing: "Will polyp removal during screening change the cost-sharing?"`,
      ['Is a colonoscopy free with insurance?', 'What is the difference between screening and diagnostic?', 'What is Cologuard?', 'What does CPT 45378 mean?']
    )
  }

  // ─── INSURANCE FUNDAMENTALS ─────────────────────────────────────────────────
  if (match(msg, ['deductible'])) {
    return reply(
      `Your deductible is the amount you pay out-of-pocket each year before your insurance starts covering costs.\n\nExample: $1,500 deductible\n• First $1,500 of care: you pay 100%\n• After $1,500: insurance kicks in (you pay coinsurance, e.g. 20%)\n• After your out-of-pocket max: insurance pays 100%\n\nDeductible resets every January 1st.\n\n💡 Preventive care (annual physicals, vaccines, screenings) is covered 100% without applying your deductible under the ACA.`,
      ['What is coinsurance?', 'What is an out-of-pocket maximum?', 'Do copays count toward deductible?', 'What is a high-deductible health plan?']
    )
  }

  if (match(msg, ['copay', 'co-pay'])) {
    return reply(
      `A copay is a fixed dollar amount you pay for a specific service — regardless of the total cost.\n\nTypical copay amounts:\n• Primary care visit: $20–$40\n• Specialist visit: $40–$70\n• Urgent care: $50–$100\n• ER visit: $100–$350\n• Generic prescription: $5–$20\n• Brand prescription: $30–$80\n\nCopays usually apply before meeting your deductible (on HMO plans) or after (on some PPO plans).\n\n💡 Copays do NOT always count toward your deductible, but they do count toward your out-of-pocket maximum.`,
      ['What is a deductible?', 'What is coinsurance?', 'What is an HMO vs PPO?', 'What is an out-of-pocket maximum?']
    )
  }

  if (match(msg, ['coinsurance'])) {
    return reply(
      `Coinsurance is your percentage share of costs after you've met your deductible.\n\nExample: 80/20 plan\n• Insurance pays: 80%\n• You pay: 20%\n• On a $5,000 procedure: you owe $1,000 (after deductible)\n\nThis continues until you hit your out-of-pocket maximum, after which insurance pays 100%.\n\nCommon splits: 80/20, 70/30, 60/40. The more you pay in premiums, usually the better your coinsurance split.`,
      ['What is an out-of-pocket maximum?', 'What is a deductible?', 'What is a copay?', 'What is a premium?']
    )
  }

  if (match(msg, ['out-of-pocket maximum', 'out of pocket max', 'oop max', 'maximum out'])) {
    return reply(
      `The out-of-pocket maximum (OOP max) is the most you'll ever pay in a year for covered services. After you hit it, insurance pays 100%.\n\n2024 ACA limits:\n• Individual: $9,450\n• Family: $18,900\n\nWhat counts toward OOP max: deductibles, copays, coinsurance.\nWhat does NOT count: premiums, out-of-network costs (on some plans), non-covered services.\n\n💡 If you're facing major surgery or cancer treatment, you'll likely hit your OOP max — understanding this helps you plan cash flow for the year.`,
      ['What is a deductible?', 'What is coinsurance?', 'Does my premium count toward my OOP max?', 'What happens when I hit my OOP max?']
    )
  }

  if (match(msg, ['premium', 'monthly premium', 'insurance payment'])) {
    return reply(
      `Your premium is the monthly amount you pay to keep your health insurance active — regardless of whether you use it.\n\n2024 average premiums:\n• Individual employer plan: ~$700/month (you pay ~$150, employer ~$550)\n• Family employer plan: ~$2,000/month total\n• ACA Marketplace individual: $400–$800/month before subsidies\n\nHigher premium usually = lower deductible + better coinsurance. Lower premium = higher deductible.\n\n💡 If your income is 100–400% of the federal poverty level, ACA premium subsidies (tax credits) can reduce your monthly premium significantly — sometimes to $0.`,
      ['What is a deductible?', 'What is an HMO vs PPO?', 'What are ACA subsidies?', 'What is a high-deductible health plan (HDHP)?']
    )
  }

  if (match(msg, ['prior authorization', 'pre-auth', 'prior auth', 'pre-authorization', 'pa required'])) {
    return reply(
      `Prior authorization (PA) is advance approval required from your insurer before certain services are covered.\n\nCommonly requires PA:\n• MRI/CT scans\n• Specialty drugs (especially biologics)\n• Elective surgeries\n• Certain specialists (e.g., out-of-network)\n• Mental health inpatient stays\n• Durable medical equipment\n\nHow to get PA:\n1. Your doctor submits the request with medical necessity documentation\n2. Insurer reviews (typically 1–3 business days; urgent = 24–72 hrs)\n3. Approved, denied, or modified\n\n⚠️ If denied: your doctor can request a peer-to-peer review (doctor speaks directly to insurance medical director). This reverses ~40% of denials.`,
      ['What happens if PA is denied?', 'What is a peer-to-peer review?', 'How do I appeal a denied claim?', 'What is medical necessity?']
    )
  }

  if (match(msg, ['hmo', 'health maintenance organization', 'pcp referral', 'primary care physician'])) {
    return reply(
      `HMO (Health Maintenance Organization):\n\n✅ Pros:\n• Lower premiums and copays\n• Simple coverage structure\n\n❌ Cons:\n• Must choose a primary care physician (PCP)\n• Need referral to see specialists\n• Usually no out-of-network coverage (except emergencies)\n\nBest for: people who have a trusted PCP, rarely need specialists, and want lower monthly costs.\n\n💡 If you have a complex condition needing multiple specialists, a PPO gives more flexibility even at higher cost.`,
      ['What is a PPO?', 'What is a referral?', 'What is an HMO vs PPO vs EPO?', 'What is a primary care physician?']
    )
  }

  if (match(msg, ['ppo', 'preferred provider organization'])) {
    return reply(
      `PPO (Preferred Provider Organization):\n\n✅ Pros:\n• See any doctor or specialist without a referral\n• Some out-of-network coverage (at higher cost)\n• More flexibility for complex health needs\n\n❌ Cons:\n• Higher premiums than HMO\n• Higher out-of-pocket costs if you go out-of-network\n\nBest for: people with complex conditions, those who travel, or anyone who values flexibility.\n\n💡 Always check that both your doctor AND the facility (hospital, surgery center) are in-network. Surgeons can be in-network while their hospital is not.`,
      ['What is an HMO?', 'What is in-network vs out-of-network?', 'What is balance billing?', 'What is the No Surprises Act?']
    )
  }

  if (match(msg, ['hsa', 'health savings account', 'fsa', 'flexible spending account', 'hdhp', 'high deductible'])) {
    return reply(
      `HSA (Health Savings Account) — available only with a High-Deductible Health Plan (HDHP):\n\n2024 contribution limits:\n• Individual: $4,150\n• Family: $8,300\n\nTriple tax advantage:\n1. Contributions are pre-tax\n2. Growth is tax-free\n3. Withdrawals for medical expenses are tax-free\n\nUnspent funds roll over forever — it becomes a retirement account at 65.\n\nFSA (Flexible Spending Account):\n• Available with any plan (including HMO/PPO)\n• 2024 limit: $3,050\n• Use-it-or-lose-it (some plans allow $610 rollover)\n• Great for predictable costs: glasses, dental, copays\n\n💡 HSA is the only triple tax-advantaged account in the US — maximize it if you can afford the higher HDHP deductible.`,
      ['What can I spend my HSA on?', 'What is an HDHP?', 'Is LASIK eligible for HSA?', 'What is a deductible?']
    )
  }

  if (match(msg, ['cobra', 'lost job', 'lost insurance', 'laid off', 'between jobs'])) {
    return reply(
      `COBRA lets you keep your employer health insurance after leaving a job — but you pay the full premium (employee + employer share).\n\nTypical COBRA cost: $500–$700/month (individual) or $1,500–$2,000/month (family) — often 102% of the full premium.\n\nCOBRA lasts: 18 months (up to 36 months in certain circumstances).\n\nBetter alternatives to COBRA:\n• ACA Marketplace special enrollment (job loss = qualifying life event) — may be cheaper with subsidies\n• Medicaid — if income dropped significantly\n• Spouse's employer plan\n• Short-term health insurance (limited coverage)\n\n💡 You have 60 days to elect COBRA. Coverage is retroactive, so you can wait until you have a claim to decide.`,
      ['How do ACA subsidies work?', 'What is Medicaid?', 'What is a qualifying life event?', 'How do I enroll in ACA Marketplace insurance?']
    )
  }

  if (match(msg, ['medicare', 'part a', 'part b', 'part d', 'advantage plan', 'medigap', 'supplement'])) {
    return reply(
      `Medicare overview:\n\n• Part A (Hospital): Free for most. Covers inpatient hospital, skilled nursing, hospice.\n• Part B (Medical): ~$174.70/month (2024). Covers doctor visits, outpatient care, preventive services.\n• Part C (Medicare Advantage): Bundled A+B through private insurer. May include dental/vision.\n• Part D (Prescription): Separate plan for drugs. Premiums vary by plan.\n• Medigap (Supplement): Fills gaps in Original Medicare (deductibles, coinsurance). Plan G is popular.\n\n2024 costs:\n• Part A deductible: $1,632 per benefit period\n• Part B deductible: $240/year\n• Part B coinsurance: 20% after deductible\n\n💡 The Inflation Reduction Act caps out-of-pocket drug costs at $2,000/year for Medicare Part D starting 2025.`,
      ['What is Medicare Part D?', 'What is a Medigap plan?', 'What is Medicare Advantage?', 'When do I enroll in Medicare?']
    )
  }

  if (match(msg, ['medicaid', 'chip', 'state insurance', 'low income insurance'])) {
    return reply(
      `Medicaid provides free or very low-cost health coverage for low-income individuals and families.\n\nWho qualifies:\n• Adults with income under ~138% of federal poverty level (in expansion states)\n• Children under CHIP: up to 200–300% FPL depending on state\n• Pregnant women, elderly, disabled\n\nCoverage: Doctor visits, hospital, prescriptions, dental, vision (varies by state), mental health, substance use treatment.\n\nCosts: Often $0 premium, $0–$3 copays.\n\n💡 Apply at HealthCare.gov or your state's Medicaid office. If you lose a job or income drops, you can enroll anytime (not just open enrollment).`,
      ['What is CHIP for children?', 'What does Medicaid cover?', 'How do I apply for Medicaid?', 'What is ACA Marketplace insurance?']
    )
  }

  if (match(msg, ['surprise bill', 'surprise billing', 'no surprises act', 'balance billing', 'balance bill'])) {
    return reply(
      `The No Surprises Act (effective 2022) protects you from many unexpected out-of-network bills:\n\n✅ Protects you from:\n• Out-of-network ER providers (even at in-network hospitals)\n• Out-of-network anesthesiologists, radiologists, pathologists at in-network facilities\n• Air ambulance surprise bills\n\n❌ Does NOT protect you from:\n• Knowingly choosing an out-of-network provider\n• Ground ambulance (pending legislation)\n• Services at out-of-network facilities you chose\n\nIf you receive a surprise bill covered by the Act:\n1. Dispute it with your insurer within 120 days\n2. File a complaint at cms.gov/nosurprises\n3. Contact your state insurance commissioner\n\n💡 Always ask before a procedure: "Are all providers involved in-network?" — especially the anesthesiologist.`,
      ['What is balance billing?', 'How do I dispute a surprise bill?', 'Is my anesthesiologist in-network?', 'What is the No Surprises Act?']
    )
  }

  // ─── EOB ────────────────────────────────────────────────────────────────────
  if (match(msg, ['eob', 'explanation of benefits'])) {
    return reply(
      `An EOB (Explanation of Benefits) is NOT a bill — it's a summary from your insurance company showing:\n\n1. What your provider charged\n2. What your insurance "allowed" (their negotiated rate)\n3. How much the insurance paid\n4. What YOU owe (your responsibility)\n\nAlways wait for an actual bill from your provider before paying anything.\n\nCommon EOB terms:\n• "Not covered" — either not in your plan or requires PA\n• "Deductible applied" — applied to your deductible\n• "Member responsibility" — your share\n\n💡 Compare your EOB to your actual bill line-by-line. Billing errors affect up to 80% of medical bills.`,
      ['What are common denial codes on an EOB?', 'What does CO-97 mean?', 'How do I appeal a denied claim?', 'Use the Insurance Decoder tab to decode your EOB']
    )
  }

  // ─── DENIAL CODES ───────────────────────────────────────────────────────────
  if (match(msg, ['co-4', 'co-11', 'co-16', 'co-97', 'pr-1', 'pr-2', 'denial code', 'adjustment code', 'remark code', 'carc', 'rarc'])) {
    return reply(
      `Common claim adjustment / denial codes:\n\n• CO-4 — Service inconsistent with diagnosis → ask doctor to resubmit with correct codes\n• CO-11 — Diagnosis inconsistent with procedure → verify codes with provider\n• CO-16 — Claim lacks information → provider must resubmit with complete info\n• CO-97 — Bundled service (included in another code) — often correct, ask for explanation\n• CO-50 — Non-covered service → file an appeal with medical necessity documentation\n• PR-1 — Deductible not met → correct if you haven't met your deductible\n• PR-2 — Coinsurance → your required share\n• PR-96 — Prior authorization not obtained → your provider's responsibility to fix\n\n💡 Use the Insurance Decoder tab to look up any code and generate an appeal letter.`,
      ['How do I appeal a CO-50 denial?', 'What is prior authorization?', 'What is an EOB?', 'What does "bundled service" mean?']
    )
  }

  // ─── APPEAL ─────────────────────────────────────────────────────────────────
  if (match(msg, ['appeal', 'denied', 'denial', 'denied claim', 'fight my insurance'])) {
    return reply(
      `Insurance appeals succeed 40–60% of the time — always worth filing.\n\nStep-by-step appeal process:\n1. Get the denial letter — it must state the specific reason and denial code\n2. Request your insurer's appeal form (or write a letter)\n3. Ask your doctor for a Letter of Medical Necessity\n4. Gather supporting records (clinical notes, test results, specialist letters)\n5. File within the deadline (usually 180 days from denial)\n6. Escalate to external review if internal appeal fails (legally required for most plans)\n\nPeer-to-peer review: Ask your doctor to call the insurance medical director directly — reverses ~40% of denials before a formal appeal.\n\n💡 Use the Insurance Decoder tab to generate a pre-filled appeal letter template.`,
      ['What is a Letter of Medical Necessity?', 'What is a peer-to-peer review?', 'What is external appeal review?', 'What are common denial codes?']
    )
  }

  // ─── BILLING ERRORS ─────────────────────────────────────────────────────────
  if (match(msg, ['overcharge', 'billing error', 'wrong charge', 'dispute', 'negotiate', 'lower my bill', 'reduce my bill', 'itemized bill'])) {
    return reply(
      `Medical billing errors affect up to 80% of bills. Here's how to fight back:\n\n1. Request an itemized bill — hospitals must provide this by law\n2. Request your medical records — verify every charge matches something that happened\n3. Look for:\n   • Duplicate charges (same code twice)\n   • Upcoding (billed higher visit level than documented)\n   • Unbundling (separate billing of services normally included in one code)\n   • Charges for services you didn't receive\n4. Call the billing department and reference specific line items\n5. Ask about financial assistance / charity care — most nonprofits hospitals are required to offer it\n\n💡 Medical billing advocates (fee: 20–35% of savings) can negotiate on your behalf — useful for large bills.`,
      ['What is unbundling in medical billing?', 'What is upcoding?', 'How do I get an itemized bill?', 'What is hospital financial assistance?']
    )
  }

  // ─── HOSPITAL FINANCIAL ASSISTANCE ──────────────────────────────────────────
  if (match(msg, ['financial assistance', 'charity care', 'hardship', 'cannot afford', "can't afford", 'hospital discount', 'write off'])) {
    return reply(
      `Nonprofit hospitals are required by law to have charity care programs:\n\n• Sliding-scale discounts based on income — often free if income <200% FPL\n• Uninsured discounts: 30–60% off billed charges (just for not having insurance)\n• Payment plans: interest-free monthly plans — always ask\n• Medical debt forgiveness: some hospitals have settled bills for 10–20 cents on the dollar\n\nHow to apply:\n1. Call the hospital billing department and say "I'd like to apply for financial assistance"\n2. Ask for the charity care application\n3. Provide proof of income (pay stubs or tax return)\n4. Submit — approval usually within 2–4 weeks\n\n💡 Dollar For (dollarfor.org) is a free service that helps patients apply for hospital financial assistance — they do the paperwork for you.`,
      ['How do I negotiate a medical bill?', 'What is a payment plan for medical bills?', 'Can medical debt be forgiven?', 'What is a medical billing advocate?']
    )
  }

  // ─── BLOOD TESTS / LAB ──────────────────────────────────────────────────────
  if (match(msg, ['blood test', 'lab ', 'labs ', 'cbc', 'blood work', 'blood panel', 'metabolic panel', 'lipid panel', 'cholesterol test', 'a1c'])) {
    return reply(
      `Common blood test costs:\n• CBC (blood count): $30–$100 (CPT 85025)\n• Comprehensive metabolic panel: $40–$150 (CPT 80053)\n• Lipid panel (cholesterol): $30–$100 (CPT 80061)\n• Hemoglobin A1c (diabetes): $30–$90 (CPT 83036)\n• TSH (thyroid): $40–$100 (CPT 84443)\n• Full panel (all of the above): $100–$400\n\nWith insurance: Usually free as part of your annual physical. Otherwise, a small copay or applied to deductible.\n\n💡 Walk-in labs like LabCorp and Quest offer self-pay pricing without a doctor's order — often $30–$80 for common panels. Everlywell offers home blood tests from $50.`,
      ['What does a CBC test for?', 'What is a comprehensive metabolic panel?', 'What is a normal A1c level?', 'Is my blood work covered at my annual physical?']
    )
  }

  // ─── SPECIFIC COST QUESTIONS ─────────────────────────────────────────────────
  if (match(msg, ['how much', 'cost', 'price', 'expensive', 'pay for', 'afford'])) {
    return reply(
      `For a specific cost estimate, use the Treatment Cost Estimator tab.\n\nGeneral ranges without insurance:\n• Office visit (primary care): $100–$300\n• Specialist visit: $200–$500\n• Urgent care: $100–$250\n• ER visit: $1,000–$5,000+\n• Lab work (blood panel): $100–$400\n• X-ray: $100–$400\n• MRI: $400–$3,500\n• CT scan: $300–$2,500\n• Common outpatient surgery: $5,000–$30,000\n\nWhat procedure are you asking about?`,
      ['How much does an MRI cost?', 'What does a specialist visit cost?', 'How much is a colonoscopy?', 'What does surgery typically cost?']
    )
  }

  if (match(msg, ['specialist', 'specialist visit', 'referral', 'see a specialist'])) {
    return reply(
      `Specialist visit costs:\n• Cardiology: $250–$600 first visit\n• Orthopedics: $200–$500\n• Dermatology: $150–$400\n• Neurology: $300–$700\n• Oncology: $300–$600\n• Psychiatry: $200–$500 (initial); $100–$200 (follow-up)\n\nWith insurance: $40–$70 copay (HMO) or 20% coinsurance after deductible (PPO).\n\n💡 On an HMO, you need a referral from your PCP. On a PPO, you can self-refer — but check the specialist is in-network to avoid surprise bills.`,
      ['Do I need a referral to see a specialist?', 'What is in-network vs out-of-network?', 'What is an HMO vs PPO?', 'How much does a dermatologist cost?']
    )
  }

  // ─── INSURANCE COVERAGE GENERAL ──────────────────────────────────────────────
  if (match(msg, ['insurance', 'coverage', 'covered', 'in-network', 'out of network', 'network'])) {
    return reply(
      `Coverage questions always depend on your specific plan, but general rules:\n\n• In-network care: significantly cheaper (negotiated rates)\n• Out-of-network: much more expensive, may not count toward your deductible\n• Preventive care: always 100% covered (ACA)\n• Emergency care: always covered (even out-of-network ER)\n• Mental health: must be covered equally to medical care (parity law)\n\nAlways verify before a procedure:\n1. Is my provider in-network?\n2. Is the facility in-network?\n3. Is prior authorization required?\n4. What is my deductible balance?\n\n💡 Call the member services number on the back of your insurance card to verify.`,
      ['What is in-network vs out-of-network?', 'What is prior authorization?', 'What is an HMO vs PPO?', 'What does my insurance actually cover?']
    )
  }

  // ─── EXACT CPT/ICD CODE LOOKUP ───────────────────────────────────────────────
  const codeMatch = message.trim().match(/\b([A-Z]\d{2}\.?\d*[A-Z]?\d?|[A-Z]\d{3,5}|[89][0-9]{4}|[0-9]{5})\b/i)
  if (codeMatch) {
    const entry = lookupCode(codeMatch[1])
    if (entry) {
      const costLine = entry.cost_range ? `\n💰 Typical cost: ${entry.cost_range}` : ''
      const catLine  = entry.category   ? `\n📂 Category: ${entry.category}`        : ''
      return reply(
        `**${typeLabel(entry.type)}: ${entry.code}**\n\n${entry.title}\n\n${entry.description}${costLine}${catLine}\n\nFor a detailed search, try the Code Search tab.`,
        ['What is a related procedure?', 'How much does this cost with insurance?', 'What diagnosis codes relate to this?', 'What does this look like on a bill?']
      )
    }
  }

  // ─── VECTOR SEARCH FALLBACK ───────────────────────────────────────────────────
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
      'What is a related procedure?',
      'How do I know if this is covered?',
      'What CPT code is this billed under?',
    ])
  }

  return reply(
    `I can help with:\n• Medical procedure costs — "how much does a knee replacement cost?"\n• Prescription savings — "how do I save on my medication?"\n• Insurance terms — "what is a deductible?"\n• CPT or ICD-10 codes — just type the code (e.g. 99213)\n• Denied claims — "how do I appeal a denied claim?"\n• Specific conditions — "how much does cancer treatment cost?"\n\nWhat would you like to know?`,
    ['How much does an MRI cost?', 'What is a deductible?', 'How do I save on prescriptions?', 'How do I appeal a denied claim?']
  )
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function reply(content, suggestions = []) {
  return { content, suggestions }
}

function match(msg, keywords) {
  return keywords.some(k => msg.includes(k))
}
