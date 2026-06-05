import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { BASE_POINTS, getUserLevel, saveQuizResult } from '../lib/quizResults'
import BottomNav from './BottomNav'
import type { AppView } from './BottomNav'
import Logo from './Logo'
import './Quiz.css'

// ── Imports des banques de questions par service ──────────────────────────────
import strategieQuestions    from '../assets/questions-strategie.json'
import generalQuestions      from '../assets/questions-general.json'
import rhQuestions           from '../assets/questions-rh.json'
import financeQuestions      from '../assets/questions-finance.json'
import informatiqueQuestions from '../assets/questions-informatique.json'
import directionQuestions    from '../assets/questions-direction.json'
import administratifQuestions from '../assets/questions-administratif.json'
import marketingQuestions    from '../assets/questions-communication-marketing.json'
import commercialQuestions   from '../assets/questions-commercial.json'
import juridiqueQuestions    from '../assets/questions-juridique.json'

type SkillLevel = 'beginner' | 'curious' | 'expert'

type Question = {
  id: number
  difficulty: number
  difficulty_label: SkillLevel
  category: string
  question: string
  options: string[]
  correct_index: number
  correct_answer: string
  explanation: string
}

// Nombre de questions par série.
const SERIES_SIZE = 8

/** Mapping nom de service → banque de questions.
 *  Clés = noms exacts des services dans la table `services`.
 *  Fallback : questions Stratégie si le service n'est pas reconnu. */
const QUESTIONS_BY_SERVICE: Record<string, Question[]> = {
  'Stratégie':               strategieQuestions    as Question[],
  'Ressources Humaines':     rhQuestions           as Question[],
  'Finance':                 financeQuestions      as Question[],
  'Informatique':            informatiqueQuestions as Question[],
  'Direction':               directionQuestions    as Question[],
  'Administratif':           administratifQuestions as Question[],
  'Communication & Marketing': marketingQuestions  as Question[],
  'Commercial':              commercialQuestions   as Question[],
  'Juridique':               juridiqueQuestions    as Question[],
}

/** Retourne la banque de questions adaptée au service.
 *  Fallback : questions générales (service "Autre" ou non reconnu). */
function getQuestionsForService(service: string | null): Question[] {
  if (service && QUESTIONS_BY_SERVICE[service]) {
    return QUESTIONS_BY_SERVICE[service]
  }
  // Pas de service ou service "Autre" → questions générales
  return generalQuestions as Question[]
}

// Mélange aléatoire (Fisher-Yates) sur une copie du tableau.
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Mélange les options d'une question en recalculant correct_index sur la bonne réponse.
function shuffleOptions(q: Question): Question {
  const correctText = q.options[q.correct_index]
  const options = shuffle(q.options)
  return {
    ...q,
    options,
    correct_index: options.indexOf(correctText),
    correct_answer: correctText,
  }
}

/** Tire une série depuis la banque adaptée au service et au niveau. */
function buildSeries(level: SkillLevel, pool: Question[]): Question[] {
  const filtered = pool.filter((q) => q.difficulty_label === level)
  return shuffle(filtered).slice(0, SERIES_SIZE).map(shuffleOptions)
}

type QuizProps = {
  onNavigate: (view: AppView) => void
  onHome?:    () => void
  onSettings?: () => void
}

function Quiz({ onNavigate, onHome, onSettings }: QuizProps) {
  // Utilisateur authentifié (App ne rend le Quiz que si une session existe).
  const { session, profile, serviceName } = useAuth()
  const userId    = session?.user.id
  const firstName = profile?.first_name ?? ''

  // Banque de questions adaptée au service de l'utilisateur.
  const questionPool = getQuestionsForService(serviceName)

  // Niveau de l'utilisateur, récupéré dynamiquement depuis la base.
  const [level, setLevel] = useState<SkillLevel | null>(null)
  const [loading, setLoading] = useState(true)

  // La série courante (8 questions). Re-tirée à chaque "Nouvelle série".
  const [questions, setQuestions] = useState<Question[]>([])

  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [validated, setValidated] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  // Démarre une série pour un niveau donné et réinitialise l'état du quiz.
  const startSeries = (lvl: SkillLevel) => {
    setQuestions(buildSeries(lvl, questionPool))
    setIndex(0)
    setSelected(null)
    setValidated(false)
    setScore(0)
    setFinished(false)
  }

  // Applique le niveau lu en base et démarre une série (défaut 'beginner').
  const applyLevelAndStart = (lvl: SkillLevel | null) => {
    const effective = lvl ?? 'beginner'
    setLevel(effective)
    startSeries(effective)
    setLoading(false)
  }

  // Au montage (et si l'utilisateur change) : récupère son niveau puis lance une série.
  useEffect(() => {
    if (!userId) return
    let cancelled = false
    getUserLevel(userId).then(({ level: lvl }) => {
      if (!cancelled) applyLevelAndStart(lvl)
    })
    return () => {
      cancelled = true
    }
    // On ne dépend que de l'utilisateur : recharge le niveau quand il change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // Nouvelle série : on relit le niveau (il a pu évoluer via la logique adaptative).
  const startNewSeries = () => {
    if (!userId) return
    setLoading(true)
    getUserLevel(userId).then(({ level: lvl }) => applyLevelAndStart(lvl))
  }

  // Termine la série : affiche les résultats et enregistre le score en base.
  const finishQuiz = async (correctCount: number) => {
    if (!userId) return
    setFinished(true)
    await saveQuizResult({
      userId,
      level: level ?? 'beginner',
      correctCount,
      totalCount: questions.length,
    })
  }

  const question = questions[index]
  const isLast = index === questions.length - 1
  const isCorrect = selected === question?.correct_index

  const handleValidate = () => {
    if (selected === null) return
    setValidated(true)
    if (selected === question.correct_index) {
      setScore((s) => s + 1)
    }
    
  }

  const handleNext = () => {
    if (isLast) {
      // À ce stade, la dernière réponse a déjà été validée : `score` est à jour.
      finishQuiz(score)
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
    setValidated(false)
    setShowExplanation(false)
  }

  // Chargement du niveau de l'utilisateur.
  if (loading) {
    return (
      <div className="quiz">
        <div className="quiz__card">
          <p className="quiz__empty">Chargement…</p>
        </div>
      </div>
    )
  }

  // Cas limite : aucun jeu de questions pour ce niveau.
  if (questions.length === 0) {
    return (
      <div className="quiz">
        <div className="quiz__card">
          <p className="quiz__empty">
            Aucune question disponible pour le niveau « {level} ».
          </p>
        </div>
      </div>
    )
  }

  // Écran de résultats.
  if (finished) {
    const total = questions.length
    const ratio = total > 0 ? score / total : 0
    // Jauge : arc de 270° (¾ du cercle), rempli proportionnellement au score.
    const GAUGE_R = 42
    const GAUGE_C = 2 * Math.PI * GAUGE_R
    const trackLen = GAUGE_C * 0.75
    const filledLen = trackLen * ratio
    return (
      <div className="quiz">
        <header className="quiz__brand">
          <Logo variant="full" />
        </header>

        <div className="quiz__top">
          <Logo variant="text" />
          <button
            type="button"
            className="quiz__close"
            onClick={startNewSeries}
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>
        <div className="quiz__tab">Résultat</div>

        <div className="quiz__card">
          <div className="quiz__result">
            <div className="quiz__gauge">
              <svg className="quiz__gauge-svg" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="gaugeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="55%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#22c55e" />
                  </linearGradient>
                </defs>
                <circle
                  className="quiz__gauge-track"
                  cx="50"
                  cy="50"
                  r={GAUGE_R}
                  style={{ strokeDasharray: `${trackLen} ${GAUGE_C}` }}
                />
                <circle
                  className="quiz__gauge-value"
                  cx="50"
                  cy="50"
                  r={GAUGE_R}
                  style={{ strokeDasharray: `${filledLen} ${GAUGE_C}` }}
                />
              </svg>
              <div className="quiz__gauge-center">
                <span className="quiz__gauge-score">{score}</span>
                <span className="quiz__gauge-total">/ {total}</span>
              </div>
            </div>

            <h1 className="quiz__result-title">
              Bravo{firstName ? `, ${firstName}` : ''}&nbsp;!
            </h1>

            {ratio >= 0.7 && (
              <span className="quiz__badge">Top 15% de ton entreprise</span>
            )}

            <p className="quiz__result-points">+{score * BASE_POINTS} points</p>

            <button
              type="button"
              className="quiz__cta quiz__cta--pink"
              onClick={onHome ?? startNewSeries}
            >
              Revenir à l'accueil
            </button>
            <button
              type="button"
              className="quiz__link"
              onClick={() => onNavigate('history')}
            >
              ☰ Historique
            </button>
          </div>
        </div>

        <BottomNav active="quiz" onNavigate={onNavigate} onSettings={onSettings} />
      </div>
    )
  }

  return (
    <div className="quiz">
      {/* En-tête marque (desktop uniquement) */}
      <header className="quiz__brand">
        <Logo variant="full" />
      </header>

      {/* En-tête mobile : logo + fermer */}
      <div className="quiz__top">
        <Logo variant="text" />
        <button
          type="button"
          className="quiz__close"
          onClick={startNewSeries}
          aria-label="Fermer la session"
        >
          ✕
        </button>
      </div>
      <div className="quiz__tab">Quiz</div>

      <div className="quiz__card">
        {/* Barre de progression segmentée (desktop uniquement) */}
        <div className="quiz__bar" aria-hidden="true">
          {questions.map((_, i) => (
            <span
              key={i}
              className={'quiz__seg' + (i <= index ? ' quiz__seg--done' : '')}
            />
          ))}
        </div>

        <header className="quiz__header">
          <span className="quiz__progress">
            Question {index + 1} / {questions.length}
          </span>
          <span className="quiz__category">{question.category}</span>
        </header>

        <p className="quiz__qnum">Question {index + 1}</p>
        <h2 className="quiz__question">{question.question}</h2>

        <ul className="quiz__options">
          {question.options.map((option, i) => {
            // Classes d'état une fois la réponse validée.
            let stateClass = ''
            if (validated) {
              if (i === question.correct_index) stateClass = ' quiz__option--correct'
              else if (i === selected) stateClass = ' quiz__option--wrong'
            } else if (i === selected) {
              stateClass = ' quiz__option--selected'
            }

            return (
              <li key={i}>
                <button
                  type="button"
                  className={'quiz__option' + stateClass}
                  onClick={() => setSelected(i)}
                  disabled={validated}
                >
                  {option}
                </button>
              </li>
            )
          })}
        </ul>

        {validated && (
          <button
            type="button"
            className="quiz__explain-toggle"
            onClick={() => setShowExplanation((v) => !v)}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />
            </svg>
            Explications
          </button>
        )}

        {validated && showExplanation && (
          <div
            className={
              'quiz__feedback ' +
              (isCorrect ? 'quiz__feedback--ok' : 'quiz__feedback--ko')
            }
          >
            <div className="quiz__feedback-head">
              <strong>{isCorrect ? 'Bonne réponse !' : 'Mauvaise réponse'}</strong>
              <button
                type="button"
                className="quiz__feedback-close"
                onClick={() => setShowExplanation(false)}
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>
            <p>{question.explanation}</p>
          </div>
        )}

        <footer className="quiz__footer">
          <button
            type="button"
            className="quiz__back"
            onClick={() => {
              if (index > 0) {
                setIndex((i) => i - 1)
                setSelected(null)
                setValidated(false)
                setShowExplanation(false)
              }
            }}
            disabled={index === 0}
            aria-label="Question précédente"
          >
            ←
          </button>

          {!validated ? (
            <button
              type="button"
              className="quiz__cta"
              onClick={handleValidate}
              disabled={selected === null}
            >
              Valider
            </button>
          ) : (
            <button type="button" className="quiz__cta" onClick={handleNext}>
              {isLast ? 'Voir les résultats' : 'Question suivante'}
            </button>
          )}
        </footer>
      </div>

      <BottomNav active="quiz" onNavigate={onNavigate} />
    </div>
  )
}

export default Quiz
