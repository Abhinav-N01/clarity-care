import { useState } from 'react'
import LandingPage from './screens/LandingPage'
import BillTranslatorScreen from './screens/BillTranslatorScreen'
import InsuranceDecoderScreen from './screens/InsuranceDecoderScreen'
import CostEstimatorScreen from './screens/CostEstimatorScreen'
import ChatScreen from './screens/ChatScreen'

const user = { name: 'Abhi' }

export default function App() {
  const [screen, setScreen] = useState('home')
  const navigate = (to) => setScreen(to)
  const screens = {
    home: LandingPage,
    bill: BillTranslatorScreen,
    insurance: InsuranceDecoderScreen,
    cost: CostEstimatorScreen,
    chat: ChatScreen,
  }
  const Screen = screens[screen] || LandingPage
  return <Screen navigate={navigate} user={user} />
}
