import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import BottomNav from './BottomNav'
import type { AppView } from './BottomNav'
import Logo from './Logo'
import './Profile.css'

type Badge = {
  id: string
  label: string
  sublabel: string
}

type ProfileProps = {
  onNavigate: (view: AppView) => void
  onSettings: () => void
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
}

function Profile({ onNavigate, onSettings }: ProfileProps) {
  const { profile, session } = useAuth()

  const [serviceName,   setServiceName]   = useState<string | null>(null)
  const [quizCount,     setQuizCount]     = useState(0)
  const [badges,        setBadges]        = useState<Badge[]>([])
  const [loading,       setLoading]       = useState(true)
  const [avatarUrl,     setAvatarUrl]     = useState<string | null>(null)
  const [avatarVersion, setAvatarVersion] = useState(Date.now())
  const [uploading,     setUploading]     = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!profile || !session) return
    let cancelled = false

    async function load() {
      const [serviceRes, quizRes, rankRes] = await Promise.all([
        profile!.service_id
          ? supabase.from('services').select('name').eq('id', profile!.service_id).single()
          : Promise.resolve({ data: null }),
        supabase
          .from('user_quiz_sessions')
          .select('id, success_rate, score')
          .eq('user_id', session!.user.id)
          .eq('status', 'completed'),
        profile!.service_id
          ? supabase
              .from('users')
              .select('id, total_score')
              .eq('service_id', profile!.service_id)
          : Promise.resolve({ data: null }),
      ])

      if (cancelled) return

      if (serviceRes.data) setServiceName((serviceRes.data as { name: string }).name)

      const sessions = (quizRes.data ?? []) as { id: string; success_rate: number; score: number }[]
      setQuizCount(sessions.length)

      const earned: Badge[] = []

      // Badge : premier quiz
      if (sessions.length >= 1) {
        earned.push({ id: 'first', label: 'Premier quiz !', sublabel: 'Bienvenue dans l\'aventure' })
      }
      // Badge : 5 quiz
      if (sessions.length >= 5) {
        earned.push({ id: 'five', label: '5 quiz complétés', sublabel: 'Tu prends le rythme !' })
      }
      // Badge : 10 quiz
      if (sessions.length >= 10) {
        earned.push({ id: 'ten', label: '10 quiz complétés', sublabel: 'Régulier au rendez-vous' })
      }
      // Badge : score parfait
      const hasPerfect = sessions.some(s => s.success_rate === 1)
      if (hasPerfect) {
        earned.push({ id: 'perfect', label: 'Score parfait', sublabel: '100% de bonnes réponses' })
      }
      // Badge : top 15% du service
      const serviceUsers = (rankRes.data ?? []) as { id: string; total_score: number }[]
      if (serviceUsers.length >= 3 && profile) {
        const sorted = [...serviceUsers].sort((a, b) => b.total_score - a.total_score)
        const rank   = sorted.findIndex(u => u.id === profile!.id) + 1
        const pct    = rank / sorted.length
        const svcLabel = (serviceRes.data as { name: string } | null)?.name ?? 'votre service'
        if (pct <= 0.15) {
          earned.push({ id: 'top15', label: `Top 15%`, sublabel: `de ${svcLabel}` })
        } else if (pct <= 0.25) {
          earned.push({ id: 'top25', label: `Top 25%`, sublabel: `de ${svcLabel}` })
        }
      }

      // Remplir jusqu'à 6 avec des slots vides pour le visuel
      while (earned.length < 6) {
        earned.push({ id: `empty-${earned.length}`, label: '???', sublabel: 'Badge à débloquer' })
      }

      setBadges(earned.slice(0, 6))
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [profile, session])

  // Construit l'URL publique depuis Storage (nom de fichier = userId)
  useEffect(() => {
    if (!session) return
    const { data } = supabase.storage.from('avatars').getPublicUrl(session.user.id)
    setAvatarUrl(`${data.publicUrl}?v=${avatarVersion}`)
  }, [session, avatarVersion])

  const handleAvatarClick = () => fileInputRef.current?.click()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !session) return
    setUploading(true)
    const { error } = await supabase.storage
      .from('avatars')
      .upload(session.user.id, file, { upsert: true, contentType: file.type })
    if (!error) setAvatarVersion(Date.now())
    setUploading(false)
    // reset input pour permettre de re-sélectionner le même fichier
    e.target.value = ''
  }

  if (!profile) return null

  const initials = getInitials(profile.first_name, profile.last_name)

  return (
    <div className="profile">

      {/* Header */}
      <div className="profile__header">
        <Logo variant="text" />
        <button className="profile__settings" aria-label="Réglages" onClick={onSettings}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96a7.06 7.06 0 0 0-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.487.487 0 0 0-.59.22L2.74 8.87a.48.48 0 0 0 .12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94L2.86 14.52a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.37 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.48.48 0 0 0-.12-.61l-2.01-1.58zM12 15.6a3.6 3.6 0 1 1 0-7.2 3.6 3.6 0 0 1 0 7.2z"/>
          </svg>
          <span>Réglages</span>
        </button>
      </div>

      <div className="profile__body">

        {/* Avatar */}
        <div className="profile__avatar-wrap">
          <div className="profile__avatar">
            {avatarUrl
              ? <img
                  src={avatarUrl}
                  alt="avatar"
                  className="profile__avatar-img"
                  onError={() => setAvatarUrl(null)}
                />
              : initials
            }
          </div>
          <button
            className={`profile__avatar-edit${uploading ? ' profile__avatar-edit--loading' : ''}`}
            aria-label="Modifier la photo"
            onClick={handleAvatarClick}
            disabled={uploading}
          >
            {uploading
              ? <span className="profile__avatar-spinner" />
              : <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
            }
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>

        {/* Infos */}
        <h1 className="profile__name">{profile.first_name} {profile.last_name}</h1>
        <p className="profile__service">{serviceName ?? '—'}</p>

        <div className="profile__quiz-count">
          {loading ? '…' : `${quizCount} quiz complété${quizCount !== 1 ? 's' : ''}`}
        </div>

        {/* Badges */}
        <h2 className="profile__badges-title">Badges</h2>
        <div className="profile__badges-grid">
          {badges.map(badge => (
            <div key={badge.id} className={`profile__badge${badge.id.startsWith('empty') ? ' profile__badge--locked' : ''}`}>
              <div className="profile__badge-icon">
                <svg viewBox="0 0 64 64" width="48" height="48">
                  <path d="M32 4 L44 14 L58 14 L58 28 Q58 46 32 58 Q6 46 6 28 L6 14 L20 14 Z" fill="#c8960c" />
                  <path d="M32 8 L42 17 L55 17 L55 28 Q55 44 32 54 Q9 44 9 28 L9 17 L22 17 Z" fill="#f0b429" />
                  <polygon points="32,14 34.5,21.5 42.5,21.5 36.2,26.3 38.7,33.8 32,29.2 25.3,33.8 27.8,26.3 21.5,21.5 29.5,21.5" fill="#fff9e6" />
                </svg>
              </div>
              <span className="profile__badge-label">{badge.label}</span>
              <span className="profile__badge-sub">{badge.sublabel}</span>
            </div>
          ))}
        </div>
      </div>

      <BottomNav active="profile" onNavigate={onNavigate} onSettings={onSettings} />
    </div>
  )
}

export default Profile
