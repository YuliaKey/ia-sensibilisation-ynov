import './BottomNav.css'

export type AppView = 'quiz' | 'leaderboard' | 'history'

type BottomNavProps = {
  active: AppView
  onNavigate: (view: AppView) => void
}

function BottomNav({ active, onNavigate }: BottomNavProps) {
  return (
    <nav className="navbar" aria-label="Navigation">
      <div className="navbar__group">
        <button
          type="button"
          className={'navbar__btn' + (active === 'quiz' ? ' navbar__btn--active' : '')}
          onClick={() => onNavigate('quiz')}
          aria-label="Accueil"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
        </button>

        <button
          type="button"
          className={
            'navbar__btn' + (active === 'leaderboard' ? ' navbar__btn--active' : '')
          }
          onClick={() => onNavigate('leaderboard')}
          aria-label="Classement"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M7 4h10v2h3v3a4 4 0 0 1-4 4 5 5 0 0 1-3 2v2h3v3H8v-3h3v-2a5 5 0 0 1-3-2 4 4 0 0 1-4-4V6h3V4zm0 4H6v1a2 2 0 0 0 1 1.7V8zm10 0v2.7A2 2 0 0 0 18 9V8h-1z" />
          </svg>
        </button>

        <button
          type="button"
          className="navbar__btn"
          aria-label="Profil (bientôt disponible)"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </button>
      </div>
    </nav>
  )
}

export default BottomNav
