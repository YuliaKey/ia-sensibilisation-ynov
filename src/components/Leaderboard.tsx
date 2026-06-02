import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import BottomNav from './BottomNav'
import type { AppView } from './BottomNav'
import './Leaderboard.css'

type Row = {
  id: string
  first_name: string
  last_name: string
  total_score: number
}

const MEDALS = ['🥇', '🥈', '🥉']

type LeaderboardProps = {
  onNavigate: (view: AppView) => void
}

function Leaderboard({ onNavigate }: LeaderboardProps) {
  const { session } = useAuth()
  const meId = session?.user.id

  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    supabase
      .from('users')
      .select('id, first_name, last_name, total_score')
      .order('total_score', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (!cancelled) {
          setRows(data ?? [])
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="lb">
      <header className="lb__top">
        <span className="lb__logo">
          <span className="lb__spark">✦&nbsp;</span>prisme
        </span>
      </header>

      <h1 className="lb__title">Classement</h1>
      <p className="lb__subtitle">Les meilleurs scores cumulés</p>

      <div className="lb__card">
        {loading ? (
          <p className="lb__empty">Chargement…</p>
        ) : rows.length === 0 ? (
          <p className="lb__empty">Aucun score pour le moment.</p>
        ) : (
          <ol className="lb__list">
            {rows.map((r, i) => (
              <li
                key={r.id}
                className={'lb__row' + (r.id === meId ? ' lb__row--me' : '')}
              >
                <span className="lb__rank">{MEDALS[i] ?? i + 1}</span>
                <span className="lb__name">
                  {r.first_name} {r.last_name}
                  {r.id === meId && <span className="lb__you"> (vous)</span>}
                </span>
                <span className="lb__score">{r.total_score} pts</span>
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
