import { useState } from 'react'
import Onboarding from './components/Onboarding'
import LoginScreen from './components/LoginScreen'
import PrivacyPolicy from './components/PrivacyPolicy'
import Quiz from './components/Quiz'
import './App.css'

const ONBOARDING_KEY = 'onboardingDone'

function App() {
  // L'onboarding ne s'affiche qu'à la première visite : on mémorise dans localStorage.
  const [onboardingDone, setOnboardingDone] = useState(
    () => localStorage.getItem(ONBOARDING_KEY) === 'true',
  )
  const [loggedIn, setLoggedIn] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)

  const finishOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    setOnboardingDone(true)
  }

  if (!onboardingDone) {
    return <Onboarding onFinish={finishOnboarding} />
  }

  // Page accessible depuis le lien de l'écran de connexion.
  if (showPrivacy) {
    return <PrivacyPolicy onBack={() => setShowPrivacy(false)} />
  }

  if (!loggedIn) {
    return (
      <LoginScreen
        onLogin={() => setLoggedIn(true)}
        onShowPrivacy={() => setShowPrivacy(true)}
      />
    )
  }

  return <Quiz />
}

export default App
