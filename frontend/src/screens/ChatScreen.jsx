import { logo, doctor } from '../assets/images.js'
import { useState, useRef, useEffect } from 'react'
import { getResponse } from '../lib/chatResponder'
import Navbar from '../components/Navbar'

const INITIAL_SUGGESTIONS = [
  "How much does tooth surgery cost?",
  "What is a deductible?",
  "How do I appeal a denied claim?",
  "How do I save on prescriptions?",
  "What's the cost of an MRI?",
  "What is an EOB?",
]

// Render response content with basic markdown (bold, bullet points)
function MessageContent({ content }) {
  const lines = content.split('\n')
  return (
    <div className="space-y-0.5">
      {lines.map((line, i) => {
        if (!line) return <div key={i} className="h-2" />
        // Bold: **text**
        const parts = line.split(/\*\*(.*?)\*\*/g)
        const rendered = parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)
        // Bullet lines
        if (line.startsWith('• ') || line.startsWith('- ')) {
          return <div key={i} className="flex gap-1.5"><span className="mt-1 shrink-0">•</span><span>{rendered.slice(line.startsWith('• ') ? 1 : 1)}</span></div>
        }
        return <div key={i}>{rendered}</div>
      })}
    </div>
  )
}

export default function ChatScreen({ navigate, user }) {
  const firstName = user?.name || 'Abhi'
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Hello ${firstName}! I'm Clarity, your AI health assistant.\n\nAsk me anything — procedure costs, prescription savings, insurance terms, CPT codes, denied claims, or any healthcare question.`,
    suggestions: INITIAL_SUGGESTIONS,
  }])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef()
  const inputRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const send = (text) => {
    const userMsg = (text || input).trim()
    if (!userMsg) return

    // Add user message immediately, clear input, show typing
    setMessages(m => [...m, { role: 'user', content: userMsg }])
    setInput('')
    setIsTyping(true)
    inputRef.current?.focus()

    // Simulate a short thinking delay for natural feel
    setTimeout(() => {
      const { content, suggestions } = getResponse(userMsg)
      setIsTyping(false)
      setMessages(m => [...m, { role: 'assistant', content, suggestions }])
    }, 400 + Math.random() * 300)
  }

  // The suggestions to show are always from the last assistant message
  const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant')
  const currentSuggestions = isTyping ? [] : (lastAssistantMsg?.suggestions || [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar navigate={navigate} />

      <div className="flex-1 flex max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 gap-6">
        {/* Sidebar */}
        <div className="hidden lg:flex flex-col w-64 flex-shrink-0 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <img src={doctor} alt="Doctor" className="w-full rounded-xl object-cover mb-4 max-h-48 object-top" />
            <h3 className="font-bold text-gray-800 text-sm">Clarity Care AI</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Ask about any procedure, drug, insurance term, CPT/ICD code, or billing question.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-600 font-medium">Ready to help</span>
            </div>
          </div>

          <div className="bg-[#2c6b55] rounded-2xl p-5 text-white shadow-sm">
            <p className="font-bold text-sm mb-1">💡 Pro tip</p>
            <p className="text-xs opacity-80 leading-relaxed">Type any CPT or ICD-10 code (e.g. 99213 or I10) to get an instant plain-English explanation.</p>
          </div>
        </div>

        {/* Chat panel */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-0">
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3 shrink-0">
            <img src={logo} alt="Clarity Care" className="w-8 h-8 rounded-xl object-contain" />
            <div>
              <p className="font-bold text-gray-800 text-sm">Clarity Care AI</p>
              <p className="text-xs text-gray-400">Medical billing, insurance & cost assistant</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4" style={{ maxHeight: '55vh' }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <img src={logo} alt="" className="w-6 h-6 rounded-lg object-contain shrink-0 mt-1" />
                )}
                <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#2c6b55] text-white rounded-br-sm shadow-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}>
                  {m.role === 'assistant' ? <MessageContent content={m.content} /> : m.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-2.5 justify-start">
                <img src={logo} alt="" className="w-6 h-6 rounded-lg object-contain shrink-0 mt-1" />
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Suggestion chips — contextual, update after every response */}
          {currentSuggestions.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-50 flex flex-wrap gap-2">
              {currentSuggestions.map(s => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs bg-[#2c6b55]/8 text-[#2c6b55] border border-[#2c6b55]/20 px-3 py-1.5 rounded-full font-medium hover:bg-[#2c6b55]/15 transition-colors whitespace-nowrap"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-5 py-4 border-t border-gray-100 shrink-0">
            <div className="flex gap-3 items-center bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100 focus-within:border-[#2c6b55]/40 transition-colors">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !isTyping && send()}
                className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400"
                placeholder="Ask about costs, codes, insurance, or prescriptions…"
                disabled={isTyping}
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || isTyping}
                className="w-8 h-8 bg-[#2c6b55] hover:bg-[#245a47] rounded-lg flex items-center justify-center disabled:opacity-40 shrink-0 transition-colors active:scale-90"
              >
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
