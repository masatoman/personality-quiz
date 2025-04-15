/**
 * Supabaseデータベース型定義
 */
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          personality_type: 'giver' | 'matcher' | 'taker' | null;
          giver_score: number;
          points: number;
        };
        Insert: {
          id: string;
          email: string;
          created_at?: string;
          personality_type?: 'giver' | 'matcher' | 'taker' | null;
          giver_score?: number;
          points?: number;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          personality_type?: 'giver' | 'matcher' | 'taker' | null;
          giver_score?: number;
          points?: number;
        };
      };
      profiles: {
        Row: {
          user_id: string;
          display_name: string;
          avatar_url: string | null;
          bio: string | null;
        };
        Insert: {
          user_id: string;
          display_name: string;
          avatar_url?: string | null;
          bio?: string | null;
        };
        Update: {
          user_id?: string;
          display_name?: string;
          avatar_url?: string | null;
          bio?: string | null;
        };
      };
      contents: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          category: string;
          tags: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          category: string;
          tags?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          category?: string;
          tags?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      feedback: {
        Row: {
          id: string;
          content_id: string;
          user_id: string;
          comment: string | null;
          rating: number | null;
          is_helpful: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          content_id: string;
          user_id: string;
          comment?: string | null;
          rating?: number | null;
          is_helpful?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          content_id?: string;
          user_id?: string;
          comment?: string | null;
          rating?: number | null;
          is_helpful?: boolean;
          created_at?: string;
        };
      };
      activities: {
        Row: {
          id: string;
          user_id: string;
          activity_type: string;
          reference_id: string | null;
          points: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          activity_type: string;
          reference_id?: string | null;
          points: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          activity_type?: string;
          reference_id?: string | null;
          points?: number;
          created_at?: string;
        };
      };
    };
    Views: Record<string, unknown>;
    Functions: Record<string, unknown>;
  };
}; 