import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { SkillLevel } from '../types/database'
import './ProfileSetup.css'

type Service = { id: string; name: string }

const LEVELS: { value: SkillLevel; label: string }[] = [
  { value: 'beginner', label: 'Débutant' },
  { value: 'curious', label: 'Curieux' },
  { value: 'expert', label: 'Expert' },
]

function ProfileSetup() {
  const { createProfile } = useAuth()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [serviceId, setServiceId] = useState<string>('')
  const [declaredLevel, setDeclaredLevel] = useState<SkillLevel>('beginner')

  const [services, setServices] = useState<Service[]>([])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Charge la liste des services pour le menu déroulant (optionnel).
  useEffect(() => {
    let cancelled = false
    supabase
      .from('services')
      .select('id, name')
      .order('name')
      .then(({ data }) => {
        if (!cancelled && data) setServices(data)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const { error } = await createProfile({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      job_title: jobTitle.trim(),
      service_id: serviceId || null,
      declared_level: declaredLevel,
    })

    // En cas de succès, AuthContext recharge le profil → App affiche le Quiz.
    if (error) {
      setError(error)
      setSubmitting(false)
    }
  }

  return (
    <div className="profile">
      <div className="profile__card">
        <h1 className="profile__title">Complétez votre profil</h1>
        <p className="profile__subtitle">
          Quelques informations pour personnaliser votre parcours.
        </p>

        <form className="profile__form" onSubmit={handleSubmit}>
          <label className="profile__field">
            <span>Prénom</span>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </label>

          <label className="profile__field">
            <span>Nom</span>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </label>

          <label className="profile__field">
            <span>Intitulé de poste</span>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Ex. Consultant"
            />
          </label>

          {services.length > 0 && (
            <label className="profile__field">
              <span>Service</span>
              <select value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
                <option value="">— Non précisé —</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="profile__field">
            <span>Votre niveau actuel</span>
            <select
              value={declaredLevel}
              onChange={(e) => setDeclaredLevel(e.target.value as SkillLevel)}
            >
              {LEVELS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>

          {error && <p className="profile__error">{error}</p>}

          <button type="submit" className="profile__cta" disabled={submitting}>
            {submitting ? 'Enregistrement…' : 'Continuer'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ProfileSetup
