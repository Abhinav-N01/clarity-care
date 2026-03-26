import Navbar from '../components/Navbar'

const features = [
  "Simplify Every Interaction you have with healthcare providers, Insurers and Pharmacies.",
  "Supports Any Patient Regardless of Insurance Plan.",
  "Decode complex Insurance documents.",
  "Know before you go — No more unexpected Medical Bills",
  'Ask questions like "What is covered in my insurance if I break a tooth?"',
]

const services = [
  {
    id: 'insurance',
    icon: '🛡️',
    title: 'Insurance Decoder',
    desc: 'Decode your EOB and denial letters in plain English. Understand exactly what your insurance paid and what you owe.',
  },
  {
    id: 'cost',
    icon: '💰',
    title: 'Treatment Estimator',
    desc: 'Get accurate cost estimates before any procedure. Know your out-of-pocket costs upfront.',
  },
  {
    id: 'bill',
    icon: '📄',
    title: 'Bill Translator',
    desc: 'Decode CPT codes, ICD-10 diagnoses, and spot billing errors on your medical bills instantly.',
  },
  {
    id: 'chat',
    icon: '💬',
    title: 'AI Chat Assistant',
    desc: 'Ask anything — from "how much does a root canal cost?" to "how do I appeal a denied claim?"',
  },
]

export default function LandingPage({ navigate }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar navigate={navigate} />

      {/* Hero */}
      <section className="flex-1 relative overflow-hidden bg-white">
        {/* Blue circle background behind doctor */}
        <div className="absolute right-0 top-0 w-1/2 h-full">
          <div className="absolute right-[-80px] top-[-60px] w-[700px] h-[700px] rounded-full bg-blue-500 opacity-90" />
        </div>

        <div className="relative max-w-7xl mx-auto px-8 lg:px-16 py-12 lg:py-20 flex flex-col lg:flex-row items-center min-h-[calc(100vh-72px)]">
          {/* Left content */}
          <div className="flex-1 z-10 lg:pr-16">

            {/* Logo — big and centered in its own block */}
            <div className="mb-8">
              <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Clarity Care" className="h-44 w-auto object-contain" />
            </div>

            <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Bringing Clarity To Care<br />
              <span className="text-gray-900">When It Matters Most</span>
            </h1>

            <ul className="space-y-2 mb-10">
              {features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-600 text-sm lg:text-base">
                  <span className="text-blue-500 mt-0.5 flex-shrink-0">•</span>
                  {f}
                </li>
              ))}
            </ul>

            {/* Clarity AI chat box */}
            <button
              onClick={() => navigate('chat')}
              className="group flex items-center gap-4 bg-white border border-gray-200 hover:border-blue-400 rounded-2xl px-6 py-4 shadow-sm hover:shadow-md transition-all active:scale-95 w-fit"
            >
              <img src={`${import.meta.env.BASE_URL}logo.png`} alt="" className="h-10 w-auto object-contain flex-shrink-0" />
              <div className="text-left">
                <p className="font-bold text-gray-900 text-base group-hover:text-blue-600 transition-colors">Clarity AI</p>
                <p className="text-xs text-gray-400 mt-0.5">Ask me anything about your healthcare costs →</p>
              </div>
            </button>

          </div>

          {/* Right — Doctor image */}
          <div className="relative flex-shrink-0 w-full lg:w-[480px] flex justify-center items-end mt-12 lg:mt-0 z-10">
            <img
              src={`${import.meta.env.BASE_URL}doctor.png`}
              alt="Doctor"
              className="relative z-10 w-[340px] lg:w-[420px] object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Services strip */}
      <section className="bg-gray-50 border-t border-gray-100 py-16 px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything you need to understand your healthcare costs</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Four powerful tools, one simple platform. No more confusion, no more surprises.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map(s => (
              <button
                key={s.id}
                onClick={() => navigate(s.id)}
                className="bg-white rounded-2xl p-6 text-left shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-blue-200 group active:scale-[0.98]"
              >
                <div className="text-3xl mb-4">{s.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                <p className="text-blue-500 text-sm font-medium mt-4">Open →</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Clarity Care" className="h-10 w-auto object-contain" />
          <p className="text-xs text-gray-400">© 2024 Clarity Care. For informational purposes only.</p>
        </div>
      </footer>
    </div>
  )
}
