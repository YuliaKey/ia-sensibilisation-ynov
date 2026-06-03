import { useState } from 'react'
import type { ReactNode } from 'react'
import certificateImg from '../assets/certificate.png'
import notificationImg from '../assets/notification.png'
import reportImg from '../assets/report.png'
import mortarboardImg from '../assets/mortarboard.png'
import Logo from './Logo'
import './Onboarding.css'

type Step = {
  /** Dégradé de fond de la carte illustration */
  gradient: string
  /** Illustration : image importée */
  image?: string
  /** Légende, avec un fragment en gras */
  caption: ReactNode
  /** Libellé du bouton principal */
  cta: string
}

const STEPS: Step[] = [
  {
    gradient: 'linear-gradient(180deg, #DDBCE9, #FAFBF7)',
    image: certificateImg,
    caption: (
      <>
        <strong>Se former</strong> à l'IA n'a jamais été aussi simple avec Prisme.
      </>
    ),
    cta: 'Suivant',
  },
  {
    gradient: 'linear-gradient(180deg, #F7EAB0, #FAFBF7)',
    image: notificationImg,
    caption: (
      <>
        Quelques minutes suffisent pour <strong>renforcer vos connaissances</strong> sur
        l'IA.
      </>
    ),
    cta: 'Suivant',
  },
  {
    gradient: 'linear-gradient(180deg, #BFF2C9, #FAFBF7)',
    image: reportImg,
    caption: (
      <>
        Chaque quiz vous aide à <strong>mieux comprendre</strong> et à progresser.
      </>
    ),
    cta: 'Suivant',
  },
  {
    gradient: 'linear-gradient(180deg, #CEE8F7, #FAFBF7)',
    image: mortarboardImg,
    caption: (
      <>
        Ici, pas de compétition, seulement de l'<strong>apprentissage</strong>.
      </>
    ),
    cta: 'Commencer',
  },
]

type OnboardingProps = {
  /** Appelé à la fin de l'onboarding (« Commencer ») ou au clic sur « Passer » */
  onFinish: () => void
}

function Onboarding({ onFinish }: OnboardingProps) {
  const [index, setIndex] = useState(0)
  const step = STEPS[index]
  const isLast = index === STEPS.length - 1

  const handleNext = () => {
    if (isLast) onFinish()
    else setIndex((i) => i + 1)
  }

  const handleBack = () => setIndex((i) => Math.max(i - 1, 0))

  return (
    <div className="onb">
      <header className="onb__top">
        <Logo variant="full" />
        <button type="button" className="onb__skip" onClick={onFinish}>
          Passer
        </button>
      </header>

      <main className="onb__main">
        {/* Barre de progression (desktop uniquement) */}
        <div className="onb__progress" aria-hidden="true">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={'onb__seg' + (i <= index ? ' onb__seg--done' : '')}
            />
          ))}
        </div>
        <p className="onb__step">
          Étape {index + 1} / {STEPS.length}
        </p>

        <h1 className="onb__welcome">
          Bienvenue<span className="onb__excl">&nbsp;!</span>
          <span className="onb__wave">&nbsp;👋</span>
        </h1>

        <div className="onb__illu" style={{ background: step.gradient }}>
          <img className="onb__img" src={step.image} alt="" />
        </div>

        <div className="onb__caption-wrap">
          <p className="onb__caption">{step.caption}</p>
        </div>

        {/* Points de progression (mobile uniquement) */}
        <div className="onb__dots" role="tablist" aria-label="Progression">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={'onb__dot' + (i === index ? ' onb__dot--active' : '')}
            />
          ))}
        </div>

        <div className="onb__nav">
          <button
            type="button"
            className={'onb__back' + (index === 0 ? ' onb__back--first' : '')}
            onClick={handleBack}
            disabled={index === 0}
            aria-label="Précédent"
          >
            <span className="onb__back-icon">←</span>
            <span className="onb__back-text">Retour</span>
          </button>
          <button type="button" className="onb__cta" onClick={handleNext}>
            {step.cta}
          </button>
        </div>
      </main>
    </div>
  )
}

export default Onboarding
