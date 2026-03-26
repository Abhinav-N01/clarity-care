import { useState } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar navigate={navigate} />
      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Insurance Decoder</h1>
          <p className="text-gray-500 mt-1">Decode your Explanation of Benefits or understand a claim denial.</p>
        </div>

        {/* Toggle */}
        <div className="bg-white border border-gray-200 rounded-2xl p-1.5 flex gap-1 mb-6 shadow-sm w-fit">
          {[{id:'eob',label:'Decode EOB'},{id:'denial',label:'Explain Denial'}].map(m => (
            <button key={m.id} onClick={() => { setMode(m.id); setResult(null) }}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                mode === m.id ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {m.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          {mode === 'eob' ? (
            <>
              <label className="text-sm font-semibold text-gray-700 block mb-3">Paste your Explanation of Benefits</label>
              <textarea value={eobText} onChange={e => setEobText(e.target.value)}
                className="w-full bg-gray-50 rounded-xl p-4 text-sm h-40 resize-none outline-none text-gray-600 placeholder-gray-300 border border-gray-100 focus:border-blue-300 transition-colors"
                placeholder="Paste your EOB text here..." />
              <button onClick={decodeEOB} disabled={loading || !eobText}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl disabled:opacity-40 transition-all active:scale-95 text-sm shadow-sm shadow-blue-200">
                {loading ? 'Decoding...' : 'Decode EOB'}
              </button>
            </>
          ) : (
            <>
              <label className="text-sm font-semibold text-gray-700 block mb-3">Enter your denial code</label>
              <div className="flex gap-3 mb-3">
                <input value={denialCode} onChange={e => setDenialCode(e.target.value)}
                  className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none text-gray-700 placeholder-gray-300 border border-gray-100 focus:border-blue-300 transition-colors"
                  placeholder="e.g. CO-4, PR-1, OA-23" />
                <input value={amount} onChange={e => setAmount(e.target.value)}
                  className="w-36 bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none text-gray-700 placeholder-gray-300 border border-gray-100 focus:border-blue-300 transition-colors"
                  placeholder="Amount ($)" type="number" />
              </div>
              <p className="text-xs text-gray-400 mb-2">Common codes — click to fill:</p>
              <div className="flex gap-2 mb-4">
                {['CO-4', 'CO-97', 'PR-1', 'PR-204', 'OA-23'].map(c => (
                  <button key={c} onClick={() => setDenialCode(c)}
                    className="bg-blue-50 text-blue-600 text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100 transition-colors">{c}</button>
                ))}
              </div>
              <button onClick={explainDenial} disabled={loading || !denialCode}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl disabled:opacity-40 transition-all active:scale-95 text-sm shadow-sm shadow-blue-200">
                {loading ? 'Looking up...' : 'Explain Denial'}
              </button>
            </>
          )}
        </div>

        {result?.type === 'eob' && (
          <div className="space-y-5">
            {result.data.decoded_terms?.length > 0 ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4">Terms Explained ({result.data.terms_found} found)</h3>
                <div className="divide-y divide-gray-100">
                  {result.data.decoded_terms.map((t, i) => (
                    <div key={i} className="py-3">
                      <p className="text-sm font-semibold text-blue-600">{t.term}</p>
                      <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{t.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
                No specific terms detected. Try including more of your EOB text (headers, sections).
              </div>
            )}
            <div className="bg-green-50 border border-green-100 rounded-xl p-5">
              <p className="font-semibold text-green-800 mb-3">Your Action Items</p>
              <ul className="space-y-2">
                {result.data.action_items?.map((a, i) => (
                  <li key={i} className="text-sm text-green-700 flex gap-2">
                    <span className="text-green-500 flex-shrink-0">✓</span>{a}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {result?.type === 'denial' && (
          <div className="space-y-5">
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <p className="text-xs font-bold text-red-500 mb-1">DENIAL CODE {result.data.code}</p>
              <p className="text-base font-bold text-red-800 mb-2">{result.data.reason}</p>
              <p className="text-sm text-red-700 leading-relaxed">{result.data.recommended_action}</p>
              <div className="flex gap-4 mt-3 text-xs text-gray-500">
                <span>Appeal success rate: <strong className="text-green-600">{result.data.success_rate}</strong></span>
                <span>Deadline: <strong>{result.data.deadline}</strong></span>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-3">Ready-to-Send Appeal Letter</h3>
              <pre className="bg-gray-50 rounded-xl p-4 text-xs whitespace-pre-wrap font-mono text-gray-600 leading-relaxed border border-gray-100">{result.data.appeal_template}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
