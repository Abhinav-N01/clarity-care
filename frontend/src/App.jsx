import { useState } from 'react'
import BillTranslator from './components/BillTranslator'
import InsuranceDecoder from './components/InsuranceDecoder'
import CostPredictor from './components/CostPredictor'
import ChatBot from './components/ChatBot'

const tabs = [
  { id: 'bill', label: 'Bill Translator', icon: '📄' },
  { id: 'insurance', label: 'Insurance Decoder', icon: '🛡️' },
  { id: 'cost', label: 'Cost Predictor', icon: '💰' },
  { id: 'chat', label: 'AI Assistant', icon: '💬' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('bill')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-700 text-white p-4 shadow-lg">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold">Clarity Care</h1>
          <p className="text-blue-200 text-sm">AI-Powered Health Billing Assistant</p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-4">
        <div className="flex gap-2 mb-6 bg-white rounded-lg p-1 shadow">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-700 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          {activeTab === 'bill' && <BillTranslator />}
          {activeTab === 'insurance' && <InsuranceDecoder />}
          {activeTab === 'cost' && <CostPredictor />}
          {activeTab === 'chat' && <ChatBot />}
        </div>
      </div>
    </div>
  )
}
