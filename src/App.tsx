import { useEffect, useRef, useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import Onboarding from './components/Onboarding'
import CreateAccount from './components/CreateAccount'
import LoginScreen from './components/LoginScreen'
import ForgotPassword from './components/ForgotPassword'
import PrivacyPolicy from './components/PrivacyPolicy'
import Quiz from './components/Quiz'
import Leaderboard from './components/Leaderboard'
import History from './components/History'
import Home from './components/Home'
import Profile from './components/Profile'
import Settings from './components/Settings'
import type { AppView } from './components/BottomNav'
import './App.css'

const ONBOARDING_KEY = 'onboardingDone'

function App() {
  const { session, loading } = useAuth()
  const [onboardingDone, setOnboardingDone] = useState(
    () => localStorage.getItem(ONBOARDING_KEY) === 'true',
  )
  const [showLogin, setShowLogin]           = useState(false)
  const [showPrivacy, setShowPrivacy]       = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showSettings,       setShowSettings]       = useState(false)
  const [view,       setView]       = useState<AppView>('quiz')
  const [quizActive, setQuizActive] = useState(false)

  // Redirige vers login après déconnexion (ne s'applique pas au premier chargement)
  const hadSession = useRef(false)
  useEffect(() => {
    if (session) {
      hadSession.current = true
    } else if (hadSession.current) {
      setShowLogin(true)
      setShowSettings(false)
      setShowForgotPassword(false)
      hadSession.current = false
    }
  }, [session])

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

  if (showSettings) {
    return (
      <Settings
        onBack={() => setShowSettings(false)}
        onShowPrivacy={() => { setShowSettings(false); setShowPrivacy(true) }}
        onNavigate={(v) => { setShowSettings(false); setView(v) }}
      />
    )
  }

  if (!session) {
    if (showForgotPassword) {
      return <ForgotPassword onBack={() => setShowForgotPassword(false)} />
    }
    if (showLogin) {
      return (
        <LoginScreen
          onShowPrivacy={() => setShowPrivacy(true)}
          onBack={() => setShowLogin(false)}
          onForgotPassword={() => setShowForgotPassword(true)}
        />
      )
    }
    return <CreateAccount onLogin={() => setShowLogin(true)} onBack={() => setOnboardingDone(false)} />
  }

  const openSettings = () => setShowSettings(true)

  if (view === 'leaderboard') {
    return <Leaderboard onNavigate={setView} onSettings={openSettings} />
  }

  if (view === 'history') {
    return <History onNavigate={setView} onSettings={openSettings} />
  }

  if (view === 'profile') {
    return <Profile onNavigate={setView} onSettings={openSettings} />
  }

  if (quizActive) {
    return <Quiz onNavigate={(v) => { setView(v); setQuizActive(false) }} onHome={() => setQuizActive(false)} onSettings={openSettings} />
  }

  return <Home onStartQuiz={() => setQuizActive(true)} onNavigate={setView} onSettings={openSettings} />
}

export default App
