import { useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import Onboarding from './components/Onboarding'
import LoginScreen from './components/LoginScreen'
import PrivacyPolicy from './components/PrivacyPolicy'
import Quiz from './components/Quiz'
import './App.css'

const ONBOARDING_KEY = 'onboardingDone'

function App() {
  const { session, loading } = useAuth()
  const [onboardingDone, setOnboardingDone] = useState(
    () => localStorage.getItem(ONBOARDING_KEY) === 'true',
  )
  const [showPrivacy, setShowPrivacy] = useState(false)

  const finishOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    setOnboardingDone(true)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Chargement...
      </div>
    )
  }

  if (!onboardingDone) {
    return <Onboarding onFinish={finishOnboarding} />
  }

  if (showPrivacy) {
    return <PrivacyPolicy onBack={() => setShowPrivacy(false)} />
  }

  if (!session) {
    return <LoginScreen onShowPrivacy={() => setShowPrivacy(true)} />
  }

  return <Quiz />
}

export default App
