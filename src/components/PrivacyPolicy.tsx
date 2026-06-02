import './PrivacyPolicy.css'

type PrivacyPolicyProps = {
  /** Appelé au clic sur « Retour » */
  onBack: () => void
}

// Date de dernière mise à jour de la politique.
const LAST_UPDATED = '1er juin 2026'

function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  return (
    <div className="privacy">
      <div className="privacy__card">
        <header className="privacy__header">
          <button type="button" className="privacy__back" onClick={onBack}>
            ← Retour
          </button>
          <h1 className="privacy__title">Politique de confidentialité</h1>
          <p className="privacy__updated">Dernière mise à jour : {LAST_UPDATED}</p>
        </header>

        <div className="privacy__content">
          <p>
            La présente politique décrit comment l'application de sensibilisation à
            l'intelligence artificielle Prisme collecte et traite
            vos données personnelles, conformément au Règlement Général sur la
            Protection des Données (RGPD).
          </p>

          <h2>1. Responsable du traitement</h2>
          <p>
            Le responsable du traitement est l'équipe du projet Prisme au sein d'YNOV. 
            Pour toute question, contactez le délégué à la protection des
            données à l'adresse <strong>chloe.leonard@ynov.com</strong>.
          </p>

          <h2>2. Données collectées</h2>
          <p>Dans le cadre de votre utilisation de l'Application, nous collectons :</p>
          <ul>
            <li>vos nom, prénom et adresse e-mail professionnelle (via la connexion SSO) ;</li>
            <li>votre service / département et, le cas échéant, votre intitulé de poste ;</li>
            <li>votre niveau déclaré et votre niveau de compétence évalué ;</li>
            <li>vos réponses aux quiz, vos scores et votre progression ;</li>
            <li>des données techniques de fonctionnement (préférences stockées localement).</li>
          </ul>

          <h2>3. Finalités du traitement</h2>
          <p>Vos données sont utilisées pour :</p>
          <ul>
            <li>vous donner accès aux quiz de sensibilisation à l'IA ;</li>
            <li>adapter le niveau des questions à vos résultats ;</li>
            <li>suivre votre progression et établir des classements (global et par service) ;</li>
            <li>améliorer le contenu pédagogique de l'Application.</li>
          </ul>

          <h2>4. Base légale</h2>
          <p>
            Le traitement repose sur l'intérêt légitime de l'employeur à former et
            sensibiliser ses collaborateurs aux usages de l'intelligence artificielle,
            ainsi que, le cas échéant, sur votre consentement.
          </p>

          <h2>5. Destinataires des données</h2>
          <p>
            Vos données sont accessibles aux personnes habilitées au sein de
            l'entreprise. Elles sont hébergées par notre prestataire technique
            <strong> Supabase</strong>, agissant en qualité de
            sous-traitant. Aucune donnée n'est revendue à des tiers.
          </p>

          <h2>6. Intelligence artificielle</h2>
          <p>
            Aucune donnée personnelle confidentielle ne doit être saisie dans les
            outils d'IA via l'Application. Les contenus pédagogiques peuvent être
            produits avec l'aide d'outils d'IA, sous supervision humaine, dans le
            respect du règlement européen sur l'IA (AI Act).
          </p>

          <h2>7. Durée de conservation</h2>
          <p>
            Vos données sont conservées pendant la durée de votre utilisation de
            l'Application, puis archivées ou supprimées conformément à notre politique
            de conservation (au maximum <strong>12 mois</strong> après votre dernière
            activité).
          </p>

          <h2>8. Vos droits</h2>
          <p>
            Conformément au RGPD, vous disposez d'un droit d'accès, de rectification,
            d'effacement, de limitation et d'opposition au traitement de vos données,
            ainsi que d'un droit à la portabilité. Vous pouvez exercer ces droits en
            contactant <strong>chloe.leonard@ynov.com</strong>. Vous avez également le droit
            d'introduire une réclamation auprès de la CNIL.
          </p>

          <h2>9. Stockage local</h2>
          <p>
            L'Application enregistre certaines préférences dans le stockage local de
            votre navigateur (par exemple le fait d'avoir vu l'écran d'accueil). Ces
            informations restent sur votre appareil et peuvent être effacées en vidant
            les données de votre navigateur.
          </p>

          <h2>10. Modifications</h2>
          <p>
            La présente politique peut être mise à jour. Toute modification sera
            signalée via l'Application et la date de mise à jour ci-dessus sera révisée.
          </p>

        </div>

        <footer className="privacy__footer">
          <button type="button" className="privacy__cta" onClick={onBack}>
            J'ai compris
          </button>
        </footer>
      </div>
    </div>
  )
}

export default PrivacyPolicy
