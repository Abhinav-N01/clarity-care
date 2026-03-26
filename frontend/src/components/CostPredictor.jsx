import { useState } from 'react'
import axios from 'axios'

const API = 'http://localhost:8000/api'

const PROCEDURES = [
  { code: '99213', name: 'Office Visit (Low)' },
  { code: '99214', name: 'Office Visit (Moderate)' },
  { code: '93000', name: 'EKG' },
  { code: '85025', name: 'CBC Blood Test' },
  { code: '71046', name: 'Chest X-Ray' },
  { code: '70553', name: 'MRI Brain' },
  { code: '27447', name: 'Knee Replacement' },
  { code: '90837', name: 'Psychotherapy 60min' },
]

export default function CostPredictor() {
  const [form, setForm] = useState({
    cpt_code: '99213', insurance_type: 'PPO',
    facility_type: 'Clinic', age: 35, zip_code: '10001'
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const predict = async () => {
    setLoading(true)
    try {
      const { data } = await axios.post(`${API}/predict/cost`, form)
      setResult(data)
    } catch (e) { alert(e.message) }
    setLoading(false)
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1">Cost Predictor</h2>
      <p className="text-gray-500 text-sm mb-4">Estimate your out-of-pocket cost before getting care.</p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Procedure</label>
          <select value={form.cpt_code} onChange={e => set('cpt_code', e.target.value)}
            className="mt-1 w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none">
            {PROCEDURES.map(p => <option key={p.code} value={p.code}>{p.name} ({p.code})</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Insurance Type</label>
          <select value={form.insurance_type} onChange={e => set('insurance_type', e.target.value)}
            className="mt-1 w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none">
            {['PPO', 'HMO', 'HDHP', 'Medicare', 'Medicaid'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Facility Type</label>
          <select value={form.facility_type} onChange={e => set('facility_type', e.target.value)}
            className="mt-1 w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none">
            {['Hospital', 'Outpatient', 'Clinic'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Your Age</label>
          <input type="number" value={form.age} onChange={e => set('age', parseInt(e.target.value))}
            min={18} max={99}
            className="mt-1 w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
        </div>
        <div className="col-span-2">
          <label className="text-sm font-medium text-gray-700">ZIP Code</label>
          <input value={form.zip_code} onChange={e => set('zip_code', e.target.value)}
            className="mt-1 w-48 border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            placeholder="e.g. 10001" />
        </div>
      </div>

      <button onClick={predict} disabled={loading}
        className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 disabled:opacity-50">
        {loading ? 'Predicting...' : 'Predict My Cost'}
      </button>

      {result && (
        <div className="mt-6 space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 text-center">
            <p className="text-gray-500 text-sm">Estimated Out-of-Pocket</p>
            <p className="text-4xl font-bold text-blue-800 my-2">${result.predicted_patient_cost?.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Range: ${result.low_estimate?.toLocaleString()} – ${result.high_estimate?.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">{result.confidence}</p>
          </div>

          <div className="border rounded-lg p-4 text-sm">
            <p className="font-medium mb-2">For: {result.procedure}</p>
            <p className="text-gray-500">National avg total cost: <strong>${result.national_avg_total?.toLocaleString()}</strong></p>
          </div>

          {result.tips?.length > 0 && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="font-semibold text-yellow-800 mb-2">Cost-Saving Tips</p>
              <ul className="text-sm text-yellow-700 space-y-1">
                {result.tips.map((t, i) => <li key={i}>• {t}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
