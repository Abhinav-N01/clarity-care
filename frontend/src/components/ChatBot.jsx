import { useState, useRef, useEffect } from 'react'
import axios from 'axios'

const API = 'http://localhost:8000/api'

const SUGGESTIONS = [
  "What is an EOB?",
  "How do I appeal a denied claim?",
  "What does CO-97 denial mean?",
  "How can I lower my medical bill?"
]

export default function ChatBot() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: "Hi, I'm Clarity! I can help you understand medical bills, insurance terms, and cost estimates. What's your question?"
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
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again." }])
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-[520px]">
      <h2 className="text-xl font-semibold mb-1">AI Billing Assistant</h2>
      <p className="text-gray-500 text-sm mb-3">Ask anything about your medical bills or insurance.</p>

      <div className="flex gap-2 flex-wrap mb-3">
        {SUGGESTIONS.map(s => (
          <button key={s} onClick={() => send(s)}
            className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-100">
            {s}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto border rounded-lg p-4 space-y-3 bg-gray-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-sm px-4 py-2 rounded-2xl text-sm ${
              m.role === 'user'
                ? 'bg-blue-700 text-white rounded-br-sm'
                : 'bg-white border rounded-bl-sm text-gray-800'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border px-4 py-2 rounded-2xl rounded-bl-sm">
              <span className="animate-pulse text-gray-400 text-sm">Clarity is thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 mt-3">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          className="flex-1 border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
          placeholder="Ask about your bill..." />
        <button onClick={() => send()} disabled={loading || !input}
          className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 disabled:opacity-50">
          Send
        </button>
      </div>
    </div>
  )
}
