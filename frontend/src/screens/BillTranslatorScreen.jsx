import { useState } from 'react'
import axios from 'axios'
import BottomNav from '../components/BottomNav'

const API = 'http://localhost:8000/api'

const SAMPLE_BILL = `PATIENT BILL
Date of Service: 03/15/2024
Patient: John Doe

Charges:
99214 - Office Visit        $350.00
85025 - CBC Lab Test         $89.00
93000 - EKG                 $125.00

Diagnosis: I10, E11.9

TOTAL DUE: $564.00`

export default function BillTranslatorScreen({ navigate }) {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const translate = async () => {
    setLoading(true)
    try {
      const { data } = await axios.post(`${API}/bills/translate`, { text })
      setResult(data)
    } catch (e) { alert('Error: ' + e.message) }
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
          <h1 className="text-lg font-bold text-gray-800">Medical Bill Translator</h1>
          <p className="text-xs text-gray-500">Decode every charge in plain English</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">
        {/* Input card */}
        <div className="bg-white/80 rounded-3xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-semibold text-gray-700">Paste your bill</p>
            <button onClick={() => setText(SAMPLE_BILL)}
              className="text-xs text-[#2c6b55] font-medium bg-[#e8f2e8] px-3 py-1 rounded-full">
              Load sample
            </button>
          </div>
          <textarea value={text} onChange={e => setText(e.target.value)}
            className="w-full bg-[#f7faf7] rounded-2xl p-3 text-xs font-mono h-36 resize-none outline-none text-gray-600 placeholder-gray-300"
            placeholder="Paste your medical bill text here..." />
          <button onClick={translate} disabled={loading || !text}
            className="mt-3 w-full bg-[#2c6b55] text-white rounded-2xl py-3.5 font-semibold text-sm disabled:opacity-40 active:opacity-90">
            {loading ? 'Analyzing...' : 'Translate Bill'}
          </button>
        </div>

        {/* Results */}
        {result && (
          <>
            <div className="bg-[#2c6b55]/10 border border-[#2c6b55]/20 rounded-2xl px-4 py-3">
              <p className="text-sm font-medium text-[#1a4a38]">{result.summary}</p>
            </div>

            {result.line_items?.length > 0 && (
              <div className="bg-white/80 rounded-3xl p-5 shadow-sm">
                <p className="text-sm font-semibold text-gray-700 mb-3">Procedure Breakdown</p>
                <div className="space-y-3">
                  {result.line_items.map((item, i) => (
                    <div key={i} className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-[#e8f2e8] text-[#2c6b55] text-xs px-2 py-0.5 rounded-lg font-mono font-medium">{item.code}</span>
                          <span className="text-xs text-gray-400">{item.category}</span>
                        </div>
                        <p className="text-sm text-gray-700">{item.description}</p>
                      </div>
                      <span className="text-[#2c6b55] font-bold text-sm flex-shrink-0">${item.estimated_cost.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.diagnoses?.length > 0 && (
              <div className="bg-white/80 rounded-3xl p-5 shadow-sm">
                <p className="text-sm font-semibold text-gray-700 mb-3">Diagnoses Explained</p>
                <div className="space-y-3">
                  {result.diagnoses.map((d, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-1 bg-purple-300 rounded-full flex-shrink-0"/>
                      <div>
                        <p className="text-xs text-gray-400 font-mono">{d.code}</p>
                        <p className="text-sm font-semibold text-gray-800">{d.plain_english}</p>
                        <p className="text-xs text-gray-400">{d.clinical_term}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.red_flags?.length > 0 && (
              <div className="space-y-2">
                {result.red_flags.map((flag, i) => (
                  <div key={i} className={`rounded-2xl p-4 text-sm ${
                    flag.type === 'OVERCHARGE' ? 'bg-red-50 border border-red-200' :
                    flag.type === 'DUPLICATE' ? 'bg-amber-50 border border-amber-200' :
                    'bg-blue-50 border border-blue-200'
                  }`}>
                    <p className={`font-semibold text-xs mb-1 ${
                      flag.type === 'OVERCHARGE' ? 'text-red-600' :
                      flag.type === 'DUPLICATE' ? 'text-amber-600' : 'text-blue-600'
                    }`}>{flag.type}</p>
                    <p className="text-gray-700 text-xs leading-relaxed">{flag.message}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav active="bill" navigate={navigate} />
    </div>
  )
}
