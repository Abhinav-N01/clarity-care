/**
 * Client-side TF-IDF Vector Search Engine
 *
 * How it works:
 * 1. Each document in the knowledge base gets a TF-IDF vector
 *    (Term Frequency × Inverse Document Frequency per term)
 * 2. A user query is vectorized the same way
 * 3. Cosine similarity ranks documents against the query
 * 4. Returns top-k results sorted by relevance score
 *
 * This is genuine vector similarity search — same math as large-scale
 * systems, using sparse bag-of-words vectors instead of dense neural embeddings.
 */

import { MEDICAL_KB } from './medicalKB.js'

// ── Stop words to ignore ────────────────────────────────────────────────────
const STOP_WORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with',
  'by','from','is','are','was','were','be','been','being','have','has',
  'had','do','does','did','will','would','could','should','may','might',
  'it','its','this','that','these','those','i','you','he','she','we',
  'they','my','your','his','her','our','their','what','which','who',
  'how','when','where','why','not','no','nor','so','yet','both','either',
  'as','if','than','then','about','into','through','during','before',
  'after','above','below','between','out','off','over','under','again',
  'further','there','here','all','each','every','also','just','any',
])

// ── Tokenizer ───────────────────────────────────────────────────────────────
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s\-]/g, ' ')
    .split(/[\s\-]+/)
    .filter(t => t.length > 1 && !STOP_WORDS.has(t))
}

// ── Build IDF (Inverse Document Frequency) over the corpus ─────────────────
function buildIDF(docs) {
  const df = {}           // document frequency per term
  const N = docs.length

  docs.forEach(doc => {
    const terms = new Set(tokenize(doc.searchText + ' ' + doc.title))
    terms.forEach(t => { df[t] = (df[t] || 0) + 1 })
  })

  const idf = {}
  Object.keys(df).forEach(t => {
    // Smoothed IDF: log((N + 1) / (df[t] + 1)) + 1
    idf[t] = Math.log((N + 1) / (df[t] + 1)) + 1
  })
  return idf
}

// ── Compute TF-IDF sparse vector for a piece of text ──────────────────────
function tfidfVector(text, idf) {
  const tokens = tokenize(text)
  if (tokens.length === 0) return {}

  const tf = {}
  tokens.forEach(t => { tf[t] = (tf[t] || 0) + 1 })

  const vec = {}
  Object.keys(tf).forEach(t => {
    const termIdf = idf[t] || Math.log((MEDICAL_KB.length + 1) / 2) // unseen terms
    vec[t] = (tf[t] / tokens.length) * termIdf
  })
  return vec
}

// ── Cosine similarity between two sparse vectors ───────────────────────────
function cosineSimilarity(vecA, vecB) {
  let dot = 0
  let normA = 0
  let normB = 0

  Object.keys(vecA).forEach(k => {
    if (vecB[k]) dot += vecA[k] * vecB[k]
    normA += vecA[k] ** 2
  })
  Object.keys(vecB).forEach(k => {
    normB += vecB[k] ** 2
  })

  if (normA === 0 || normB === 0) return 0
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

// ── Build the index once on first use ──────────────────────────────────────
let _index = null

function buildIndex() {
  if (_index) return _index

  const idf = buildIDF(MEDICAL_KB)

  const vectors = MEDICAL_KB.map(doc => ({
    doc,
    vec: tfidfVector(doc.searchText + ' ' + doc.title + ' ' + (doc.code || '') + ' ' + doc.tags.join(' '), idf),
  }))

  _index = { idf, vectors }
  return _index
}

// ── Public search API ───────────────────────────────────────────────────────
/**
 * Search the medical knowledge base.
 * @param {string} query  - User's search query
 * @param {object} opts
 * @param {number}   opts.topK      - Max results to return (default 8)
 * @param {string[]} opts.filterTypes - Limit to specific types e.g. ['CPT','ICD10']
 * @param {number}   opts.minScore  - Minimum similarity score (default 0.05)
 * @returns {Array}  Ranked results with score attached
 */
export function search(query, { topK = 8, filterTypes = [], minScore = 0.05 } = {}) {
  if (!query || query.trim().length < 2) return []

  const { idf, vectors } = buildIndex()
  const queryVec = tfidfVector(query, idf)

  // Also boost exact code matches (e.g. typing "99213" or "I10")
  const queryUpper = query.trim().toUpperCase()
  const queryNorm  = query.trim().toLowerCase()

  let results = vectors
    .filter(({ doc }) => filterTypes.length === 0 || filterTypes.includes(doc.type))
    .map(({ doc, vec }) => {
      let score = cosineSimilarity(queryVec, vec)

      // Exact/partial code match boost
      if (doc.code) {
        const codeUpper = doc.code.toUpperCase()
        if (codeUpper === queryUpper) score = Math.max(score, 0.99)
        else if (codeUpper.startsWith(queryUpper) || queryUpper.startsWith(codeUpper.substring(0, 3))) {
          score = Math.max(score, 0.6)
        }
      }

      // Title keyword boost
      if (doc.title.toLowerCase().includes(queryNorm)) {
        score = Math.min(score + 0.15, 1.0)
      }

      // Tag exact match boost
      if (doc.tags.some(tag => tag.toLowerCase().includes(queryNorm) || queryNorm.includes(tag.toLowerCase()))) {
        score = Math.min(score + 0.1, 1.0)
      }

      return { ...doc, score }
    })
    .filter(r => r.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)

  return results
}

/**
 * Look up a single CPT or ICD-10 code exactly.
 * @param {string} code
 * @returns {object|null}
 */
export function lookupCode(code) {
  const upper = code.trim().toUpperCase()
  return MEDICAL_KB.find(doc =>
    doc.code && doc.code.toUpperCase().replace(/[.\-]/g, '') === upper.replace(/[.\-]/g, '')
  ) || null
}

/**
 * Get all entries of a specific type.
 * @param {'CPT'|'ICD10'|'INSURANCE'|'PROCEDURE'} type
 */
export function getByType(type) {
  return MEDICAL_KB.filter(doc => doc.type === type)
}

/** Return a human-readable badge label for a type */
export function typeLabel(type) {
  const labels = {
    CPT: 'CPT Code',
    ICD10: 'ICD-10',
    INSURANCE: 'Insurance',
    PROCEDURE: 'Procedure',
    DENTAL: 'Dental',
  }
  return labels[type] || type
}

/** Return a tailwind color class for each type badge */
export function typeColor(type) {
  const colors = {
    CPT:       'bg-blue-100 text-blue-700',
    ICD10:     'bg-purple-100 text-purple-700',
    INSURANCE: 'bg-green-100 text-green-700',
    PROCEDURE: 'bg-orange-100 text-orange-700',
    DENTAL:    'bg-pink-100 text-pink-700',
  }
  return colors[type] || 'bg-gray-100 text-gray-600'
}
