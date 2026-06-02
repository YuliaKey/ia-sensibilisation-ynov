import { supabase } from './supabase'
import type { SkillLevel } from '../types/database'

// Points attribués par bonne réponse (aligné sur questions.base_points par défaut).
export const BASE_POINTS = 10

// Ordre des niveaux pour la logique adaptative.
const LEVELS: SkillLevel[] = ['beginner', 'curious', 'expert']

// Calcule le niveau suivant selon le taux de réussite (≥0.8 monte, <0.5 descend).
function nextLevel(current: SkillLevel, successRate: number): SkillLevel {
  const i = LEVELS.indexOf(current)
  if (successRate >= 0.8) return LEVELS[Math.min(i + 1, LEVELS.length - 1)]
  if (successRate < 0.5) return LEVELS[Math.max(i - 1, 0)]
  return current
}

/** Récupère le niveau courant (current_level) d'un utilisateur. */
export async function getUserLevel(
  userId: string,
): Promise<{ level: SkillLevel | null; error: string | null }> {
  const { data, error } = await supabase
    .from('users')
    .select('current_level')
    .eq('id', userId)
    .single()

  if (error || !data) {
    return { level: null, error: error?.message ?? 'Utilisateur introuvable' }
  }
  return { level: data.current_level, error: null }
}

type SaveQuizResultParams = {
  userId: string
  level: SkillLevel
  correctCount: number
  totalCount: number
}

type SaveQuizResultReturn = {
  points: number
  error: string | null
}

/**
 * Enregistre le résultat d'une série : incrémente directement total_score de
 * l'utilisateur et ajuste son niveau. Approche simple (MVP sans auth) qui ne
 * touche qu'à la table users — pas de création de session.
 */
export async function saveQuizResult({
  userId,
  correctCount,
  totalCount,
}: SaveQuizResultParams): Promise<SaveQuizResultReturn> {
  const points = correctCount * BASE_POINTS
  const successRate = totalCount > 0 ? correctCount / totalCount : 0

  // 1. Lire l'état courant du user.
  const { data: user, error: readError } = await supabase
    .from('users')
    .select('total_score, current_level')
    .eq('id', userId)
    .single()

  if (readError || !user) {
    return { points, error: readError?.message ?? 'Utilisateur introuvable' }
  }

  // 2. Mettre à jour score cumulé + niveau adaptatif.
  const { error: updateError } = await supabase
    .from('users')
    .update({
      total_score: user.total_score + points,
      current_level: nextLevel(user.current_level, successRate),
    })
    .eq('id', userId)

  return { points, error: updateError?.message ?? null }
}
