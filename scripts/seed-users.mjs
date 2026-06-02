// Script de seed — crée les utilisateurs de test via l'API Admin Supabase
// Usage : node scripts/seed-users.mjs
// Nécessite SUPABASE_SERVICE_ROLE_KEY dans .env.local

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Lire .env.local manuellement — split sur le premier = seulement
const parseEnv = (file) => Object.fromEntries(
  readFileSync(file, 'utf8')
    .split('\n')
    .filter(l => l.trim() && !l.startsWith('#'))
    .map(l => {
      const idx = l.indexOf('=')
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()]
    })
)

const env = parseEnv('.env')

const supabase = createClient(
  env.VITE_SUPABASE_URL,
  env.SUPABASE_SECRET_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const SERVICES = {
  rh:          '10000000-0000-0000-0000-000000000001',
  finance:     '10000000-0000-0000-0000-000000000002',
  marketing:   '10000000-0000-0000-0000-000000000003',
  it:          '10000000-0000-0000-0000-000000000004',
  direction:   '10000000-0000-0000-0000-000000000005',
}

const USERS = [
  { email: 'alice.martin@test.fr',    password: 'Test1234!', profile: { first_name: 'Alice',    last_name: 'Martin',  role: 'user',    service_id: SERVICES.rh,        job_title: 'Chargée RH',             declared_level: 'beginner', current_level: 'beginner' } },
  { email: 'bob.dupont@test.fr',      password: 'Test1234!', profile: { first_name: 'Bob',      last_name: 'Dupont',  role: 'user',    service_id: SERVICES.finance,    job_title: 'Contrôleur de gestion',  declared_level: 'beginner', current_level: 'beginner' } },
  { email: 'claire.lebrun@test.fr',   password: 'Test1234!', profile: { first_name: 'Claire',   last_name: 'Lebrun',  role: 'user',    service_id: SERVICES.marketing,  job_title: 'Chef de projet digital', declared_level: 'curious',  current_level: 'curious'  } },
  { email: 'david.moreau@test.fr',    password: 'Test1234!', profile: { first_name: 'David',    last_name: 'Moreau',  role: 'user',    service_id: SERVICES.it,         job_title: 'Développeur backend',    declared_level: 'curious',  current_level: 'curious'  } },
  { email: 'emma.petit@test.fr',      password: 'Test1234!', profile: { first_name: 'Emma',     last_name: 'Petit',   role: 'manager', service_id: SERVICES.direction,  job_title: 'Directrice générale',    declared_level: 'expert',   current_level: 'expert'   } },
  { email: 'francois.simon@test.fr',  password: 'Test1234!', profile: { first_name: 'François', last_name: 'Simon',   role: 'user',    service_id: SERVICES.rh,         job_title: 'Responsable formation',  declared_level: 'curious',  current_level: 'curious'  } },
  { email: 'grace.thomas@test.fr',    password: 'Test1234!', profile: { first_name: 'Grace',    last_name: 'Thomas',  role: 'manager', service_id: SERVICES.finance,    job_title: 'DAF',                    declared_level: 'expert',   current_level: 'expert'   } },
  { email: 'hugo.martin@test.fr',     password: 'Test1234!', profile: { first_name: 'Hugo',     last_name: 'Martin',  role: 'user',    service_id: SERVICES.marketing,  job_title: 'Responsable digital',    declared_level: 'expert',   current_level: 'expert'   } },
]

async function main() {
  console.log('Création des utilisateurs de test...\n')

  for (const user of USERS) {
    // 1. Créer dans auth.users via l'API Admin (crée les champs GoTrue correctement)
    const { data, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true, // pas besoin de confirmation email
    })

    if (authError) {
      console.error(`❌ ${user.email} — auth: ${authError.message}`)
      continue
    }

    // 2. Créer le profil dans la table users
    const { error: profileError } = await supabase.from('users').insert({
      id: data.user.id,
      ...user.profile,
    })

    if (profileError) {
      console.error(`❌ ${user.email} — profil: ${profileError.message}`)
    } else {
      console.log(`✅ ${user.email} (${user.profile.declared_level})`)
    }
  }

  console.log('\nTerminé.')
}

main()
