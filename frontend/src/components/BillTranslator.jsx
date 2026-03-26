import { useState } from 'react'
import axios from 'axios'

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

export default function BillTranslator() {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const translate = async () => {
    setLoading(true)
    try {
      const { data } = await axios.post(`${API}/bills/translate`, { text })
      setResult(data)
    } catch (e) {
      alert('Error: ' + e.message)
    }
    setLoading(false)
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1">Medical Bill Translator</h2>
      <p className="text-gray-500 text-sm mb-4">Paste your bill text and we'll decode every charge in plain English.</p>

      <button
        onClick={() => setText(SAMPLE_BILL)}
        className="text-xs text-blue-600 underline mb-2 block"
      >
        Load sample bill
      </button>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        className="w-full border rounded-lg p-3 h-40 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Paste your medical bill here..."
      />

      <button
        onClick={translate}
        disabled={loading || !text}
        className="mt-3 bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 disabled:opacity-50"
      >
        {loading ? 'Analyzing...' : 'Translate Bill'}
      </button>

      {result && (
        <div className="mt-6 space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="font-medium text-blue-800">{result.summary}</p>
          </div>

          {result.line_items?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Procedure Breakdown</h3>
              <div className="space-y-2">
                {result.line_items.map((item, i) => (
                  <div key={i} className="border rounded-lg p-3 flex justify-between items-start">
                    <div>
                      <span className="bg-gray-100 text-xs px-2 py-0.5 rounded font-mono">{item.code}</span>
                      <span className="ml-2 text-xs text-gray-500">{item.category}</span>
                      <p className="text-sm mt-1">{item.description}</p>
                    </div>
                    <span className="text-green-700 font-medium text-sm">${item.estimated_cost.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.diagnoses?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Diagnoses (Plain English)</h3>
              {result.diagnoses.map((d, i) => (
                <div key={i} className="border-l-4 border-purple-400 pl-3 mb-2">
                  <span className="font-mono text-xs text-gray-500">{d.code}</span>
                  <p className="text-sm"><strong>{d.plain_english}</strong></p>
                  <p className="text-xs text-gray-500">{d.clinical_term}</p>
                </div>
              ))}
            </div>
          )}

          {result.red_flags?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Alerts</h3>
              {result.red_flags.map((flag, i) => (
                <div key={i} className={`rounded-lg p-3 text-sm ${
                  flag.type === 'OVERCHARGE' ? 'bg-red-50 border border-red-200 text-red-800' :
                  flag.type === 'DUPLICATE' ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' :
                  'bg-blue-50 border border-blue-200 text-blue-800'
                }`}>
                  <strong>{flag.type}:</strong> {flag.message}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
