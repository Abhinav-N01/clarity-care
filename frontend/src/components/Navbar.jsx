import { logo, doctor } from '../assets/images.js'
export default function Navbar({ navigate }) {
  const links = [
    { label: 'Home', id: 'home' },
    { label: 'Insurance Decoder', id: 'insurance' },
    { label: 'Treatment Estimator', id: 'cost' },
    { label: 'Bill Translator', id: 'bill' },
    { label: 'AI Chat', id: 'chat' },
    { label: 'Code Search', id: 'search' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 px-8 lg:px-16">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-[72px]">
        {/* Logo */}
        <button onClick={() => navigate('home')} className="flex items-center flex-shrink-0">
          <img src={logo} alt="Clarity Care" className="h-14 w-auto object-contain" />
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

      </div>
    </nav>
  )
}
