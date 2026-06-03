import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import BottomNav from './BottomNav'
import type { AppView } from './BottomNav'
import './Leaderboard.css'

type UserRow = {
  id: string
  first_name: string
  last_name: string
  total_score: number
  service_id: string | null
}

type Mode = 'person' | 'service'

type DisplayRow = {
  key: string
  name: string
  sub: string
  score: number
  me: boolean
}

const MEDALS = ['🥇', '🥈', '🥉']

type LeaderboardProps = {
  onNavigate: (view: AppView) => void
}

function Leaderboard({ onNavigate }: LeaderboardProps) {
  const { session, profile } = useAuth()
  const meId = session?.user.id
  const myServiceId = profile?.service_id ?? null

  const [mode, setMode] = useState<Mode>('person')
  const [users, setUsers] = useState<UserRow[]>([])
  const [serviceNames, setServiceNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      supabase
        .from('users')
        .select('id, first_name, last_name, total_score, service_id')
        .order('total_score', { ascending: false }),
      supabase.from('services').select('id, name'),
    ]).then(([usersRes, servicesRes]) => {
      if (cancelled) return
      setUsers(usersRes.data ?? [])
      const map: Record<string, string> = {}
      for (const s of servicesRes.data ?? []) map[s.id] = s.name
      setServiceNames(map)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Classement par personne
  const personRows: DisplayRow[] = users.map((u) => ({
    key: u.id,
    name: `${u.first_name} ${u.last_name}`,
    sub: u.service_id ? serviceNames[u.service_id] ?? '' : '',
    score: u.total_score,
    me: u.id === meId,
  }))

  // Classement par service (somme des scores)
  const totals = new Map<string, number>()
  for (const u of users) {
    if (u.service_id) totals.set(u.service_id, (totals.get(u.service_id) ?? 0) + u.total_score)
  }
  const serviceRows: DisplayRow[] = [...totals.entries()]
    .map(([id, total]) => ({
      key: id,
      name: serviceNames[id] ?? '—',
      sub: '',
      score: total,
      me: id === myServiceId,
    }))
    .sort((a, b) => b.score - a.score)

  const rows = mode === 'person' ? personRows : serviceRows

  return (
    <div className="lb">
      <header className="lb__top">
        <span className="lb__logo">
          prisme
        </span>
        <button
          type="button"
          className="lb__close"
          onClick={() => onNavigate('quiz')}
          aria-label="Fermer"
        >
          ✕
        </button>
      </header>

      <h1 className="lb__title">Classement</h1>
      <p className="lb__subtitle">Les meilleurs scores cumulés</p>

      <div className="lb__toggle" role="tablist">
        <button
          type="button"
          className={'lb__tab' + (mode === 'person' ? ' lb__tab--active' : '')}
          onClick={() => setMode('person')}
        >
          par personne
        </button>
        <button
          type="button"
          className={'lb__tab' + (mode === 'service' ? ' lb__tab--active' : '')}
          onClick={() => setMode('service')}
        >
          par service
        </button>
      </div>

      <div className="lb__card">
        {loading ? (
          <p className="lb__empty">Chargement…</p>
        ) : rows.length === 0 ? (
          <p className="lb__empty">Aucune donnée pour le moment.</p>
        ) : (
          <ol className="lb__list">
            {rows.map((r, i) => (
              <li key={r.key} className={'lb__row' + (r.me ? ' lb__row--me' : '')}>
                <span className="lb__rank">{MEDALS[i] ?? i + 1}</span>
                <span className="lb__info">
                  <span className="lb__name">{r.name}</span>
                  {r.sub && <span className="lb__sub">{r.sub}</span>}
                </span>
                <span className="lb__score">{r.score} pts</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <BottomNav active="leaderboard" onNavigate={onNavigate} />
    </div>
  )
}

export default Leaderboard
