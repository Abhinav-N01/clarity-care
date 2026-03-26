import { useState } from 'react'

export default function WelcomeScreen({ login }) {
  const [mode, setMode] = useState('welcome') // welcome | signin | signup
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  if (mode === 'signup') {
    return (
      <div className="screen bg-[#c4d5c0] px-8 pt-20 pb-10 flex flex-col">
        <button onClick={() => setMode('welcome')} className="text-[#2c6b55] text-sm mb-8 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Create account</h2>
        <p className="text-gray-500 text-sm mb-8">Join ClarityCare to understand your healthcare costs</p>

        <div className="space-y-4 flex-1">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Full Name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="mt-1 w-full bg-white rounded-2xl px-4 py-3.5 text-sm outline-none shadow-sm"
              placeholder="Alex Johnson" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)}
              className="mt-1 w-full bg-white rounded-2xl px-4 py-3.5 text-sm outline-none shadow-sm"
              placeholder="alex@example.com" type="email" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Password</label>
            <input className="mt-1 w-full bg-white rounded-2xl px-4 py-3.5 text-sm outline-none shadow-sm"
              placeholder="••••••••" type="password" />
          </div>
        </div>

        <button
          onClick={() => login(name || 'Alex')}
          className="w-full bg-[#2c6b55] text-white rounded-2xl py-4 font-semibold text-base mt-8 active:opacity-90"
        >
          Create account
        </button>
      </div>
    )
  }

  if (mode === 'signin') {
    return (
      <div className="screen bg-[#c4d5c0] px-8 pt-20 pb-10 flex flex-col">
        <button onClick={() => setMode('welcome')} className="text-[#2c6b55] text-sm mb-8 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome back</h2>
        <p className="text-gray-500 text-sm mb-8">Sign in to your account</p>

        <div className="space-y-4 flex-1">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Email</label>
            <input className="mt-1 w-full bg-white rounded-2xl px-4 py-3.5 text-sm outline-none shadow-sm"
              placeholder="alex@example.com" type="email" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Password</label>
            <input className="mt-1 w-full bg-white rounded-2xl px-4 py-3.5 text-sm outline-none shadow-sm"
              placeholder="••••••••" type="password" />
          </div>
        </div>

        <button
          onClick={() => login('Alex')}
          className="w-full bg-[#2c6b55] text-white rounded-2xl py-4 font-semibold text-base mt-8 active:opacity-90"
        >
          Log in
        </button>
      </div>
    )
  }

  return (
    <div className="screen bg-[#c4d5c0] flex flex-col items-center px-8 pb-12">
      {/* Illustration area */}
      <div className="flex-1 flex flex-col items-center justify-center pt-16 pb-8">
        <div className="w-56 h-56 mb-8 relative">
          {/* Abstract medical illustration using SVG */}
          <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
            {/* Background blob */}
            <ellipse cx="100" cy="110" rx="80" ry="70" fill="#a8bfa8" opacity="0.4"/>
            {/* Pill shapes */}
            <rect x="55" y="55" width="28" height="52" rx="14" fill="#e8f0e8" transform="rotate(-20 55 55)"/>
            <rect x="55" y="55" width="28" height="52" rx="14" fill="#2c6b55" transform="rotate(-20 55 55)" opacity="0.7" height="26" y="55"/>
            {/* Clipboard */}
            <rect x="90" y="60" width="55" height="70" rx="6" fill="white" opacity="0.9"/>
            <rect x="108" y="52" width="20" height="14" rx="4" fill="#9ab09a"/>
            <line x1="100" y1="82" x2="134" y2="82" stroke="#ddd" strokeWidth="2" strokeLinecap="round"/>
            <line x1="100" y1="93" x2="134" y2="93" stroke="#ddd" strokeWidth="2" strokeLinecap="round"/>
            <line x1="100" y1="104" x2="120" y2="104" stroke="#ddd" strokeWidth="2" strokeLinecap="round"/>
            {/* Cross/plus */}
            <circle cx="65" cy="130" r="18" fill="#2c6b55" opacity="0.85"/>
            <rect x="57" y="128" width="16" height="4" rx="2" fill="white"/>
            <rect x="63" y="122" width="4" height="16" rx="2" fill="white"/>
            {/* Stethoscope circle */}
            <circle cx="148" cy="75" r="14" fill="#f0f7f0" opacity="0.9"/>
            <text x="141" y="80" fontSize="14" fill="#2c6b55">♡</text>
            {/* Small dots */}
            <circle cx="80" cy="155" r="5" fill="#2c6b55" opacity="0.4"/>
            <circle cx="155" cy="110" r="4" fill="#2c6b55" opacity="0.3"/>
            <circle cx="50" cy="95" r="3" fill="white" opacity="0.6"/>
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 text-center leading-tight mb-3">
          Welcome to<br />ClarityCare
        </h1>
        <p className="text-gray-500 text-center text-sm leading-relaxed max-w-xs">
          Simplify every interaction you have with healthcare providers, insurers and pharmacies
        </p>
      </div>

      {/* Buttons */}
      <div className="w-full space-y-3">
        <button
          onClick={() => setMode('signup')}
          className="w-full bg-[#2c6b55] text-white rounded-2xl py-4 font-semibold text-base active:opacity-90 shadow-md"
        >
          Create an account
        </button>
        <button
          onClick={() => setMode('signin')}
          className="w-full bg-white/60 text-gray-700 rounded-2xl py-4 font-semibold text-base active:opacity-80 border border-white/40"
        >
          Log in
        </button>
      </div>
    </div>
  )
}
