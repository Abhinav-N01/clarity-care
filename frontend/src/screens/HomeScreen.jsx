import { useState } from 'react'
import BottomNav from '../components/BottomNav'

const services = [
  {
    id: 'insurance',
    label: 'Insurance Decoder',
    description: 'Decode EOBs and denial letters',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  },
  {
    id: 'bill',
    label: 'Medical Bill Translator',
    description: 'Understand every charge on your bill',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  {
    id: 'cost',
    label: 'Treatment Cost Estimator',
    description: 'Know your costs before you go',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    id: 'chat',
    label: 'Chat Assistant',
    description: 'Ask anything about your coverage',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    )
  },
]

export default function HomeScreen({ navigate, user }) {
  const [search, setSearch] = useState('')
  const firstName = user?.name?.split(' ')[0] || 'Alex'

  const filtered = services.filter(s =>
    s.label.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="screen bg-[#c4d5c0] flex flex-col">
      {/* Header */}
      <div className="px-6 pt-14 pb-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Clarity Care" className="w-10 h-10 rounded-full object-cover shadow-md" />
            <div>
              <p className="text-xs text-gray-500">Good morning</p>
              <h1 className="text-xl font-bold text-gray-800">Hello {firstName}!</h1>
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-white/60 flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 mb-6">
        <div className="bg-white/70 rounded-2xl flex items-center px-4 py-3.5 gap-3 shadow-sm">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-sm text-gray-600 outline-none flex-1 placeholder-gray-400"
            placeholder="Start typing..."
          />
        </div>
      </div>

      {/* Services */}
      <div className="flex-1 px-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Services</p>
        <div className="space-y-3">
          {filtered.map(service => (
            <button
              key={service.id}
              onClick={() => navigate(service.id)}
              className="w-full bg-white/80 backdrop-blur-sm rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#e8f2e8] flex items-center justify-center text-[#2c6b55]">
                  {service.icon}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-800 text-sm">{service.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{service.description}</p>
                </div>
              </div>
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <BottomNav active="home" navigate={navigate} />
    </div>
  )
}
