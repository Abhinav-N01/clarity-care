export default function Navbar({ navigate }) {
  const links = [
    { label: 'Home', id: 'home' },
    { label: 'Insurance Decoder', id: 'insurance' },
    { label: 'Treatment Estimator', id: 'cost' },
    { label: 'Bill Translator', id: 'bill' },
    { label: 'AI Chat', id: 'chat' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 px-8 lg:px-16">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-[72px]">
        {/* Logo */}
        <button onClick={() => navigate('home')} className="flex items-center gap-3 flex-shrink-0">
          <img src="/logo.png" alt="Clarity Care" className="w-10 h-10 rounded-xl object-contain" />
          <span className="text-blue-500 font-bold text-xl tracking-tight">Clarity Care AI</span>
        </button>

        {/* Nav links */}
        <div className="hidden lg:flex items-center gap-8">
          {links.map(l => (
            <button
              key={l.id}
              onClick={() => navigate(l.id)}
              className="text-gray-600 hover:text-blue-500 font-medium text-sm transition-colors"
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('chat')}
            className="hidden sm:block text-gray-600 hover:text-blue-500 font-medium text-sm transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('chat')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-sm shadow-blue-200 active:scale-95"
          >
            Sign Up
          </button>
        </div>
      </div>
    </nav>
  )
}
