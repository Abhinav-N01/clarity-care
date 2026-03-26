export const CPT_CODES = {
  "99213": { description: "Office visit, established patient, low complexity", avg_cost: 150, category: "Office Visit" },
  "99214": { description: "Office visit, established patient, moderate complexity", avg_cost: 250, category: "Office Visit" },
  "93000": { description: "Electrocardiogram (EKG/ECG)", avg_cost: 75, category: "Diagnostic" },
  "85025": { description: "Complete blood count (CBC)", avg_cost: 40, category: "Lab" },
  "80053": { description: "Comprehensive metabolic panel", avg_cost: 55, category: "Lab" },
  "71046": { description: "Chest X-ray, 2 views", avg_cost: 200, category: "Radiology" },
  "70553": { description: "MRI brain with contrast", avg_cost: 1800, category: "Radiology" },
  "27447": { description: "Total knee replacement", avg_cost: 35000, category: "Surgery" },
  "43239": { description: "Upper GI endoscopy with biopsy", avg_cost: 1200, category: "Procedure" },
  "90837": { description: "Psychotherapy, 60 minutes", avg_cost: 180, category: "Mental Health" },
}

export const ICD10_CODES = {
  "J06.9": { description: "Acute upper respiratory infection, unspecified", plain_english: "Common cold or upper respiratory infection" },
  "I10":   { description: "Essential hypertension", plain_english: "High blood pressure" },
  "E11.9": { description: "Type 2 diabetes mellitus without complications", plain_english: "Type 2 diabetes" },
  "M54.5": { description: "Low back pain", plain_english: "Lower back pain" },
  "F32.9": { description: "Major depressive disorder, single episode", plain_english: "Depression" },
  "Z00.00":{ description: "Encounter for general adult medical examination", plain_english: "Annual physical exam" },
  "K21.0": { description: "GERD with esophagitis", plain_english: "Acid reflux disease" },
  "J45.901":{ description: "Unspecified asthma, uncomplicated", plain_english: "Asthma" },
  "N39.0": { description: "Urinary tract infection", plain_english: "UTI" },
  "S82.002A":{ description: "Fracture of patella", plain_english: "Broken kneecap" },
}

export const EOB_TERMS = {
  "deductible": "The amount you pay out-of-pocket before your insurance starts paying. Resets yearly.",
  "copay": "A fixed amount you pay for a covered service (e.g., $25 per visit).",
  "coinsurance": "Your share of costs AFTER meeting your deductible (e.g., 20% means you pay 20%, insurance pays 80%).",
  "out-of-pocket maximum": "The most you'll pay in a year. After this, insurance covers 100%.",
  "allowed amount": "The max your insurer will pay for a service. You may owe the difference if out-of-network.",
  "balance billing": "When an out-of-network provider bills you for the difference between their charge and insurance payment.",
  "prior authorization": "Approval you must get BEFORE receiving certain services or your claim may be denied.",
  "formulary": "List of drugs your insurance covers. Drugs not on this list cost more or aren't covered.",
  "in-network": "Providers who have contracts with your insurer — you pay less.",
  "out-of-network": "Providers without insurer contracts — you pay more, sometimes everything.",
  "explanation of benefits": "A summary from your insurer showing what they paid and what you owe. NOT a bill.",
  "claim denied": "Insurance refused to pay. You can appeal — 40-60% of appeals succeed.",
  "coordination of benefits": "Process when you have two insurance plans to determine which pays first.",
  "premium": "Monthly amount you pay to keep insurance active, regardless of whether you use it.",
}

export const DENIAL_REASONS = {
  "CO-4":  { reason: "Service inconsistent with diagnosis", action: "Request review with supporting medical records from your doctor" },
  "CO-11": { reason: "Diagnosis inconsistent with procedure", action: "Ask your doctor to verify and resubmit with corrected codes" },
  "CO-16": { reason: "Claim lacks information", action: "Contact provider billing office to resubmit with complete information" },
  "CO-97": { reason: "Bundled service not separately billable", action: "Ask for itemized bill explanation; this may be correct" },
  "PR-1":  { reason: "Deductible not met", action: "This is correct if you haven't met your deductible. Check your deductible status." },
  "PR-2":  { reason: "Coinsurance amount", action: "This is your required coinsurance share. Verify percentage matches your plan." },
  "PR-204":{ reason: "Not covered by plan", action: "Review your plan documents; consider filing an appeal with medical necessity letter" },
  "OA-23": { reason: "Payment adjusted due to prior payment", action: "Review your EOB for previous payments on this claim" },
}
