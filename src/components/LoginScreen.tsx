import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

type Props = {
  onShowPrivacy: () => void
  onBack?: () => void
}

function LoginScreen({ onBack }: Props) {
  const { signIn } = useAuth()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState<string | null>(null)
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async () => {
    if (!email || !password) { setError('Remplis tous les champs.'); return }
    setError(null)
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) setError(error)
    setLoading(false)
  }

  const filled = !!email && !!password

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4EE', display: 'flex', flexDirection: 'column', fontFamily: 'var(--sans)' }}>

      {/* Header */}
      <div style={{ padding: '16px 24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontSize: '18px', fontWeight: 800, fontStyle: 'italic', color: '#0a0a0a', marginBottom: '16px' }}>
          prisme
        </span>
        <div style={{ display: 'flex', width: '100%' }}>
          <button style={{ flex: 1, textAlign: 'center', fontSize: '15px', fontWeight: 600, color: '#0a0a0a', padding: '0 0 12px', background: 'none', border: 'none', cursor: 'pointer' }}>
            Se connecter
          </button>
          <button onClick={onBack} style={{ flex: 1, textAlign: 'center', fontSize: '15px', fontWeight: 500, color: '#9ca3af', padding: '0 0 12px', background: 'none', border: 'none', cursor: 'pointer' }}>
            Créer un compte
          </button>
        </div>
        <div style={{ display: 'flex', width: '100%', gap: '4px' }}>
          <div style={{ flex: 1, height: '3px', borderRadius: '999px', background: '#0a0a0a' }} />
          <div style={{ flex: 1, height: '3px', borderRadius: '999px', background: '#e5e7eb' }} />
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: '40px 24px 24px', display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '40px', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-1.5px', margin: '0 0 8px', lineHeight: 1.1 }}>
          Bon retour !
        </h1>
        <p style={{ fontSize: '15px', color: '#9ca3af', margin: '0 0 32px' }}>
          Content de vous revoir 👋
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            style={{ padding: '18px 20px', background: '#EAEAF2', border: 'none', borderRadius: '16px', fontSize: '16px', color: '#0a0a0a', outline: 'none', fontFamily: 'var(--sans)' }}
            type="email"
            placeholder="mail@mail.com*"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
          />
          <input
            style={{ padding: '18px 20px', background: '#EAEAF2', border: 'none', borderRadius: '16px', fontSize: '16px', color: '#0a0a0a', outline: 'none', fontFamily: 'var(--sans)' }}
            type="password"
            placeholder="Mot de passe*"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        {error && <p style={{ fontSize: '13px', color: '#ef4444', marginTop: '8px' }}>{error}</p>}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '24px 24px 36px', gap: '16px' }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', fontSize: '22px', color: '#0a0a0a', cursor: 'pointer', padding: '8px', flexShrink: 0 }}
        >
          ←
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            flex: 1,
            padding: '16px',
            background: filled ? '#0a0a0a' : 'transparent',
            border: `2px solid ${filled ? '#0a0a0a' : '#d1d5db'}`,
            borderRadius: '999px',
            fontSize: '16px',
            fontWeight: 600,
            color: filled ? '#fff' : '#9ca3af',
            cursor: 'pointer',
            transition: 'all 0.15s',
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </div>

    </div>
  )
}

export default LoginScreen
