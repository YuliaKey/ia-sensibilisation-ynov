import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getHistory } from '../lib/quizResults'
import type { HistoryEntry } from '../lib/quizResults'
import BottomNav from './BottomNav'
import type { AppView } from './BottomNav'
import './History.css'

const LEVEL_LABELS: Record<HistoryEntry['level'], string> = {
  beginner: 'Débutant',
  curious: 'Curieux',
  expert: 'Expert',
}

const dateFmt = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

type HistoryProps = {
  onNavigate: (view: AppView) => void
}

function History({ onNavigate }: HistoryProps) {
  const { session } = useAuth()
  const userId = session?.user.id

  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    getHistory(userId).then((rows) => {
      if (!cancelled) {
        setEntries(rows)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [userId])

  return (
    <div className="hist">
      <header className="hist__top">
        <span className="hist__logo">
          <span className="hist__spark">✦&nbsp;</span>prisme
        </span>
      </header>

      <h1 className="hist__title">Historique</h1>
      <p className="hist__subtitle">Tes derniers tests</p>

      <div className="hist__card">
        {loading ? (
          <p className="hist__empty">Chargement…</p>
        ) : entries.length === 0 ? (
          <p className="hist__empty">
            Aucun test terminé pour l'instant. Lance un quiz&nbsp;!
          </p>
        ) : (
          <ul className="hist__list">
            {entries.map((e) => {
              const rate = e.successRate != null ? Math.round(e.successRate * 100) : 0
              return (
                <li key={e.id} className="hist__row">
                  <div className="hist__main">
                    <span className="hist__date">
                      {e.date ? dateFmt.format(new Date(e.date)) : '—'}
                    </span>
                    <span className="hist__level">{LEVEL_LABELS[e.level]}</span>
                  </div>
                  <div className="hist__stats">
                    <span className="hist__rate">{rate}%</span>
                    <span className="hist__points">+{e.score} pts</span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <BottomNav active="history" onNavigate={onNavigate} />
    </div>
  )
}

export default History
