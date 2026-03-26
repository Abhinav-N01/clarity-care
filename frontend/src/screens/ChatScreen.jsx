import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import BottomNav from '../components/BottomNav'

const API = 'http://localhost:8000/api'

const SUGGESTIONS = [
  "What is an EOB?",
  "How do I appeal a denied claim?",
  "What does CO-97 mean?",
  "How to lower my bill?",
]

export default function ChatScreen({ navigate, user }) {
  const firstName = user?.name?.split(' ')[0] || 'Alex'
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Hello ${firstName}! What do you need help with today?`
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (text) => {
    const userMsg = text || input
    if (!userMsg.trim()) return
    const newMessages = [...messages, { role: 'user', content: userMsg }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    try {
      const { data } = await axios.post(`${API}/chat/message`, { messages: newMessages })
      setMessages(m => [...m, { role: 'assistant', content: data.response }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again." }])
    }
    setLoading(false)
  }

  return (
    <div className="screen bg-[#c4d5c0] flex flex-col">
      {/* Header */}
      <div className="px-6 pt-14 pb-4 flex items-center gap-3">
        <button onClick={() => navigate('home')} className="w-9 h-9 bg-white/60 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-800">Clarity Care AI</h1>
          <p className="text-xs text-gray-500">Ask any questions like "What is covered in my insurance if I break a tooth?" or "Am I covered for an MRI?"</p>
        </div>
      </div>

      {/* Doctor avatar card */}
      <div className="mx-6 mb-4 bg-white/80 rounded-3xl overflow-hidden shadow-sm flex">
        <div className="flex-1 p-4">
          <div className="bg-[#e8f2e8] text-[#2c6b55] rounded-xl px-3 py-2 text-sm max-w-[180px] leading-snug shadow-sm mb-2">
            {messages[messages.length - 1]?.role === 'assistant'
              ? messages[messages.length - 1].content.slice(0, 80) + (messages[messages.length - 1].content.length > 80 ? '...' : '')
              : `Hello ${firstName}! What do you need help with today?`}
          </div>
          <div className="mt-2 bg-[#2c6b55] text-white text-xs rounded-xl px-3 py-2 leading-snug">
            Know Before you go, No more unexpected Medical Bills
          </div>
        </div>
        {/* Doctor avatar placeholder */}
        <div className="w-28 flex-shrink-0 bg-gradient-to-b from-[#d4e8d4] to-[#b8d4b8] flex items-end justify-center pt-4">
          <svg viewBox="0 0 80 100" className="w-24 h-28" fill="none">
            <ellipse cx="40" cy="30" rx="18" ry="20" fill="#f5d5b8"/>
            <path d="M15 100 Q15 65 40 60 Q65 65 65 100Z" fill="white"/>
            <path d="M25 60 Q40 70 55 60" stroke="#ddd" strokeWidth="1" fill="none"/>
            <ellipse cx="40" cy="30" rx="18" ry="20" fill="#f5d5b8"/>
            <circle cx="33" cy="28" r="2.5" fill="#7a4a2a"/>
            <circle cx="47" cy="28" r="2.5" fill="#7a4a2a"/>
            <path d="M35 36 Q40 40 45 36" stroke="#c4846a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <path d="M22 22 Q30 12 40 14 Q50 12 58 22" fill="#5a3520"/>
            <rect x="33" y="55" width="14" height="6" rx="3" fill="#2c6b55"/>
            <circle cx="28" cy="75" r="6" fill="#e8e8e8"/>
            <circle cx="52" cy="75" r="6" fill="#e8e8e8"/>
            <path d="M34 75 Q40 72 46 75" stroke="#2c6b55" strokeWidth="1.5" fill="none"/>
          </svg>
        </div>
      </div>

      {/* Suggestion chips */}
      {messages.length <= 1 && (
        <div className="px-6 mb-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => send(s)}
              className="text-xs bg-white/70 text-gray-600 px-3 py-1.5 rounded-full shadow-sm active:opacity-80">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 space-y-3 pb-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
              m.role === 'user'
                ? 'bg-[#2c6b55] text-white rounded-br-sm'
                : 'bg-white/80 text-gray-800 rounded-bl-sm'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/80 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
              <div className="flex gap-1 items-center">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay:'0ms'}}/>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay:'150ms'}}/>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay:'300ms'}}/>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 pb-4 pt-2">
        <div className="flex gap-2 bg-white/80 rounded-2xl px-4 py-2 shadow-sm items-center">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400 py-1"
            placeholder="Ask about your bill or coverage..." />
          <button onClick={() => send()} disabled={loading || !input}
            className="w-8 h-8 bg-[#2c6b55] rounded-xl flex items-center justify-center disabled:opacity-40 flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>

      <BottomNav active="chat" navigate={navigate} />
    </div>
  )
}
