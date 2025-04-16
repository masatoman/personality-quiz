import { cookies } from 'next/headers';
import { getSupabase } from '@/lib/supabase/server';

export async function getSession() {
  const cookieStore = cookies();
  const supabase = getSupabase();
  
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error fetching session:', error.message);
    return null;
  }
  
  return session;
} 