import './LoginScreen.css'

type LoginScreenProps = {
  /** Appelé au clic sur « Se connecter via SSO » */
  onLogin: () => void
  /** Appelé au clic sur « Politique de confidentialité » */
  onShowPrivacy: () => void
}

function LoginScreen({ onLogin, onShowPrivacy }: LoginScreenProps) {
  return (
    <div className="login">
      <div className="login__card">
        <div className="login__body">
          <h1 className="login__heading">Bienvenue</h1>
        </div>

        <div className="login__footer">
          <button type="button" className="login__cta" onClick={onLogin}>
            Se connecter via SSO
          </button>
          <button type="button" className="login__link" onClick={onShowPrivacy}>
            Politique de confidentialité
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginScreen
