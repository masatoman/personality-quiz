import { SupabaseClient } from '@supabase/supabase-js';

// Supabaseモック用拡張型定義
declare module '@/lib/supabase' {
  const supabase: SupabaseClient & {
    from: jest.Mock;
    select: jest.Mock;
    eq: jest.Mock;
    order: jest.Mock;
    insert: jest.Mock;
    single: jest.Mock;
    limit: jest.Mock;
  };
  
  export default supabase;
} 