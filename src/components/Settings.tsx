import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { SkillLevel } from '../types/database'
import Logo from './Logo'
import BottomNav from './BottomNav'
import type { AppView } from './BottomNav'
import './Settings.css'

type SubPage = 'profile-settings' | 'privacy' | 'language' | 'faq' | 'contact' | 'cgu' | 'charte-ia' | null

type Props = {
  onBack: () => void
  onShowPrivacy: () => void
  onNavigate?: (view: AppView) => void
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      className={`settings-toggle${on ? ' settings-toggle--on' : ''}`}
      onClick={() => onChange(!on)}
      aria-pressed={on}
    >
      <span className="settings-toggle__thumb" />
    </button>
  )
}

function Row({
  label, onClick, danger, soft, check,
}: {
  label: string; onClick?: () => void; danger?: boolean; soft?: boolean; check?: boolean
}) {
  return (
    <button
      className={`settings-row${danger ? ' settings-row--danger' : soft ? ' settings-row--soft' : ''}`}
      onClick={onClick}
    >
      <span>{label}</span>
      {check ? (
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
      ) : !danger && !soft ? (
        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>
      ) : null}
    </button>
  )
}

function SubHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <>
      <div className="settings__header">
        <button className="settings__back" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z" />
          </svg>
          Retour
        </button>
        <Logo variant="text" />
        <div style={{ width: 70 }} />
      </div>
      <h1 className="settings__title">{title}</h1>
    </>
  )
}

// ── Sub-page: Charte IA ───────────────────────────────────────────────────────

function CharteIAPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="settings">
      <SubHeader title="Charte IA" onBack={onBack} />
      <div className="settings__body">
        <div className="settings-legal">
          <h2>Charte d'utilisation responsable de l'IA</h2>
          <p><strong>Dernière mise à jour :</strong> juin 2026</p>

          <h3>1. Objectif</h3>
          <p>
            Cette charte définit les règles d'utilisation des outils d'intelligence artificielle
            au sein de l'organisation, afin de garantir un usage éthique, sécurisé et conforme
            au cadre légal en vigueur (AI Act européen, RGPD).
          </p>

          <h3>2. Ce que vous pouvez faire</h3>
          <p>Les outils d'IA peuvent être utilisés pour :</p>
          <ul>
            <li>rédiger, reformuler ou résumer des documents non confidentiels ;</li>
            <li>rechercher des informations générales et accélérer votre travail quotidien ;</li>
            <li>générer des idées, des plans ou des brouillons soumis à relecture humaine ;</li>
            <li>automatiser des tâches répétitives à faible risque.</li>
          </ul>

          <h3>3. Ce que vous ne devez pas faire</h3>
          <p>Il est interdit de :</p>
          <ul>
            <li>saisir des données personnelles, confidentielles ou couvertes par le secret professionnel ;</li>
            <li>partager des informations stratégiques, financières ou juridiques sensibles ;</li>
            <li>utiliser un outil d'IA pour prendre seul une décision à fort impact (RH, médical, juridique) ;</li>
            <li>publier du contenu généré par IA sans relecture ni validation humaine.</li>
          </ul>

          <h3>4. Responsabilité</h3>
          <p>
            Tout contenu produit avec l'aide d'un outil d'IA reste sous la responsabilité
            de l'utilisateur qui le soumet ou le publie. L'IA est un outil d'aide, pas un
            décideur autonome.
          </p>

          <h3>5. Transparence</h3>
          <p>
            Si un livrable a été produit avec l'aide d'un outil d'IA, il est recommandé de
            le mentionner auprès des destinataires concernés.
          </p>

          <h3>6. Signalement</h3>
          <p>
            Tout usage suspect ou non conforme doit être signalé à votre responsable ou
            à l'adresse <strong>chloe.leonard@ynov.com</strong>.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Sub-page: Paramètres du profil ────────────────────────────────────────────

type Service = { id: string; name: string }

const LEVEL_OPTIONS: { value: SkillLevel; label: string }[] = [
  { value: 'beginner', label: 'Novice — je n\'ai jamais utilisé l\'IA' },
  { value: 'curious',  label: 'Intermédiaire — je l\'utilise régulièrement' },
  { value: 'expert',   label: 'Avancé — je prompt et j\'automatise' },
]

function ProfileSettingsPage({ onBack }: { onBack: () => void }) {
  const { profile, session, refreshProfile } = useAuth()

  const [firstName, setFirstName] = useState(profile?.first_name ?? '')
  const [lastName,  setLastName]  = useState(profile?.last_name  ?? '')
  const [jobTitle,  setJobTitle]  = useState(profile?.job_title  ?? '')
  const [serviceId, setServiceId] = useState(profile?.service_id ?? '')
  const [level,     setLevel]     = useState<SkillLevel>(profile?.declared_level ?? 'beginner')
  const [services,  setServices]  = useState<Service[]>([])
  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  useEffect(() => {
    supabase.from('services').select('id, name').order('name').then(({ data }) => {
      if (data) setServices(data)
    })
  }, [])

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) { setError('Prénom et nom obligatoires.'); return }
    setSaving(true)
    setError(null)
    const { error: err } = await supabase.from('users').update({
      first_name:     firstName.trim(),
      last_name:      lastName.trim(),
      job_title:      jobTitle.trim() || null,
      service_id:     serviceId || null,
      declared_level: level,
    }).eq('id', session!.user.id)
    if (err) { setError(err.message); setSaving(false); return }
    await refreshProfile()
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="settings">
      <SubHeader title="Mon profil" onBack={onBack} />
      <div className="settings__body">
        <p className="settings__section-label">Identité</p>
        <input className="settings-input" placeholder="Prénom*" value={firstName} onChange={e => setFirstName(e.target.value)} />
        <input className="settings-input" placeholder="Nom*"    value={lastName}  onChange={e => setLastName(e.target.value)}  />
        <input className="settings-input" placeholder="Poste (optionnel)" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />

        <p className="settings__section-label">Service</p>
        <select className="settings-input" value={serviceId} onChange={e => setServiceId(e.target.value)}>
          <option value="">— Choisir un service —</option>
          {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        <p className="settings__section-label">Niveau IA déclaré</p>
        {LEVEL_OPTIONS.map(opt => (
          <Row key={opt.value} label={opt.label} check={level === opt.value} onClick={() => setLevel(opt.value)} />
        ))}

        {error && <p className="settings__delete-error">{error}</p>}

        <button
          className={`settings-row settings-row--save${saved ? ' settings-row--saved' : ''}`}
          onClick={handleSave}
          disabled={saving}
        >
          {saved ? 'Sauvegardé ✓' : saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>
    </div>
  )
}

// ── Sub-page: Confidentialité ─────────────────────────────────────────────────

function PrivacySettingsPage({ onBack }: { onBack: () => void }) {
  const [inLeaderboard, setInLeaderboard] = useState(
    () => localStorage.getItem('priv_leaderboard') !== 'false'
  )
  const [shareStats, setShareStats] = useState(
    () => localStorage.getItem('priv_stats') !== 'false'
  )

  const handleLeaderboard = (v: boolean) => { setInLeaderboard(v); localStorage.setItem('priv_leaderboard', String(v)) }
  const handleStats       = (v: boolean) => { setShareStats(v);    localStorage.setItem('priv_stats',       String(v)) }

  return (
    <div className="settings">
      <SubHeader title="Confidentialité" onBack={onBack} />
      <div className="settings__body">
        <p className="settings__section-label">Visibilité</p>
        <div className="settings-row settings-row--toggle">
          <span>Apparaître dans le classement</span>
          <Toggle on={inLeaderboard} onChange={handleLeaderboard} />
        </div>
        <div className="settings-row settings-row--toggle">
          <span>Partager mes statistiques</span>
          <Toggle on={shareStats} onChange={handleStats} />
        </div>
        <p className="settings__hint">
          Ces préférences contrôlent votre visibilité auprès des autres utilisateurs de votre organisation.
        </p>
      </div>
    </div>
  )
}

// ── Sub-page: Langue ──────────────────────────────────────────────────────────

const LANGUAGES = [
  { code: 'fr', label: 'Français', available: true },
  { code: 'en', label: 'English',  available: false },
  { code: 'es', label: 'Español',  available: false },
  { code: 'de', label: 'Deutsch',  available: false },
]

function LanguagePage({ onBack }: { onBack: () => void }) {
  const [lang, setLang] = useState(() => localStorage.getItem('pref_lang') ?? 'fr')

  const handleSelect = (code: string) => {
    setLang(code)
    localStorage.setItem('pref_lang', code)
  }

  return (
    <div className="settings">
      <SubHeader title="Langue" onBack={onBack} />
      <div className="settings__body">
        {LANGUAGES.map(l => (
          <button
            key={l.code}
            className={`settings-row${!l.available ? ' settings-row--disabled' : ''}`}
            onClick={() => l.available && handleSelect(l.code)}
            disabled={!l.available}
          >
            <span>{l.label}{!l.available && <span className="settings__soon"> — Bientôt</span>}</span>
            {l.available && lang === l.code && (
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Sub-page: FAQ ─────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: 'Comment fonctionne le système de niveaux ?',
    a: 'Votre niveau évolue automatiquement selon vos résultats. Un taux de réussite ≥ 80 % vous fait monter d\'un niveau, entre 50 et 79 % vous restez au même niveau, en dessous de 50 % vous descendez. Les niveaux sont : Novice → Intermédiaire → Expert.',
  },
  {
    q: 'À quelle fréquence les quiz sont-ils disponibles ?',
    a: 'Un quiz hebdomadaire est automatiquement disponible chaque semaine. Des sessions spéciales peuvent aussi être créées par votre administrateur avec un code d\'accès.',
  },
  {
    q: 'Comment sont calculés les badges ?',
    a: 'Les badges sont attribués selon vos performances : nombre de quiz complétés, scores parfaits, classement au sein de votre service. De nouveaux badges seront ajoutés régulièrement.',
  },
  {
    q: 'Puis-je modifier mon niveau IA déclaré ?',
    a: 'Oui, dans Réglages → Paramètres du profil vous pouvez mettre à jour votre niveau déclaré à tout moment. Cela n\'affecte pas votre niveau courant calculé.',
  },
  {
    q: 'Mes données sont-elles partagées en dehors de l\'organisation ?',
    a: 'Non. Vos données restent au sein de votre organisation. Consultez la Charte IA et la Politique de confidentialité pour plus de détails.',
  },
]

function FAQPage({ onBack }: { onBack: () => void }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="settings">
      <SubHeader title="FAQ" onBack={onBack} />
      <div className="settings__body">
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} className="settings-faq-item">
            <button className="settings-faq-q" onClick={() => setOpen(open === i ? null : i)}>
              <span>{item.q}</span>
              <svg
                viewBox="0 0 24 24" fill="currentColor" width="16" height="16"
                style={{ transform: open === i ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}
              >
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
              </svg>
            </button>
            {open === i && <p className="settings-faq-a">{item.a}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Sub-page: Contact ─────────────────────────────────────────────────────────

function ContactPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="settings">
      <SubHeader title="Contact" onBack={onBack} />
      <div className="settings__body">
        <p className="settings__hint" style={{ marginBottom: 16 }}>
          Une question, un problème ou une suggestion ? Contactez-nous et nous vous répondrons dans les 48 h.
        </p>
        <a href="mailto:support@prisme-ia.fr" className="settings-row settings-row--link">
          <span>support@prisme-ia.fr</span>
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
        </a>
        <p className="settings__section-label" style={{ marginTop: 16 }}>Temps de réponse moyen</p>
        <div className="settings-row" style={{ cursor: 'default' }}>
          <span>Jours ouvrés</span>
          <span style={{ color: '#9ca3af', fontSize: 13 }}>24 – 48 h</span>
        </div>
      </div>
    </div>
  )
}

// ── Sub-page: CGU ─────────────────────────────────────────────────────────────

function CGUPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="settings">
      <SubHeader title="CGU" onBack={onBack} />
      <div className="settings__body">
        <div className="settings-legal">
          <h2>Conditions Générales d'Utilisation</h2>
          <p><strong>Dernière mise à jour :</strong> juin 2026</p>

          <h3>1. Objet</h3>
          <p>Les présentes CGU définissent les modalités d'utilisation de l'application <em>prisme</em>, outil de sensibilisation à l'intelligence artificielle destiné aux collaborateurs de l'organisation.</p>

          <h3>2. Accès</h3>
          <p>L'accès est réservé aux collaborateurs disposant d'un compte validé par l'administrateur. Les identifiants sont personnels et confidentiels.</p>

          <h3>3. Utilisation</h3>
          <p>L'application est fournie à des fins de formation interne. Toute tentative de manipulation des scores ou de contournement des mécanismes de progression est interdite.</p>

          <h3>4. Données personnelles</h3>
          <p>Les données collectées (prénom, nom, service, résultats de quiz) sont utilisées exclusivement dans le cadre de la formation interne et ne sont pas transmises à des tiers. Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression.</p>

          <h3>5. Responsabilité</h3>
          <p>L'organisation ne saurait être tenue responsable d'une interruption de service ou d'une perte de données liée à des cas de force majeure ou à des défaillances techniques.</p>

          <h3>6. Modification</h3>
          <p>Les présentes CGU peuvent être modifiées à tout moment. Les utilisateurs seront informés de toute modification substantielle.</p>
        </div>
      </div>
    </div>
  )
}

// ── Main Settings ─────────────────────────────────────────────────────────────

function Settings({ onBack, onShowPrivacy, onNavigate }: Props) {
  const { signOut } = useAuth()

  const [subPage, setSubPage] = useState<SubPage>(null)

  const [music,  setMusic]  = useState(() => localStorage.getItem('pref_music')  !== 'false')
  const [sounds, setSounds] = useState(() => localStorage.getItem('pref_sounds') === 'true')
  const [volume, setVolume] = useState(() => Number(localStorage.getItem('pref_volume') ?? 50))

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting,      setDeleting]      = useState(false)
  const [deleteError,   setDeleteError]   = useState<string | null>(null)

  const handleMusic  = (v: boolean) => { setMusic(v);  localStorage.setItem('pref_music',  String(v)) }
  const handleSounds = (v: boolean) => { setSounds(v); localStorage.setItem('pref_sounds', String(v)) }
  const handleVolume = (v: number)  => { setVolume(v); localStorage.setItem('pref_volume', String(v)) }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    setDeleteError(null)
    const { error } = await supabase.rpc('delete_user_account')
    if (error) { setDeleteError(error.message); setDeleting(false) }
    else await signOut()
  }

  if (subPage === 'charte-ia')        return <CharteIAPage         onBack={() => setSubPage(null)} />
  if (subPage === 'profile-settings') return <ProfileSettingsPage onBack={() => setSubPage(null)} />
  if (subPage === 'privacy')          return <PrivacySettingsPage onBack={() => setSubPage(null)} />
  if (subPage === 'language')         return <LanguagePage        onBack={() => setSubPage(null)} />
  if (subPage === 'faq')              return <FAQPage             onBack={() => setSubPage(null)} />
  if (subPage === 'contact')          return <ContactPage         onBack={() => setSubPage(null)} />
  if (subPage === 'cgu')              return <CGUPage             onBack={() => setSubPage(null)} />

  return (
    <div className="settings">

      <div className="settings__header">
        <button className="settings__back" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z" />
          </svg>
          Retour
        </button>
        <Logo variant="text" />
        <div style={{ width: 70 }} />
      </div>

      <h1 className="settings__title">Réglages</h1>

      <div className="settings__body">

        <button
          className="settings-row settings-row--icon"
          onClick={() => window.open(`${import.meta.env.BASE_URL}Charte_IA_Kit.pdf`, '_blank', 'noopener')}
        >
          <span>Charte IA</span>
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z"/>
          </svg>
        </button>

        <p className="settings__section-label">Profil</p>
        <Row label="Paramètres du profil"          onClick={() => setSubPage('profile-settings')} />
        <Row label="Paramètres de confidentialité" onClick={() => setSubPage('privacy')} />
        <Row label="Déconnexion" soft onClick={signOut} />

        {!confirmDelete ? (
          <Row label="Supprimer le compte" danger onClick={() => setConfirmDelete(true)} />
        ) : (
          <div className="settings__confirm-delete">
            <p>Confirmer la suppression ? Cette action est irréversible.</p>
            {deleteError && <p className="settings__delete-error">{deleteError}</p>}
            <div className="settings__confirm-actions">
              <button className="settings__confirm-cancel" onClick={() => setConfirmDelete(false)}>Annuler</button>
              <button className="settings__confirm-ok" onClick={handleDeleteAccount} disabled={deleting}>
                {deleting ? 'Suppression...' : 'Confirmer'}
              </button>
            </div>
          </div>
        )}

        <p className="settings__section-label">Général</p>
        <Row label="Langue" onClick={() => setSubPage('language')} />

        <p className="settings__section-label">Musique et effets sonores</p>
        <div className="settings-row settings-row--toggle">
          <span>Musique</span>
          <Toggle on={music} onChange={handleMusic} />
        </div>
        <div className="settings-row settings-row--toggle">
          <span>Effets Sonores</span>
          <Toggle on={sounds} onChange={handleSounds} />
        </div>
        <div className="settings-row settings-row--slider">
          <span>Volume</span>
          <input
            type="range" min={0} max={100} value={volume}
            onChange={e => handleVolume(Number(e.target.value))}
            className="settings-slider"
          />
        </div>

        <p className="settings__section-label">Aide</p>
        <Row label="Foire aux questions" onClick={() => setSubPage('faq')} />
        <Row label="Contact"             onClick={() => setSubPage('contact')} />

        <p className="settings__section-label">Mentions légales</p>
        <Row label="Conditions générales d'utilisation" onClick={() => setSubPage('cgu')} />
        <Row label="Politique de confidentialité"       onClick={onShowPrivacy} />

        <p className="settings__version">Version 1.02.01</p>

      </div>

      {onNavigate && (
        <BottomNav onNavigate={onNavigate} onSettings={onBack} settingsActive />
      )}
    </div>
  )
}

export default Settings
