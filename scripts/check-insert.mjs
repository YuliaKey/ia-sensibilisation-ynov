// Diagnostic jetable : tente d'insérer une session + participation, affiche l'erreur.
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.includes('='))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    }),
)

const root = env.VITE_SUPABASE_URL.replace(/\/+$/, '').replace(/\/rest\/v1$/, '')
const key = env.VITE_SUPABASE_ANON_KEY
const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
}

// 1. Récupère un user existant
const ures = await fetch(`${root}/rest/v1/users?select=id&limit=1`, { headers })
const users = await ures.json()
console.log('users:', ures.status, JSON.stringify(users))
const userId = users?.[0]?.id
if (!userId) {
  console.log('Pas de user, stop.')
  process.exit(0)
}

// 2. Insert quiz_sessions
const now = new Date().toISOString()
const qsRes = await fetch(`${root}/rest/v1/quiz_sessions`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    title: '__diag__',
    created_by: userId,
    difficulty_level: 'beginner',
    type: 'custom',
    status: 'closed',
    scheduled_at: null,
    closed_at: now,
  }),
})
const qsText = await qsRes.text()
console.log('INSERT quiz_sessions:', qsRes.status, qsText.slice(0, 400))

let sessionId
try {
  sessionId = JSON.parse(qsText)[0]?.id
} catch {
  /* ignore */
}
if (!sessionId) process.exit(0)

// 3. Insert user_quiz_sessions
const uqsRes = await fetch(`${root}/rest/v1/user_quiz_sessions`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    user_id: userId,
    quiz_session_id: sessionId,
    score: 30,
    success_rate: 0.75,
    level_snapshot: 'beginner',
    status: 'completed',
    completed_at: now,
  }),
})
console.log('INSERT user_quiz_sessions:', uqsRes.status, (await uqsRes.text()).slice(0, 400))

// 4. Nettoyage
await fetch(`${root}/rest/v1/quiz_sessions?id=eq.${sessionId}`, { method: 'DELETE', headers })
console.log('cleanup done')
