import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { SkillLevel } from '../types/database'
import './CreateAccount.css'

type Service = { id: string; name: string }
type Props   = { onLogin: () => void }

const LEVELS = [
  { value: 'beginner' as SkillLevel, name: 'Novice',        emoji: '🌿', desc: "Je n'ai jamais utilisé l'IA." },
  { value: 'beginner' as SkillLevel, name: 'Curieux',       emoji: '👀', desc: "J'ai testé quelques fois." },
  { value: 'curious'  as SkillLevel, name: 'Intermédiaire', emoji: '🚀', desc: "Je l'utilise régulièrement." },
  { value: 'expert'   as SkillLevel, name: 'Avancé',        emoji: '🧠', desc: "Je prompt, j'automatise, je connais les limites." },
]

const TOTAL_STEPS = 4

function CreateAccount({ onLogin }: Props) {
  const [step, setStep] = useState(1)

  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')

  const [services,  setServices]  = useState<Service[]>([])
  const [serviceId, setServiceId] = useState('')

  const [levelIndex, setLevelIndex] = useState(0)

  const [avatarFile,    setAvatarFile]    = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [error,   setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.from('services').select('id, name').order('name').then(({ data }) => {
      if (data) setServices(data)
    })
  }, [])

  const next = () => { setError(null); setStep(s => s + 1) }
  const back = () => { setError(null); setStep(s => s - 1) }

  const handleStep1 = () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError('Tous les champs sont obligatoires.')
      return
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    next()
  }

  const handleStep2 = () => {
    if (!serviceId) { setError('Sélectionnez votre service.'); return }
    next()
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleFinish = async () => {
    setLoading(true)
    setError(null)

    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })
    if (authError || !authData.user) {
      setError(authError?.message ?? 'Erreur lors de la création du compte.')
      setLoading(false)
      return
    }

    const userId = authData.user.id

    // Upload photo si sélectionnée
    let avatarUrl: string | null = null
    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(`${userId}.${ext}`, avatarFile, { upsert: true })
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(`${userId}.${ext}`)
        avatarUrl = urlData.publicUrl
      }
    }

    const { error: profileError } = await supabase.from('users').insert({
      id:             userId,
      first_name:     firstName.trim(),
      last_name:      lastName.trim(),
      service_id:     serviceId,
      job_title:      null,
      declared_level: LEVELS[levelIndex].value,
      current_level:  LEVELS[levelIndex].value,
    })

    if (profileError) setError(profileError.message)
    setLoading(false)
    // AuthContext onAuthStateChange redirige vers Quiz
  }

  const nextAction = step === 1 ? handleStep1
                   : step === 2 ? handleStep2
                   : step === 3 ? next
                   : handleFinish

  const nextLabel  = step === TOTAL_STEPS
    ? (loading ? 'Création...' : "C'est parti !")
    : 'Suivant'

  const nextFilled = (step === 1 && !!firstName && !!lastName && !!email && password.length >= 6) ||
                     (step === 2 && !!serviceId) ||
                     (step === 3)
  // step 4 toujours outlined (photo optionnelle)

  return (
    <div className="create-account">

      {/* Header */}
      <div className="create-account__header">
        <span className="create-account__logo">prisme</span>
        <div className="create-account__tabs">
          <button className="create-account__tab" onClick={onLogin}>Se connecter</button>
          <button className="create-account__tab create-account__tab--active">Créer un compte</button>
        </div>
        <div className="create-account__progress">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className={`create-account__progress-seg${step > i ? ' create-account__progress-seg--active' : ''}`} />
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="create-account__body">

        {/* ── Step 1 : Identité + Mot de passe ── */}
        {step === 1 && (
          <>
            <h1 className="create-account__heading">Bienvenue</h1>
            <p className="create-account__subtitle">Commençons par faire connaissance.</p>
            <div className="create-account__fields">
              <input className="create-account__input" placeholder="Prénom*"
                value={firstName} onChange={e => setFirstName(e.target.value)} autoComplete="given-name" />
              <input className="create-account__input" placeholder="Nom*"
                value={lastName} onChange={e => setLastName(e.target.value)} autoComplete="family-name" />
              <input className="create-account__input" type="email" placeholder="mail@mail.com*"
                value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
              <input className="create-account__input" type="password" placeholder="Mot de passe*"
                value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" />
            </div>
          </>
        )}

        {/* ── Step 2 : Service ── */}
        {step === 2 && (
          <>
            <h1 className="create-account__heading">Votre service</h1>
            <p className="create-account__subtitle">On adaptera vos scénarios à vos besoins quotidiens.</p>
            <div className="create-account__service-grid">
              {services.map(s => (
                <button key={s.id}
                  className={`create-account__service-btn${serviceId === s.id ? ' create-account__service-btn--active' : ''}`}
                  onClick={() => setServiceId(s.id)}>
                  {s.name}
                </button>
              ))}
              <button
                className={`create-account__service-btn${serviceId === 'autre' ? ' create-account__service-btn--active' : ''}`}
                onClick={() => setServiceId('autre')}>
                Autre
              </button>
            </div>
          </>
        )}

        {/* ── Step 3 : Niveau ── */}
        {step === 3 && (
          <>
            <h1 className="create-account__heading">Votre niveau IA ?</h1>
            <p className="create-account__subtitle">Soyez honnête : on calibre votre parcours.</p>
            <div className="create-account__fields">
              <div className="create-account__levels">
                {LEVELS.map((l, i) => (
                  <div key={i}
                    className={`create-account__level${levelIndex === i ? ' create-account__level--active' : ''}`}
                    onClick={() => setLevelIndex(i)}>
                    <span className="create-account__level-emoji">{l.emoji}</span>
                    <div>
                      <div className="create-account__level-name">{l.name}</div>
                      <div className="create-account__level-desc">{l.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Step 4 : Photo de profil ── */}
        {step === 4 && (
          <>
            <h1 className="create-account__heading">Photo de profil</h1>
            <p className="create-account__subtitle">Préparez votre meilleur profil !</p>
            <div className="create-account__avatar-wrap">
              <div className="create-account__avatar">
                {avatarPreview
                  ? <img src={avatarPreview} alt="avatar" className="create-account__avatar-img" />
                  : <svg viewBox="0 0 100 100" className="create-account__avatar-placeholder">
                      <circle cx="50" cy="35" r="20" fill="#b0b0b0" />
                      <ellipse cx="50" cy="85" rx="30" ry="22" fill="#b0b0b0" />
                    </svg>
                }
              </div>
              <button className="create-account__avatar-add" onClick={() => fileInputRef.current?.click()}>
                +
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
            </div>
          </>
        )}

        {error && <p className="create-account__error">{error}</p>}
      </div>

      {/* Footer */}
      <div className="create-account__footer">
        <button className="create-account__back" onClick={() => step === 1 ? onLogin() : back()}>←</button>
        <button
          className={`create-account__next${nextFilled ? ' create-account__next--filled' : ''}`}
          onClick={nextAction}
          disabled={loading}>
          {nextLabel}
        </button>
      </div>

    </div>
  )
}

export default CreateAccount
