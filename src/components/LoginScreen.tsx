import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './LoginScreen.css'

type LoginScreenProps = {
  onShowPrivacy: () => void
}

function LoginScreen({ onShowPrivacy }: LoginScreenProps) {
  const { signIn, signUp } = useAuth()

  const [mode, setMode]         = useState<'login' | 'signup'>('login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [success, setSuccess]   = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    const { error } = mode === 'login'
      ? await signIn(email, password)
      : await signUp(email, password)

    if (error) {
      setError(error)
    } else if (mode === 'signup') {
      setSuccess('Compte créé ! Connexion en cours...')
    }
    setLoading(false)
  }

  return (
    <div className="login">
      <div className="login__card">
        <div className="login__body">
          <h1 className="login__heading">Bienvenue</h1>

          <p style={{ fontSize: '13px', color: '#888', marginBottom: '16px' }}>
            Connexion via votre compte d'entreprise
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="email"
              placeholder="Email professionnel"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />

            {error   && <p style={{ color: 'red',   fontSize: '13px', margin: 0 }}>{error}</p>}
            {success && <p style={{ color: 'green', fontSize: '13px', margin: 0 }}>{success}</p>}

            <button type="submit" className="login__cta" disabled={loading}>
              {loading
                ? 'Connexion…'
                : mode === 'login' ? 'Se connecter via SSO' : 'Créer mon compte'}
            </button>
          </form>
        </div>

        <div className="login__footer">
          <button
            type="button"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#888' }}
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null) }}
          >
            {mode === 'login' ? 'Première connexion ? Créer un compte' : 'Déjà un compte ? Se connecter'}
          </button>
          <button type="button" className="login__link" onClick={onShowPrivacy}>
            Politique de confidentialité
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginScreen
