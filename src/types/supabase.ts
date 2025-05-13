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
      profiles: {
        Row: {
          id: string
          created_at: string
          user_id: string
          display_name: string
          avatar_url: string | null
          bio: string | null
          settings: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          display_name: string
          avatar_url?: string | null
          bio?: string | null
          settings?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          display_name?: string
          avatar_url?: string | null
          bio?: string | null
          settings?: Json | null
        }
      }
      users: {
        Row: {
          id: string
          email: string
          personality_type: string | null
          giver_score: number
          points: number
        }
        Insert: {
          id: string
          email: string
          personality_type?: string | null
          giver_score?: number
          points?: number
        }
        Update: {
          id?: string
          email?: string
          personality_type?: string | null
          giver_score?: number
          points?: number
        }
      }
      activities: {
        Row: {
          id: string
          created_at: string
          user_id: string
          activity_type: string
          reference_id: string | null
          points: number
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          activity_type: string
          reference_id?: string | null
          points: number
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          activity_type?: string
          reference_id?: string | null
          points?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_user_points: {
        Args: {
          user_id: string
          points_to_add: number
        }
        Returns: void
      }
      increment_giver_score: {
        Args: {
          user_id: string
          score_to_add: number
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
} 