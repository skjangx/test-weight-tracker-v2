export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          preferences: {
            theme: 'light' | 'dark'
            moving_avg_days: number
          }
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          preferences?: {
            theme: 'light' | 'dark'
            moving_avg_days: number
          }
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          preferences?: {
            theme: 'light' | 'dark'
            moving_avg_days: number
          }
          created_at?: string
          updated_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          target_weight: number
          deadline: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          target_weight: number
          deadline: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          target_weight?: number
          deadline?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      weight_entries: {
        Row: {
          id: string
          user_id: string
          date: string
          weight: number
          memo: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          weight: number
          memo?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          weight?: number
          memo?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      streaks: {
        Row: {
          id: string
          user_id: string
          start_date: string
          end_date: string | null
          current_count: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          start_date: string
          end_date?: string | null
          current_count?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          start_date?: string
          end_date?: string | null
          current_count?: number
          is_active?: boolean
          created_at?: string
        }
      }
      milestones: {
        Row: {
          id: string
          user_id: string
          weight_lost: number
          achieved_at: string
        }
        Insert: {
          id?: string
          user_id: string
          weight_lost: number
          achieved_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          weight_lost?: number
          achieved_at?: string
        }
      }
    }
  }
}

export type Goal = Database['public']['Tables']['goals']['Row']
export type WeightEntry = Database['public']['Tables']['weight_entries']['Row']
export type Streak = Database['public']['Tables']['streaks']['Row']
export type Milestone = Database['public']['Tables']['milestones']['Row']
export type UserProfile = Database['public']['Tables']['users']['Row']