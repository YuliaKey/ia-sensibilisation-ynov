import './Logo.css'

type LogoProps = {
  /** 'full' = icône + texte  |  'icon' = icône seule  |  'text' = texte seul */
  variant?: 'full' | 'icon' | 'text'
  className?: string
}

function Logo({ variant = 'full', className = '' }: LogoProps) {
  return (
    <span className={`logo-wrap ${className}`}>
      {(variant === 'full' || variant === 'icon') && (
        <img
          src={`${import.meta.env.BASE_URL}logo-icon.svg`}
          alt=""
          className="logo-wrap__icon"
          aria-hidden="true"
        />
      )}
      {(variant === 'full' || variant === 'text') && (
        <img
          src={`${import.meta.env.BASE_URL}logo-text.svg`}
          alt="prisme"
          className="logo-wrap__text"
        />
      )}
    </span>
  )
}

export default Logo
