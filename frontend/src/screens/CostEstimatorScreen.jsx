import { useState } from 'react'
import axios from 'axios'
import BottomNav from '../components/BottomNav'

const API = 'http://localhost:8000/api'

const PROCEDURES = [
  { code: '99213', name: 'Office Visit (Low Complexity)' },
  { code: '99214', name: 'Office Visit (Moderate Complexity)' },
  { code: '93000', name: 'Electrocardiogram (EKG)' },
  { code: '85025', name: 'Complete Blood Count (CBC)' },
  { code: '71046', name: 'Chest X-Ray (2 views)' },
  { code: '70553', name: 'MRI Brain with Contrast' },
  { code: '27447', name: 'Total Knee Replacement' },
  { code: '90837', name: 'Psychotherapy (60 min)' },
]

export default function CostEstimatorScreen({ navigate }) {
  const [form, setForm] = useState({ cpt_code: '99213', insurance_type: 'PPO', facility_type: 'Clinic', age: 35, zip_code: '10001' })
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
    <div className="screen bg-[#c4d5c0] flex flex-col">
      {/* Header */}
      <div className="px-6 pt-14 pb-5 flex items-center gap-3">
        <button onClick={() => navigate('home')} className="w-9 h-9 bg-white/60 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-800">Treatment Cost Estimator</h1>
          <p className="text-xs text-gray-500">Know your costs before you go</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">
        <div className="bg-white/80 rounded-3xl p-5 shadow-sm space-y-4">

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Procedure</label>
            <select value={form.cpt_code} onChange={e => set('cpt_code', e.target.value)}
              className="mt-2 w-full bg-[#f7faf7] rounded-2xl px-4 py-3 text-sm outline-none text-gray-700 appearance-none">
              {PROCEDURES.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Insurance</label>
              <select value={form.insurance_type} onChange={e => set('insurance_type', e.target.value)}
                className="mt-2 w-full bg-[#f7faf7] rounded-2xl px-3 py-3 text-sm outline-none text-gray-700 appearance-none">
                {['PPO', 'HMO', 'HDHP', 'Medicare', 'Medicaid'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Facility</label>
              <select value={form.facility_type} onChange={e => set('facility_type', e.target.value)}
                className="mt-2 w-full bg-[#f7faf7] rounded-2xl px-3 py-3 text-sm outline-none text-gray-700 appearance-none">
                {['Hospital', 'Outpatient', 'Clinic'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Age</label>
              <input type="number" value={form.age} onChange={e => set('age', parseInt(e.target.value))} min={18} max={99}
                className="mt-2 w-full bg-[#f7faf7] rounded-2xl px-4 py-3 text-sm outline-none text-gray-700" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">ZIP Code</label>
              <input value={form.zip_code} onChange={e => set('zip_code', e.target.value)}
                className="mt-2 w-full bg-[#f7faf7] rounded-2xl px-4 py-3 text-sm outline-none text-gray-700"
                placeholder="10001" />
            </div>
          </div>

          <button onClick={predict} disabled={loading}
            className="w-full bg-[#2c6b55] text-white rounded-2xl py-4 font-semibold text-sm disabled:opacity-40 active:opacity-90">
            {loading ? 'Estimating...' : 'Estimate My Cost'}
          </button>
        </div>

        {result && (
          <>
            {/* Main cost card */}
            <div className="bg-[#2c6b55] rounded-3xl p-6 text-center text-white shadow-lg">
              <p className="text-sm opacity-70 mb-1">Estimated Out-of-Pocket</p>
              <p className="text-5xl font-bold my-3">${result.predicted_patient_cost?.toLocaleString()}</p>
              <p className="text-sm opacity-70">Range: ${result.low_estimate?.toLocaleString()} – ${result.high_estimate?.toLocaleString()}</p>
              <p className="text-xs opacity-50 mt-1">{result.confidence}</p>
            </div>

            {/* Procedure info */}
            <div className="bg-white/80 rounded-3xl p-5 shadow-sm">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Procedure</p>
              <p className="text-sm font-semibold text-gray-800">{result.procedure}</p>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-gray-500">National avg total cost</p>
                <p className="text-sm font-bold text-gray-700">${result.national_avg_total?.toLocaleString()}</p>
              </div>
            </div>

            {/* Tips */}
            {result.tips?.length > 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">Cost-Saving Tips</p>
                <ul className="space-y-2">
                  {result.tips.map((t, i) => (
                    <li key={i} className="text-xs text-amber-800 flex gap-2">
                      <span className="mt-0.5 text-amber-500">•</span><span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav active="cost" navigate={navigate} />
    </div>
  )
}
