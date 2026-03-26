import { search, lookupCode, typeLabel } from './vectorSearch.js'

export function getResponse(message) {
  const msg = message.toLowerCase()

  if (match(msg, ['tooth','dental','root canal','extraction','implant','cavity','crown','oral surgery'])) {
    return "Dental procedure costs (approximate):\n• Tooth extraction: $150–$500\n• Root canal: $700–$1,500\n• Oral/tooth surgery: $800–$3,000\n• Dental implant: $3,000–$5,000\n\nWith insurance you typically pay 20–50% of these amounts.\n\nTip: Always ask for a written treatment plan with cost breakdown before agreeing to any procedure."
  }
  if (match(msg, ['mri'])) {
    return "MRI costs (approximate):\n• Brain MRI: $400–$3,500\n• Spine MRI: $500–$3,000\n• With insurance: typically $100–$500 after deductible\n\nTip: Outpatient imaging centers charge 50–70% less than hospitals for the same scan. Always ask for a referral to an in-network facility."
  }
  if (match(msg, ['ct scan','cat scan'])) {
    return "CT scan costs: $300–$6,750 depending on body area and facility.\nWith insurance: typically $100–$400 after deductible.\n\nTip: Ask your doctor if an X-ray could answer the same question — it's 10x cheaper."
  }
  if (match(msg, ['x-ray','xray'])) {
    return "X-ray costs: $100–$1,000 depending on body part and location.\nWith insurance: usually just your copay ($20–$50).\n\nUrgent care X-rays are significantly cheaper than hospital radiology."
  }
  if (match(msg, ['knee','hip','replacement'])) {
    return "Joint replacement costs:\n• Knee replacement: $30,000–$50,000 total\n• Hip replacement: $30,000–$45,000 total\n• With insurance (after deductible + coinsurance): $3,000–$8,000 out-of-pocket\n\nTip: Get pre-authorization and compare outpatient surgery centers vs. hospitals."
  }
  if (match(msg, ['emergency','er ','emergency room'])) {
    return "ER visit costs: $150–$3,000+ depending on severity.\nWith insurance: $100–$1,000 after copay and deductible.\n\nTip: Urgent care centers cost 80% less for non-emergency issues ($100–$200 vs. $1,000+ ER)."
  }
  if (match(msg, ['blood test','lab','cbc','blood work'])) {
    return "Common lab test costs:\n• CBC (blood count): $40–$150\n• Metabolic panel: $55–$200\n• Lipid panel: $50–$150\n\nWith insurance: often free as part of annual physical, or a small copay."
  }
  if (match(msg, ['eob','explanation of benefits'])) {
    return "An Explanation of Benefits (EOB) is NOT a bill. It shows:\n• What your provider charged\n• What your insurance allowed\n• What insurance paid\n• What YOU owe\n\nAlways wait for an actual bill from your provider before paying. Use the Insurance Decoder tab to decode yours."
  }
  if (match(msg, ['appeal','denied','denial'])) {
    return "If your claim was denied:\n1. Get the denial letter with the reason code\n2. Ask your doctor for a Letter of Medical Necessity\n3. File an appeal within 180 days\n\n40–60% of insurance appeals succeed. Use the Insurance Decoder tab to generate an appeal letter."
  }
  if (match(msg, ['deductible'])) {
    return "Your deductible is the amount you pay out-of-pocket each year before insurance starts covering costs.\n\nExample: With a $1,500 deductible, you pay the first $1,500 of covered care yourself each year. After that, your insurance kicks in."
  }
  if (match(msg, ['copay','co-pay'])) {
    return "A copay is a fixed amount you pay for a covered service — like $25 for a primary care visit or $50 for a specialist.\n\nYou pay this at the time of service, regardless of whether you've met your deductible."
  }
  if (match(msg, ['coinsurance'])) {
    return "Coinsurance is your percentage share of costs after you've met your deductible.\n\nExample: With 20% coinsurance on a $1,000 procedure, you pay $200 and insurance pays $800."
  }
  if (match(msg, ['overcharge','billing error','wrong charge','dispute'])) {
    return "To dispute a medical bill:\n1. Request an itemized bill in writing\n2. Compare charges to your EOB\n3. Look for duplicate charges or services you didn't receive\n4. Call the billing department — ask them to review\n\nHospitals also have financial assistance / charity care programs. Always ask."
  }
  if (match(msg, ['how much','cost','price','expensive','pay for'])) {
    return "For a specific cost estimate, use the Treatment Cost Estimator tab.\n\nGeneral ranges:\n• Office visit: $100–$300\n• Specialist visit: $150–$400\n• Lab work: $40–$200\n• Common surgery: $5,000–$50,000\n\nWhat specific procedure are you asking about?"
  }
  if (match(msg, ['insurance','coverage','covered'])) {
    return "Coverage questions depend on your specific plan. Generally:\n• In-network care costs significantly less\n• Preventive care is usually free\n• Always verify coverage BEFORE a procedure by calling member services\n\nThe number is on the back of your insurance card."
  }

  // ── Vector search fallback ─────────────────────────────────────────────
  // Try exact code lookup first (e.g. "what is 99213" or "explain J45.9")
  const codeMatch = message.trim().match(/\b([A-Z]\d{2}\.?\d*|[A-Z]\d{2,5}|9\d{4}|8\d{4}|7\d{4}|4\d{4}|3\d{4}|D\d{4})\b/i)
  if (codeMatch) {
    const entry = lookupCode(codeMatch[1])
    if (entry) {
      const costLine = entry.cost_range ? `\n💰 Typical cost: ${entry.cost_range}` : ''
      const catLine  = entry.category   ? `\n📂 Category: ${entry.category}`        : ''
      return `**${typeLabel(entry.type)}: ${entry.code}**\n\n${entry.title}\n\n${entry.description}${costLine}${catLine}\n\nFor more details, try the Code Search tab.`
    }
  }

  // Semantic vector search for anything else
  const vectorResults = search(message, { topK: 3, minScore: 0.07 })
  if (vectorResults.length > 0) {
    const top = vectorResults[0]
    const costLine = top.cost_range ? `\n💰 Typical cost: ${top.cost_range}` : ''
    let reply = `**${top.title}**\n\n${top.description}${costLine}`
    if (vectorResults.length > 1) {
      reply += '\n\n**Related:**'
      vectorResults.slice(1).forEach(r => {
        reply += `\n• ${r.title}${r.cost_range ? ' — ' + r.cost_range : ''}`
      })
    }
    reply += '\n\nFor a detailed search, try the **Code Search** tab.'
    return reply
  }

  return "I can help with:\n• Medical procedure costs (ask 'how much does X cost?')\n• Understanding your EOB or insurance terms\n• Appealing a denied claim\n• Decoding CPT or ICD-10 codes\n• Searching procedures with the Code Search tab\n\nWhat do you need help with?"
}

function match(msg, keywords) {
  return keywords.some(k => msg.includes(k))
}
