import { useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import Onboarding from './components/Onboarding'
import CreateAccount from './components/CreateAccount'
import LoginScreen from './components/LoginScreen'
import PrivacyPolicy from './components/PrivacyPolicy'
import Quiz from './components/Quiz'
import Leaderboard from './components/Leaderboard'
import History from './components/History'
import BottomNav from './components/BottomNav'
import type { AppView } from './components/BottomNav'
import './App.css'

const ONBOARDING_KEY = 'onboardingDone'

function App() {
  const { session, loading } = useAuth()
  const [onboardingDone, setOnboardingDone] = useState(
    () => localStorage.getItem(ONBOARDING_KEY) === 'true',
  )
  const [showLogin, setShowLogin]   = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [view, setView] = useState<AppView>('quiz')

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
    if (showLogin) {
      return (
        <LoginScreen
          onShowPrivacy={() => setShowPrivacy(true)}
          onBack={() => setShowLogin(false)}
        />
      )
    }
    return <CreateAccount onLogin={() => setShowLogin(true)} />
  }

  if (view === 'leaderboard') {
    return <Leaderboard onNavigate={setView} />
  }

  if (view === 'history') {
    return <History onNavigate={setView} />
  }

  if (view === 'profile') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#fff', paddingBottom: 92 }}>
        <p style={{ margin: 'auto', textAlign: 'center', color: '#9aa0ab', fontSize: 15 }}>
          Page profil en cours de création…
        </p>
        <BottomNav active="profile" onNavigate={setView} />
      </div>
    )
  }

  return <Quiz onNavigate={setView} />
}

export default App
