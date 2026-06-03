import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getHistory } from '../lib/quizResults'
import type { HistoryEntry } from '../lib/quizResults'
import BottomNav from './BottomNav'
import type { AppView } from './BottomNav'
import Logo from './Logo'
import './History.css'

// Note sur 10 à partir du taux de réussite.
function noteOn10(successRate: number | null): number {
  return successRate != null ? Math.round(successRate * 10) : 0
}

// Couleur de la carte selon la note.
function toneClass(note: number): string {
  if (note >= 7) return 'hist__cell--green'
  if (note >= 4) return 'hist__cell--yellow'
  return 'hist__cell--red'
}

// Date « 01.06.2026 ».
function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`
}

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
          <Logo variant="text" />
        </span>
        <button type="button" className="hist__settings" aria-label="Réglages">
          Réglages ⚙
        </button>
      </header>

      <h1 className="hist__title">Historique</h1>

      <div className="hist__card">
        {loading ? (
          <p className="hist__empty">Chargement…</p>
        ) : entries.length === 0 ? (
          <p className="hist__empty">
            Aucun test terminé pour l'instant. Lance un quiz&nbsp;!
          </p>
        ) : (
          <div className="hist__grid">
            {entries.map((e) => {
              const note = noteOn10(e.successRate)
              return (
                <div key={e.id} className={'hist__cell ' + toneClass(note)}>
                  <div className="hist__cell-score">
                    <span className="hist__cell-num">{note}</span>
                    <span className="hist__cell-den">/10</span>
                  </div>
                  <div className="hist__cell-date">Fait le {formatDate(e.date)}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <BottomNav active="history" onNavigate={onNavigate} />
    </div>
  )
}

export default History
