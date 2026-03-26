import { useState } from 'react'
import axios from 'axios'
import BottomNav from '../components/BottomNav'

const API = 'http://localhost:8000/api'

export default function InsuranceDecoderScreen({ navigate }) {
  const [mode, setMode] = useState('eob')
  const [eobText, setEobText] = useState('')
  const [denialCode, setDenialCode] = useState('')
  const [amount, setAmount] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const decodeEOB = async () => {
    setLoading(true)
    try {
      const { data } = await axios.post(`${API}/insurance/decode-eob`, { text: eobText, plan_type: 'PPO' })
      setResult({ type: 'eob', data })
    } catch (e) { alert(e.message) }
    setLoading(false)
  }

  const explainDenial = async () => {
    setLoading(true)
    try {
      const { data } = await axios.post(`${API}/insurance/explain-denial`, {
        denial_code: denialCode,
        amount_denied: parseFloat(amount) || 0
      })
      setResult({ type: 'denial', data })
    } catch (e) { alert(e.message) }
    setLoading(false)
  }

  return (
    <div className="screen bg-[#c4d5c0] flex flex-col">
      {/* Header */}
      <div className="px-6 pt-14 pb-5 flex items-center gap-3">
        <button onClick={() => navigate('home')} className="w-9 h-9 bg-white/60 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-800">Insurance Decoder</h1>
          <p className="text-xs text-gray-500">Decode EOBs and denial letters</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">
        {/* Toggle */}
        <div className="bg-white/50 rounded-2xl p-1 flex gap-1">
          {[{id:'eob',label:'Decode EOB'},{id:'denial',label:'Explain Denial'}].map(m => (
            <button key={m.id} onClick={() => { setMode(m.id); setResult(null) }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                mode === m.id ? 'bg-[#2c6b55] text-white shadow-sm' : 'text-gray-500'
              }`}>
              {m.label}
            </button>
          ))}
        </div>

        {mode === 'eob' ? (
          <div className="bg-white/80 rounded-3xl p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-700 mb-3">Paste your EOB</p>
            <textarea value={eobText} onChange={e => setEobText(e.target.value)}
              className="w-full bg-[#f7faf7] rounded-2xl p-3 text-xs h-36 resize-none outline-none text-gray-600 placeholder-gray-300"
              placeholder="Paste your Explanation of Benefits here..." />
            <button onClick={decodeEOB} disabled={loading || !eobText}
              className="mt-3 w-full bg-[#2c6b55] text-white rounded-2xl py-3.5 font-semibold text-sm disabled:opacity-40">
              {loading ? 'Decoding...' : 'Decode EOB'}
            </button>
          </div>
        ) : (
          <div className="bg-white/80 rounded-3xl p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-700 mb-3">Enter denial details</p>
            <input value={denialCode} onChange={e => setDenialCode(e.target.value)}
              className="w-full bg-[#f7faf7] rounded-2xl px-4 py-3 text-sm outline-none text-gray-700 placeholder-gray-300 mb-3"
              placeholder="Denial code (e.g. CO-4, PR-1)" />
            <input value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full bg-[#f7faf7] rounded-2xl px-4 py-3 text-sm outline-none text-gray-700 placeholder-gray-300 mb-4"
              placeholder="Amount denied ($)" type="number" />
            <p className="text-xs text-gray-400 mb-2">Common codes</p>
            <div className="flex gap-2 flex-wrap mb-4">
              {['CO-4', 'CO-97', 'PR-1', 'PR-204'].map(c => (
                <button key={c} onClick={() => setDenialCode(c)}
                  className="bg-[#e8f2e8] text-[#2c6b55] text-xs px-3 py-1.5 rounded-xl font-medium">{c}</button>
              ))}
            </div>
            <button onClick={explainDenial} disabled={loading || !denialCode}
              className="w-full bg-[#2c6b55] text-white rounded-2xl py-3.5 font-semibold text-sm disabled:opacity-40">
              {loading ? 'Looking up...' : 'Explain Denial'}
            </button>
          </div>
        )}

        {/* EOB Results */}
        {result?.type === 'eob' && (
          <>
            {result.data.decoded_terms?.length > 0 ? (
              <div className="bg-white/80 rounded-3xl p-5 shadow-sm">
                <p className="text-sm font-semibold text-gray-700 mb-3">Terms Explained ({result.data.terms_found} found)</p>
                <div className="space-y-3">
                  {result.data.decoded_terms.map((t, i) => (
                    <div key={i} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                      <p className="text-sm font-semibold text-[#2c6b55]">{t.term}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{t.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-700">
                No specific terms detected. Try pasting more of your EOB text including headers.
              </div>
            )}
            <div className="bg-[#e8f2e8] rounded-2xl p-4">
              <p className="text-sm font-semibold text-[#1a4a38] mb-2">Action Items</p>
              <ul className="space-y-1.5">
                {result.data.action_items?.map((a, i) => (
                  <li key={i} className="text-xs text-[#2c6b55] flex gap-2">
                    <span className="mt-0.5">•</span><span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Denial Results */}
        {result?.type === 'denial' && (
          <>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <p className="text-xs font-bold text-red-500 mb-1">Code {result.data.code}</p>
              <p className="text-sm font-semibold text-red-800 mb-1">{result.data.reason}</p>
              <p className="text-xs text-red-600 leading-relaxed">{result.data.recommended_action}</p>
              <div className="flex gap-3 mt-2 text-xs text-gray-400">
                <span>Success: {result.data.success_rate}</span>
              </div>
            </div>
            <div className="bg-white/80 rounded-3xl p-5 shadow-sm">
              <p className="text-sm font-semibold text-gray-700 mb-3">Appeal Letter Template</p>
              <pre className="bg-[#f7faf7] rounded-2xl p-4 text-xs whitespace-pre-wrap font-mono text-gray-600 leading-relaxed">{result.data.appeal_template}</pre>
            </div>
          </>
        )}
      </div>

      <BottomNav active="insurance" navigate={navigate} />
    </div>
  )
}
