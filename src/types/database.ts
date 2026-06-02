// Types générés manuellement — remplacer par `npx supabase gen types typescript` une fois le projet créé

export type SkillLevel    = 'beginner' | 'curious' | 'expert'
export type UserRole      = 'user' | 'manager'
export type SessionType   = 'weekly' | 'custom'
export type SessionStatus = 'pending' | 'active' | 'closed'
export type AttemptStatus = 'in_progress' | 'completed' | 'abandoned'
export type QuestionType  = 'single_choice' | 'multiple_choice' | 'true_false'
export type QuestionTheme = 'capacites' | 'limites' | 'dangers' | 'ethique_societe'

export interface Database {
  public: {
    Tables: {
      services: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['services']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['services']['Insert']>
      }
      users: {
        Row: {
          id: string
          first_name: string
          last_name: string
          role: UserRole
          service_id: string | null
          job_title: string | null
          declared_level: SkillLevel
          current_level: SkillLevel
          total_score: number
          last_reminder_sent_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'total_score' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      quiz_sessions: {
        Row: {
          id: string
          title: string
          created_by: string | null
          difficulty_level: SkillLevel
          type: SessionType
          status: SessionStatus
          scheduled_at: string | null
          closed_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['quiz_sessions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['quiz_sessions']['Insert']>
      }
      questions: {
        Row: {
          id: string
          content: string
          type: QuestionType
          difficulty_level: SkillLevel
          theme: QuestionTheme
          explanation: string | null
          base_points: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['questions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['questions']['Insert']>
      }
      answer_options: {
        Row: {
          id: string
          question_id: string
          content: string
          is_correct: boolean
          order_index: number
        }
        Insert: Omit<Database['public']['Tables']['answer_options']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['answer_options']['Insert']>
      }
      session_questions: {
        Row: {
          id: string
          quiz_session_id: string
          question_id: string
          position: number
        }
        Insert: Omit<Database['public']['Tables']['session_questions']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['session_questions']['Insert']>
      }
      user_quiz_sessions: {
        Row: {
          id: string
          user_id: string
          quiz_session_id: string
          score: number
          success_rate: number | null
          level_snapshot: SkillLevel
          status: AttemptStatus
          started_at: string
          completed_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['user_quiz_sessions']['Row'], 'id' | 'score' | 'started_at'>
        Update: Partial<Database['public']['Tables']['user_quiz_sessions']['Insert']>
      }
      user_answers: {
        Row: {
          id: string
          user_quiz_session_id: string
          question_id: string
          answer_option_id: string | null
          is_correct: boolean
          points_earned: number
          answered_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_answers']['Row'], 'id' | 'answered_at'>
        Update: Partial<Database['public']['Tables']['user_answers']['Insert']>
      }
    }
    Views: {
      daily_ranking: {
        Row: {
          id: string
          first_name: string
          last_name: string
          service_id: string
          service_name: string
          daily_score: number
          global_rank: number
          service_rank: number
        }
      }
      service_stats: {
        Row: {
          service_id: string
          service_name: string
          total_users: number
          sessions_completed: number
          avg_success_rate: number | null
          count_beginner: number
          count_curious: number
          count_expert: number
        }
      }
    }
  }
}
