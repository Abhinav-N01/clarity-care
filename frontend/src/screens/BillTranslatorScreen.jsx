import { useState } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar navigate={navigate} />
      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Medical Bill Translator</h1>
          <p className="text-gray-500 mt-1">Paste your bill below — we'll decode every code and charge in plain English.</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-semibold text-gray-700">Your bill text</label>
            <button onClick={() => setText(SAMPLE_BILL)}
              className="text-xs text-blue-500 font-medium bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
              Load sample bill
            </button>
          </div>
          <textarea value={text} onChange={e => setText(e.target.value)}
            className="w-full bg-gray-50 rounded-xl p-4 text-sm font-mono h-44 resize-none outline-none text-gray-600 placeholder-gray-300 border border-gray-100 focus:border-blue-300 transition-colors"
            placeholder="Paste your medical bill here..." />
          <button onClick={translate} disabled={loading || !text}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl disabled:opacity-40 transition-all active:scale-95 text-sm shadow-sm shadow-blue-200">
            {loading ? 'Analyzing...' : 'Translate Bill'}
          </button>
        </div>

        {result && (
          <div className="space-y-5">
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-3">
              <p className="text-sm font-medium text-blue-800">{result.summary}</p>
            </div>

            {result.line_items?.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4">Procedure Breakdown</h3>
                <div className="divide-y divide-gray-100">
                  {result.line_items.map((item, i) => (
                    <div key={i} className="flex items-start justify-between py-3 gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-lg font-mono font-semibold">{item.code}</span>
                          <span className="text-xs text-gray-400">{item.category}</span>
                        </div>
                        <p className="text-sm text-gray-700">{item.description}</p>
                      </div>
                      <span className="text-green-600 font-bold text-sm flex-shrink-0">${item.estimated_cost.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.diagnoses?.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4">Diagnoses in Plain English</h3>
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
              <div className="space-y-3">
                {result.red_flags.map((flag, i) => (
                  <div key={i} className={`rounded-xl p-4 ${
                    flag.type === 'OVERCHARGE' ? 'bg-red-50 border border-red-200' :
                    flag.type === 'DUPLICATE' ? 'bg-amber-50 border border-amber-200' :
                    'bg-blue-50 border border-blue-200'
                  }`}>
                    <p className={`font-bold text-xs mb-1 ${
                      flag.type === 'OVERCHARGE' ? 'text-red-600' :
                      flag.type === 'DUPLICATE' ? 'text-amber-600' : 'text-blue-600'
                    }`}>{flag.type}</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{flag.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
