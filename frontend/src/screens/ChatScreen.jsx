import { useState, useRef, useEffect } from 'react'
import { getResponse } from '../lib/chatResponder'
import Navbar from '../components/Navbar'

const SUGGESTIONS = [
  "How much does tooth surgery cost?",
  "What is an EOB?",
  "How do I appeal a denied claim?",
  "What does CO-97 mean?",
  "How to lower my medical bill?",
  "What's the cost of an MRI?",
]

export default function ChatScreen({ navigate, user }) {
  const firstName = user?.name || 'Abhi'
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Hello ${firstName}! I'm Clarity, your AI health billing assistant. Ask me anything about medical costs, insurance terms, or bill disputes.`
  }])
  const [input, setInput] = useState('')
  const bottomRef = useRef()

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = (text) => {
    const userMsg = text || input
    if (!userMsg.trim()) return
    const response = getResponse(userMsg)
    setMessages(m => [...m, { role: 'user', content: userMsg }, { role: 'assistant', content: response }])
    setInput('')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar navigate={navigate} />

      <div className="flex-1 flex max-w-4xl mx-auto w-full px-6 py-8 gap-6">
        {/* Sidebar */}
        <div className="hidden lg:flex flex-col w-72 flex-shrink-0 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <img src={`${import.meta.env.BASE_URL}doctor.png`} alt="Doctor" className="w-full rounded-xl object-cover mb-4 max-h-52 object-top" />
            <h3 className="font-bold text-gray-800">Clarity Care AI</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Ask anything — "What is covered if I break a tooth?" or "How much does an MRI cost?"
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400"/>
              <span className="text-xs text-green-600 font-medium">Ready to help</span>
            </div>
          </div>
          <div className="bg-blue-500 rounded-2xl p-5 text-white shadow-sm shadow-blue-200">
            <p className="font-bold mb-1">Know Before You Go</p>
            <p className="text-xs opacity-80 leading-relaxed">No more unexpected medical bills. Ask about any procedure cost before your visit.</p>
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Clarity Care" className="w-9 h-9 rounded-xl object-contain" />
            <div>
              <p className="font-bold text-gray-800 text-sm">Clarity Care AI</p>
              <p className="text-xs text-gray-400">Medical billing & insurance assistant</p>
            </div>
          </div>

          {messages.length <= 1 && (
            <div className="px-6 pt-4 flex flex-wrap gap-2">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)}
                  className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-medium hover:bg-blue-100 transition-colors border border-blue-100">
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4" style={{maxHeight:'60vh'}}>
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <img src={`${import.meta.env.BASE_URL}logo.png`} alt="" className="w-7 h-7 rounded-lg object-contain flex-shrink-0 mt-0.5" />
                )}
                <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                  m.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-sm shadow-sm shadow-blue-200'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="px-6 py-4 border-t border-gray-100">
            <div className="flex gap-3 items-center bg-gray-50 rounded-xl px-4 py-2 border border-gray-100 focus-within:border-blue-300 transition-colors">
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400 py-1"
                placeholder="Ask about your bill, insurance, or costs..." />
              <button onClick={() => send()} disabled={!input}
                className="w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center justify-center disabled:opacity-40 flex-shrink-0 transition-colors active:scale-90">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
