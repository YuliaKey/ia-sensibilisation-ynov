import { useState } from 'react'
import { supabase } from '../lib/supabase'
import Logo from './Logo'

type Props = {
  onBack: () => void
}

function ForgotPassword({ onBack }: Props) {
  const [email,   setEmail]   = useState('')
  const [error,   setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)

  const handleSubmit = async () => {
    if (!email) { setError('Entrez votre adresse email.'); return }
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) setError(error.message)
    else setSent(true)
    setLoading(false)
  }

  const filled = !!email

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4EE', display: 'flex', flexDirection: 'column', fontFamily: 'var(--sans)' }}>

      {/* Header */}
      <div style={{ padding: '16px 24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Logo variant="text" />
        <div style={{ width: '100%', height: '3px', borderRadius: '999px', background: '#e5e7eb' }} />
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: '40px 24px 24px', display: 'flex', flexDirection: 'column' }}>
        {sent ? (
          <>
            <h1 style={{ fontSize: '40px', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-1.5px', margin: '0 0 8px', lineHeight: 1.1 }}>
              Email envoyé !
            </h1>
            <p style={{ fontSize: '15px', color: '#9ca3af', margin: '0' }}>
              Vérifiez votre boîte mail pour réinitialiser votre mot de passe.
            </p>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: '40px', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-1.5px', margin: '0 0 8px', lineHeight: 1.1 }}>
              Mot de passe oublié ?
            </h1>
            <p style={{ fontSize: '15px', color: '#9ca3af', margin: '0 0 32px' }}>
              Entrez votre adresse email, on vous envoie un lien.
            </p>

            <input
              style={{ padding: '18px 20px', background: '#EAEAF2', border: 'none', borderRadius: '16px', fontSize: '16px', color: '#0a0a0a', outline: 'none', fontFamily: 'var(--sans)' }}
              type="email"
              placeholder="mail@mail.com*"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />

            {error && <p style={{ fontSize: '13px', color: '#ef4444', marginTop: '8px' }}>{error}</p>}
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '24px 24px 36px', gap: '16px' }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', fontSize: '22px', color: '#0a0a0a', cursor: 'pointer', padding: '8px', flexShrink: 0 }}
        >
          ←
        </button>
        {!sent && (
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
            {loading ? 'Envoi...' : 'Envoyer le lien'}
          </button>
        )}
      </div>

    </div>
  )
}

export default ForgotPassword
