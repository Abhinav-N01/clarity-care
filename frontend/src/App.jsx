import { useState } from 'react'
import WelcomeScreen from './screens/WelcomeScreen'
import HomeScreen from './screens/HomeScreen'
import BillTranslatorScreen from './screens/BillTranslatorScreen'
import InsuranceDecoderScreen from './screens/InsuranceDecoderScreen'
import CostEstimatorScreen from './screens/CostEstimatorScreen'
import ChatScreen from './screens/ChatScreen'

export default function App() {
  const [screen, setScreen] = useState('welcome')
  const [user, setUser] = useState(null)

  const navigate = (to) => setScreen(to)

  const login = (name) => {
    setUser({ name })
    setScreen('home')
  }

  const screens = { welcome: WelcomeScreen, home: HomeScreen, bill: BillTranslatorScreen, insurance: InsuranceDecoderScreen, cost: CostEstimatorScreen, chat: ChatScreen }
  const Screen = screens[screen] || HomeScreen

  return (
    <Screen
      navigate={navigate}
      user={user}
      login={login}
    />
  )
}
