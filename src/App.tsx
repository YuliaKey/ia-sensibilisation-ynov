import { useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import Onboarding from './components/Onboarding'
import LoginScreen from './components/LoginScreen'
import './App.css'

const ONBOARDING_KEY = 'onboardingDone'

function App() {
  const { session, loading, signOut } = useAuth()
  const [onboardingDone, setOnboardingDone] = useState(
    () => localStorage.getItem(ONBOARDING_KEY) === 'true',
  )

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

  if (!session) {
    return <LoginScreen />
  }

  // Dashboard — à construire avec les maquettes
  return (
    <div style={{ padding: '32px', fontFamily: 'sans-serif' }}>
      <h1>Connecté</h1>
      <p>{session.user.email}</p>
      <button onClick={signOut} style={{ marginTop: '16px' }}>
        Se déconnecter
      </button>
    </div>
  )
}

export default App
