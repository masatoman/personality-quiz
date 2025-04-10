export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      personality_results: {
        Row: {
          id: string
          created_at: string
          type: 'giver' | 'taker' | 'matcher'
          user_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          type: 'giver' | 'taker' | 'matcher'
          user_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          type?: 'giver' | 'taker' | 'matcher'
          user_id?: string | null
        }
      }
      user_profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 