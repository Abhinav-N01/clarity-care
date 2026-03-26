import { useState } from 'react'
import axios from 'axios'

const API = 'http://localhost:8000/api'

export default function InsuranceDecoder() {
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
    <div>
      <h2 className="text-xl font-semibold mb-1">Insurance Decoder</h2>
      <p className="text-gray-500 text-sm mb-4">Decode EOBs and insurance denial letters.</p>

      <div className="flex gap-2 mb-4">
        {['eob', 'denial'].map(m => (
          <button key={m} onClick={() => { setMode(m); setResult(null) }}
            className={`px-4 py-1.5 rounded-full text-sm ${mode === m ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-600'}`}>
            {m === 'eob' ? 'Decode EOB' : 'Explain Denial'}
          </button>
        ))}
      </div>

      {mode === 'eob' ? (
        <>
          <textarea value={eobText} onChange={e => setEobText(e.target.value)}
            className="w-full border rounded-lg p-3 h-36 text-sm resize-none focus:ring-2 focus:ring-blue-400 focus:outline-none"
            placeholder="Paste your Explanation of Benefits text here..." />
          <button onClick={decodeEOB} disabled={loading || !eobText}
            className="mt-3 bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 disabled:opacity-50">
            {loading ? 'Decoding...' : 'Decode EOB'}
          </button>
        </>
      ) : (
        <>
          <div className="flex gap-3 mb-3">
            <input value={denialCode} onChange={e => setDenialCode(e.target.value)}
              className="border rounded-lg p-2 text-sm flex-1 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder="Denial code (e.g. CO-4, PR-1)" />
            <input value={amount} onChange={e => setAmount(e.target.value)}
              className="border rounded-lg p-2 text-sm w-32 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder="Amount ($)" type="number" />
          </div>
          <div className="flex gap-2 text-xs text-gray-500 mb-3">
            {['CO-4', 'CO-97', 'PR-1', 'PR-204'].map(c => (
              <button key={c} onClick={() => setDenialCode(c)}
                className="bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">{c}</button>
            ))}
          </div>
          <button onClick={explainDenial} disabled={loading || !denialCode}
            className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 disabled:opacity-50">
            {loading ? 'Looking up...' : 'Explain Denial'}
          </button>
        </>
      )}

      {result?.type === 'eob' && (
        <div className="mt-6 space-y-4">
          {result.data.decoded_terms?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Terms Explained ({result.data.terms_found} found)</h3>
              <div className="space-y-2">
                {result.data.decoded_terms.map((t, i) => (
                  <div key={i} className="border rounded-lg p-3">
                    <p className="font-medium text-sm text-blue-800">{t.term}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{t.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">Action Items</h3>
            <ul className="text-sm text-green-700 space-y-1">
              {result.data.action_items?.map((a, i) => <li key={i}>• {a}</li>)}
            </ul>
          </div>
        </div>
      )}

      {result?.type === 'denial' && (
        <div className="mt-6 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="font-semibold text-red-800">Code {result.data.code}: {result.data.reason}</p>
            <p className="text-sm text-red-700 mt-1">{result.data.recommended_action}</p>
            <p className="text-xs text-gray-500 mt-2">Success rate: {result.data.success_rate} • Deadline: {result.data.deadline}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Appeal Letter Template</h3>
            <pre className="bg-gray-50 border rounded-lg p-4 text-xs whitespace-pre-wrap font-mono">{result.data.appeal_template}</pre>
          </div>
        </div>
      )}
    </div>
  )
}
