import Logo from './Logo'
import './BottomNav.css'

export type AppView = 'quiz' | 'leaderboard' | 'history' | 'profile'

type BottomNavProps = {
  active: AppView
  onNavigate: (view: AppView) => void
}

// Mobile : Accueil + Classement + Profil (Historique accessible depuis l'écran résultat)
const MOBILE_ITEMS: { view: AppView | null; label: string; icon: string }[] = [
  { view: 'quiz', label: 'Accueil', icon: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' },
  {
    view: 'leaderboard',
    label: 'Classement',
    icon: 'M7 4h10v2h3v3a4 4 0 0 1-4 4 5 5 0 0 1-3 2v2h3v3H8v-3h3v-2a5 5 0 0 1-3-2 4 4 0 0 1-4-4V6h3V4zm0 4H6v1a2 2 0 0 0 1 1.7V8zm10 0v2.7A2 2 0 0 0 18 9V8h-1z',
  },
  {
    view: 'profile' as AppView,
    label: 'Profil',
    icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  },
]

// Desktop : liens texte (Accueil + Classement)
const DESKTOP_LINKS: { view: AppView; label: string }[] = [
  { view: 'quiz', label: 'Accueil' },
  { view: 'leaderboard', label: 'Classement' },
  { view: 'profile', label: 'Profil' },
]

function BottomNav({ active, onNavigate }: BottomNavProps) {
  return (
    <nav className="navbar" aria-label="Navigation">
      {/* Mobile : groupe segmenté en bas */}
      <div className="navbar__group navbar__group--mobile">
        {MOBILE_ITEMS.map((item) => (
          <button
            key={item.label}
            type="button"
            className={
              'navbar__btn' + (item.view && active === item.view ? ' navbar__btn--active' : '')
            }
            onClick={() => item.view && onNavigate(item.view)}
            aria-label={item.label}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d={item.icon} />
            </svg>
          </button>
        ))}
      </div>
      {/* Desktop : barre de navigation classique */}
      <div className="navbar__desktop">
        <Logo variant="full" className="logo-wrap--lg" />
        <div className="navbar__desktop-links">
          {DESKTOP_LINKS.map((item) => (
            <button
              key={item.label}
              type="button"
              className={
                'navbar__desktop-link' +
                (active === item.view ? ' navbar__desktop-link--active' : '')
              }
              onClick={() => onNavigate(item.view)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default BottomNav
