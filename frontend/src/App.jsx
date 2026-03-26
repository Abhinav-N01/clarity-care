import { useState } from 'react'
import HomeScreen from './screens/HomeScreen'
import BillTranslatorScreen from './screens/BillTranslatorScreen'
import InsuranceDecoderScreen from './screens/InsuranceDecoderScreen'
import CostEstimatorScreen from './screens/CostEstimatorScreen'
import ChatScreen from './screens/ChatScreen'

const user = { name: 'Abhi' }

export default function App() {
  const [screen, setScreen] = useState('home')
  const navigate = (to) => setScreen(to)
  const screens = { home: HomeScreen, bill: BillTranslatorScreen, insurance: InsuranceDecoderScreen, cost: CostEstimatorScreen, chat: ChatScreen }
  const Screen = screens[screen] || HomeScreen
  return <Screen navigate={navigate} user={user} />
}
