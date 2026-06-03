import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import BottomNav from './BottomNav'
import type { AppView } from './BottomNav'
import Logo from './Logo'
import './Home.css'

type HomeProps = {
  onStartQuiz: () => void
  onNavigate:  (view: AppView) => void
}

const GAUGE_R   = 54
const GAUGE_C   = 2 * Math.PI * GAUGE_R
const TRACK_LEN = GAUGE_C * 0.78

function Home({ onStartQuiz, onNavigate }: HomeProps) {
  //profile,
  const { session } = useAuth()

  const [quizCount, setQuizCount] = useState<number>(0)
  const [moyenne,   setMoyenne]   = useState<number>(0)

  useEffect(() => {
    if (!session) return
    let cancelled = false

    supabase
      .from('user_quiz_sessions')
      .select('success_rate')
      .eq('user_id', session.user.id)
      .eq('status', 'completed')
      .then(({ data }) => {
        if (cancelled || !data) return
        const sessions = data as { success_rate: number }[]
        setQuizCount(sessions.length)
        if (sessions.length > 0) {
          const avg = sessions.reduce((sum, s) => sum + (s.success_rate ?? 0), 0) / sessions.length
          setMoyenne(Math.round(avg * 10))
        }
      })

    return () => { cancelled = true }
  }, [session])

  const ratio     = moyenne / 10
  const filledLen = TRACK_LEN * ratio

  return (
    <div className="home">

      {/* Header */}
      <div className="home__header">
        <Logo variant="text" />
      </div>

      <div className="home__body">
        <h1 className="home__title">Vos statistiques</h1>

        {/* Stats card */}
        <div className="home__card">
          <p className="home__card-hint">
            Complétez votre quiz hebdomadaire<br />pour maintenir votre moyenne !
          </p>

          {/* Gauge */}
          <div className="home__gauge-wrap">
            <svg className="home__gauge-svg" viewBox="0 0 130 130">
              <circle
                className="home__gauge-track"
                cx="65" cy="65" r={GAUGE_R}
                style={{ strokeDasharray: `${TRACK_LEN} ${GAUGE_C}` }}
              />
              <circle
                className="home__gauge-fill"
                cx="65" cy="65" r={GAUGE_R}
                style={{ strokeDasharray: `${filledLen} ${GAUGE_C}` }}
              />
            </svg>

            <div className="home__gauge-center">
              <span className="home__gauge-score">{moyenne}</span>
              <span className="home__gauge-denom">/10</span>
              <span className="home__gauge-label">moyenne</span>
            </div>

            {/* Sparkles */}
            <span className="home__sparkle home__sparkle--tl">✦</span>
            <span className="home__sparkle home__sparkle--tr">✦</span>
            <span className="home__sparkle home__sparkle--bl">✦</span>
          </div>
        </div>

        {/* Quiz count */}
        <p className="home__quiz-count">
          {quizCount > 0 ? `${quizCount} quiz complété${quizCount > 1 ? 's' : ''}` : 'Aucun quiz complété pour l\'instant'}
        </p>

        {/* Buttons */}
        <button className="home__cta" onClick={onStartQuiz}>
          Nouveau quiz
        </button>

        <button className="home__history" onClick={() => onNavigate('history')}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M3 9h14V7H3v2zm0 4h14v-2H3v2zm0 4h7v-2H3v2zM21 6l-3 3-3-3 1.41-1.41L18 7.17l1.59-1.58L21 6zm0 8l-3 3-3-3 1.41-1.41L18 15.17l1.59-1.58L21 14z"/>
          </svg>
          Historique
        </button>
      </div>

      <BottomNav active="quiz" onNavigate={onNavigate} />
    </div>
  )
}

export default Home
