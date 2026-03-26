import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import { search, typeLabel, typeColor } from '../lib/vectorSearch'

const FILTER_TYPES = [
  { label: 'All', value: '' },
  { label: 'CPT Codes', value: 'CPT' },
  { label: 'ICD-10', value: 'ICD10' },
  { label: 'Insurance', value: 'INSURANCE' },
  { label: 'Procedures', value: 'PROCEDURE' },
]

const SUGGESTIONS = [
  'MRI brain', 'knee replacement', 'annual physical', 'diabetes',
  'high blood pressure', 'what is deductible', 'prior authorization',
  'colonoscopy', 'anxiety disorder', 'blood test CBC', '99213', 'I10',
]

export default function MedicalSearchScreen({ navigate }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [filterType, setFilterType] = useState('')
  const [searched, setSearched] = useState(false)
  const [expanded, setExpanded] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setSearched(false)
      return
    }
    const filterTypes = filterType ? [filterType] : []
    const r = search(query, { topK: 10, filterTypes })
    setResults(r)
    setSearched(true)
  }, [query, filterType])

  const handleSuggestion = (s) => {
    setQuery(s)
    setExpanded(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50/30">
      <Navbar navigate={navigate} />

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Medical Code Search</h1>
          <p className="text-gray-500 text-sm">
            Search CPT codes, ICD-10 diagnoses, insurance terms, and procedures using semantic similarity
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#2c6b55] bg-[#2c6b55]/10 px-3 py-1 rounded-full">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
            </svg>
            Powered by TF-IDF vector similarity — no backend required
          </div>
        </div>

        {/* Search bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setExpanded(null) }}
            placeholder="Search a code, condition, term, or procedure…"
            className="w-full pl-12 pr-10 py-4 text-base border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2c6b55]/40 focus:border-[#2c6b55] bg-white"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]); setSearched(false) }}
              className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>

        {/* Type filters */}
        <div className="flex gap-2 flex-wrap mb-6">
          {FILTER_TYPES.map(f => (
            <button
              key={f.value}
              onClick={() => setFilterType(f.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterType === f.value
                  ? 'bg-[#2c6b55] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-[#2c6b55] hover:text-[#2c6b55]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Suggestions (when no query) */}
        {!query && (
          <div className="mb-8">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Try searching for</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => handleSuggestion(s)}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-[#2c6b55] hover:text-[#2c6b55] transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {searched && results.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p className="font-medium">No results found for "<span className="text-gray-600">{query}</span>"</p>
            <p className="text-sm mt-1">Try a different term, code, or condition name</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs text-gray-400 mb-2">{results.length} result{results.length !== 1 ? 's' : ''} for "<span className="text-gray-600">{query}</span>"</p>
            {results.map(result => (
              <ResultCard
                key={result.id}
                result={result}
                expanded={expanded === result.id}
                onToggle={() => setExpanded(expanded === result.id ? null : result.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ResultCard({ result, expanded, onToggle }) {
  const scorePercent = Math.round(result.score * 100)

  return (
    <div
      className={`bg-white rounded-2xl border transition-all cursor-pointer ${
        expanded ? 'border-[#2c6b55]/40 shadow-md' : 'border-gray-100 shadow-sm hover:border-gray-200 hover:shadow'
      }`}
      onClick={onToggle}
    >
      <div className="p-4 flex items-start gap-3">
        {/* Type badge */}
        <span className={`shrink-0 mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${typeColor(result.type)}`}>
          {typeLabel(result.type)}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              {result.code && (
                <span className="text-xs font-mono text-gray-400 mr-2">{result.code}</span>
              )}
              <span className="font-semibold text-gray-900">{result.title}</span>
            </div>
            {/* Relevance indicator */}
            <div className="shrink-0 flex items-center gap-1 text-xs text-gray-400">
              <div className="w-12 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#2c6b55]/60"
                  style={{ width: `${scorePercent}%` }}
                />
              </div>
              <span>{scorePercent}%</span>
            </div>
          </div>

          {/* Short description always visible */}
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{result.description}</p>

          {/* Expanded detail */}
          {expanded && (
            <div className="mt-3 pt-3 border-t border-gray-50 space-y-2">
              {result.cost_range && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-400 w-24 shrink-0">Typical cost</span>
                  <span className="text-sm font-semibold text-[#2c6b55]">{result.cost_range}</span>
                </div>
              )}
              {result.category && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-400 w-24 shrink-0">Category</span>
                  <span className="text-sm text-gray-700">{result.category}</span>
                </div>
              )}
              {result.tags?.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-xs font-medium text-gray-400 w-24 shrink-0 mt-1">Related</span>
                  <div className="flex flex-wrap gap-1">
                    {result.tags.map(tag => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
              {result.type === 'CPT' && (
                <p className="text-xs text-gray-400 mt-2 italic">
                  CPT codes define the procedure billed. Your EOB and medical bill will list these codes.
                </p>
              )}
              {result.type === 'ICD10' && (
                <p className="text-xs text-gray-400 mt-2 italic">
                  ICD-10 codes define the diagnosis. Insurers use these to determine coverage eligibility.
                </p>
              )}
            </div>
          )}

          {/* Toggle hint */}
          <div className="mt-2 flex items-center gap-1 text-xs text-[#2c6b55]">
            <svg
              className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
            </svg>
            {expanded ? 'Show less' : 'Show details'}
          </div>
        </div>
      </div>
    </div>
  )
}
