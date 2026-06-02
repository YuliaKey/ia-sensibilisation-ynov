import { useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import Onboarding from './components/Onboarding'
import LoginScreen from './components/LoginScreen'
import PrivacyPolicy from './components/PrivacyPolicy'
import ProfileSetup from './components/ProfileSetup'
import Quiz from './components/Quiz'
import Leaderboard from './components/Leaderboard'
import History from './components/History'
import type { AppView } from './components/BottomNav'
import './App.css'

const ONBOARDING_KEY = 'onboardingDone'

function App() {
  const { session, profile, loading } = useAuth()
  const [onboardingDone, setOnboardingDone] = useState(
    () => localStorage.getItem(ONBOARDING_KEY) === 'true',
  )
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
    return <LoginScreen onShowPrivacy={() => setShowPrivacy(true)} />
  }

  // Connecté mais sans profil public.users → création de profil.
  if (!profile) {
    return <ProfileSetup />
  }

  if (view === 'leaderboard') {
    return <Leaderboard onNavigate={setView} />
  }

  if (view === 'history') {
    return <History onNavigate={setView} />
  }

  return <Quiz onNavigate={setView} />
}

export default App
