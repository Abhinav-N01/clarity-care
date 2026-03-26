export default function BottomNav({ active, navigate }) {
  const items = [
    {
      id: 'home',
      icon: (
        <svg className="w-5 h-5" fill={active === 'home' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      id: 'bill',
      icon: (
        <svg className="w-5 h-5" fill={active === 'bill' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      )
    },
    {
      id: 'chat',
      icon: (
        <svg className="w-5 h-5" fill={active === 'chat' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
    {
      id: 'search',
      icon: (
        <svg className="w-5 h-5" fill={active === 'search' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
  ]

  return (
    <div className="bg-white/80 backdrop-blur-sm border-t border-white/40 px-6 py-3 mt-6 mb-0">
      <div className="flex justify-around items-center">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            className={`flex flex-col items-center p-2 rounded-xl transition-colors ${
              active === item.id ? 'text-[#2c6b55]' : 'text-gray-400'
            }`}
          >
            {item.icon}
            {active === item.id && <div className="w-1 h-1 rounded-full bg-[#2c6b55] mt-1" />}
          </button>
        ))}
      </div>
    </div>
  )
}
