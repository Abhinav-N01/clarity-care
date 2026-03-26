import { useState } from 'react'
import { estimateCost } from '../lib/costEstimator'
import Navbar from '../components/Navbar'

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

  const predict = () => setResult(estimateCost(form))
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar navigate={navigate} />
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Treatment Cost Estimator</h1>
          <p className="text-gray-500 mt-1">Know your out-of-pocket costs before you go. No surprises.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-800 mb-5">Your Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Procedure</label>
                <select value={form.cpt_code} onChange={e => set('cpt_code', e.target.value)}
                  className="mt-1.5 w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none text-gray-700 focus:border-blue-300 transition-colors">
                  {PROCEDURES.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Insurance</label>
                  <select value={form.insurance_type} onChange={e => set('insurance_type', e.target.value)}
                    className="mt-1.5 w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-sm outline-none text-gray-700 focus:border-blue-300 transition-colors">
                    {['PPO','HMO','HDHP','Medicare','Medicaid'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Facility</label>
                  <select value={form.facility_type} onChange={e => set('facility_type', e.target.value)}
                    className="mt-1.5 w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-sm outline-none text-gray-700 focus:border-blue-300 transition-colors">
                    {['Hospital','Outpatient','Clinic'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Age</label>
                  <input type="number" value={form.age} onChange={e => set('age', parseInt(e.target.value))} min={18} max={99}
                    className="mt-1.5 w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-300 transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">ZIP Code</label>
                  <input value={form.zip_code} onChange={e => set('zip_code', e.target.value)}
                    className="mt-1.5 w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-300 transition-colors"
                    placeholder="10001" />
                </div>
              </div>
              <button onClick={predict}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3.5 rounded-xl transition-all active:scale-95 text-sm shadow-sm shadow-blue-200 mt-2">
                Estimate My Cost
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {result ? (
              <>
                <div className="bg-blue-500 rounded-2xl p-8 text-center text-white shadow-lg shadow-blue-200">
                  <p className="text-sm opacity-80 mb-1">Estimated Out-of-Pocket</p>
                  <p className="text-6xl font-extrabold my-3">${result.predicted_patient_cost?.toLocaleString()}</p>
                  <p className="text-sm opacity-70">Range: ${result.low_estimate?.toLocaleString()} – ${result.high_estimate?.toLocaleString()}</p>
                  <p className="text-xs opacity-50 mt-1">{result.confidence}</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Procedure</p>
                  <p className="font-semibold text-gray-800">{result.procedure}</p>
                  <div className="flex justify-between mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-500">National avg total cost</p>
                    <p className="font-bold text-gray-700">${result.national_avg_total?.toLocaleString()}</p>
                  </div>
                </div>
                {result.tips?.length > 0 && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-3">Money-Saving Tips</p>
                    <ul className="space-y-2">
                      {result.tips.map((t, i) => (
                        <li key={i} className="text-sm text-amber-800 flex gap-2"><span className="text-amber-500 flex-shrink-0">💡</span>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col items-center justify-center h-full text-center">
                <div className="text-5xl mb-4">💰</div>
                <p className="font-semibold text-gray-700 mb-1">Your cost estimate will appear here</p>
                <p className="text-sm text-gray-400">Fill in the form and click "Estimate My Cost"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
