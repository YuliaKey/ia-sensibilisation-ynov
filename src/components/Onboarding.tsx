import { useState } from 'react'
import './Onboarding.css'

type Step = {
  /** Grand titre affiché au-dessus (optionnel, ex. « Bienvenue ») */
  heading?: string
  /** Mot mis en avant (en gras) au début du titre */
  highlight: string
  /** Suite du titre */
  text: string
  /** Libellé du bouton */
  cta: string
}

const STEPS: Step[] = [
  { heading: 'Bienvenue', highlight: 'Apprenez', text: "comment utiliser l'IA", cta: 'Continuer →' },
  { highlight: 'Découvrez', text: 'des nouveaux workflows', cta: 'Continuer →' },
  { highlight: 'Exécutez', text: 'vos tâches plus rapidement', cta: 'Commencer' },
]

type OnboardingProps = {
  /** Appelé une fois l'onboarding terminé (bouton « Commencer ») */
  onFinish: () => void
}

function Onboarding({ onFinish }: OnboardingProps) {
  const [index, setIndex] = useState(0)
  const step = STEPS[index]
  const isLast = index === STEPS.length - 1

  const handleNext = () => {
    if (isLast) {
      onFinish()
    } else {
      setIndex((i) => i + 1)
    }
  }

  return (
    <div className="onboarding">
      <div className="onboarding__card">
        <div className="onboarding__body">
          {step.heading && <h1 className="onboarding__heading">{step.heading}</h1>}
          <p className="onboarding__title">
            <strong>{step.highlight}</strong> {step.text}
          </p>
        </div>

        <div className="onboarding__footer">
          <div className="onboarding__dots" role="tablist" aria-label="Progression">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={
                  'onboarding__dot' + (i === index ? ' onboarding__dot--active' : '')
                }
              />
            ))}
          </div>

          <button type="button" className="onboarding__cta" onClick={handleNext}>
            {step.cta}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Onboarding
