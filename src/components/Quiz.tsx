import { useEffect, useState } from 'react'
import questionsData from '../assets/questions-conseil-strategie.json'
import { BASE_POINTS, TEST_USER_ID, getUserLevel, saveQuizResult } from '../lib/quizResults'
import './Quiz.css'

type SkillLevel = 'beginner' | 'curious' | 'expert'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

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

const seedQuestionsFromAi = questionsData as Question[]

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

// Tire une série de questions du niveau donné, au hasard, avec options mélangées.
function buildSeries(level: SkillLevel): Question[] {
  const pool = seedQuestionsFromAi.filter((q) => q.difficulty_label === level)
  return shuffle(pool).slice(0, SERIES_SIZE).map(shuffleOptions)
}

function Quiz() {
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
  const [saveState, setSaveState] = useState<SaveState>('idle')

  // Démarre une série pour un niveau donné et réinitialise l'état du quiz.
  const startSeries = (lvl: SkillLevel) => {
    setQuestions(buildSeries(lvl))
    setIndex(0)
    setSelected(null)
    setValidated(false)
    setScore(0)
    setFinished(false)
    setSaveState('idle')
  }

  // Applique le niveau lu en base et démarre une série (défaut 'beginner').
  const applyLevelAndStart = (lvl: SkillLevel | null) => {
    const effective = lvl ?? 'beginner'
    setLevel(effective)
    startSeries(effective)
    setLoading(false)
  }

  // Au montage : récupère le niveau du user puis lance la première série.
  useEffect(() => {
    let cancelled = false
    getUserLevel(TEST_USER_ID).then(({ level: lvl }) => {
      if (!cancelled) applyLevelAndStart(lvl)
    })
    return () => {
      cancelled = true
    }
    // Effet de montage uniquement : on charge le niveau une seule fois.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Nouvelle série : on relit le niveau (il a pu évoluer via la logique adaptative).
  const startNewSeries = () => {
    setLoading(true)
    getUserLevel(TEST_USER_ID).then(({ level: lvl }) => applyLevelAndStart(lvl))
  }

  // Termine la série : affiche les résultats et enregistre le score en base.
  const finishQuiz = async (correctCount: number) => {
    setFinished(true)
    setSaveState('saving')
    const { error } = await saveQuizResult({
      userId: TEST_USER_ID,
      level: level ?? 'beginner',
      correctCount,
      totalCount: questions.length,
    })
    setSaveState(error ? 'error' : 'saved')
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
    return (
      <div className="quiz">
        <div className="quiz__card">
          <div className="quiz__result">
            <h1 className="quiz__result-title">Quiz terminé&nbsp;!</h1>
            <p className="quiz__result-score">
              {score} / {questions.length} bonnes réponses
            </p>
            <p className="quiz__result-points">+{score * BASE_POINTS} points</p>

            <p className="quiz__save-state">
              {saveState === 'saving' && 'Enregistrement…'}
              {saveState === 'saved' && '✓ Score enregistré'}
              {saveState === 'error' && '⚠ Score non enregistré (hors ligne)'}
            </p>

            <button type="button" className="quiz__cta" onClick={startNewSeries}>
              Nouvelle série
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="quiz">
      <div className="quiz__card">
        <header className="quiz__header">
          <span className="quiz__progress">
            Question {index + 1} / {questions.length}
          </span>
          <span className="quiz__category">{question.category}</span>
        </header>

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
          <div
            className={
              'quiz__feedback ' +
              (isCorrect ? 'quiz__feedback--ok' : 'quiz__feedback--ko')
            }
          >
            <strong>{isCorrect ? 'Bonne réponse !' : 'Mauvaise réponse.'}</strong>
            <p>{question.explanation}</p>
          </div>
        )}

        <footer className="quiz__footer">
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
              {isLast ? 'Voir les résultats' : '→'}
            </button>
          )}
        </footer>
      </div>
    </div>
  )
}

export default Quiz
