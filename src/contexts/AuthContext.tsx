import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Database, SkillLevel } from '../types/database'

type UserProfile = Database['public']['Tables']['users']['Row']

type ProfileData = {
  first_name: string
  last_name: string
  service_id: string | null
  job_title: string
  declared_level: SkillLevel
}

type AuthContextType = {
  session: Session | null
  profile: UserProfile | null
  /** Nom du service de l'utilisateur, récupéré par jointure (null si pas de service) */
  serviceName: string | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  createProfile: (data: ProfileData) => Promise<{ error: string | null }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session,     setSession]     = useState<Session | null>(null)
  const [profile,     setProfile]     = useState<UserProfile | null>(null)
  const [serviceName, setServiceName] = useState<string | null>(null)
  const [loading,     setLoading]     = useState(true)

  const fetchProfile = async (userId: string) => {
    // 1. Récupérer le profil utilisateur
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    setProfile(userData ?? null)

    // 2. Récupérer le nom du service via une requête séparée (plus robuste que la jointure)
    if (userData?.service_id) {
      const { data: serviceData } = await supabase
        .from('services')
        .select('name')
        .eq('id', userData.service_id)
        .single()
      setServiceName(serviceData?.name ?? null)
    } else {
      setServiceName(null)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user.id).finally(() => setLoading(false))
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else { setProfile(null); setServiceName(null) }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error: error?.message ?? null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const refreshProfile = async () => {
    const { data: { session: current } } = await supabase.auth.getSession()
    if (current) await fetchProfile(current.user.id)
  }

  const createProfile = async (data: ProfileData) => {
    if (!session) return { error: 'Non authentifié' }

    const { error } = await supabase.from('users').insert({
      id: session.user.id,
      ...data,
      service_id:    data.service_id ?? null,
      current_level: data.declared_level,
    })

    if (!error) await fetchProfile(session.user.id)
    return { error: error?.message ?? null }
  }

  return (
    <AuthContext.Provider value={{
      session, profile, serviceName, loading,
      signIn, signUp, signOut, createProfile, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider')
  return ctx
}
