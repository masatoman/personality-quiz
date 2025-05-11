import { createClient } from '@supabase/supabase-js';

// 環境変数からSupabaseの設定を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example';

// URLの形式をチェック
const isValidUrl = (urlString: string): boolean => {
  try {
    new URL(urlString);
    return true;
  } catch (error) {
    console.error('Invalid Supabase URL:', urlString);
    return false;
  }
};

// 型定義のためのデータベース型
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
  };
};

// ブラウザとサーバーの両方で使用できるクライアントを作成
const validatedUrl = isValidUrl(supabaseUrl) ? supabaseUrl : 'https://example.supabase.co';
const supabase = createClient<Database>(validatedUrl, supabaseAnonKey);

export default supabase;

// サーバーサイド専用のクライアント作成関数
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  
  const validatedUrl = isValidUrl(supabaseUrl) ? supabaseUrl : 'https://example.supabase.co';
  return createClient<Database>(validatedUrl, supabaseServiceKey);
}; 