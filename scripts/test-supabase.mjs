import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:3004';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.ZopqoUt20nEV9cklpv9jtLgXMv3cJYAYfdv-q2I9t0c';

console.log('URL:', url);
const supabase = createClient(url, key, {
  auth: { persistSession: false },
});

try {
  const { data, error, count } = await supabase
    .from('materials')
    .select('*', { count: 'exact' })
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .range(0, 9);

  console.log('error:', error);
  console.log('count:', count);
  console.log('data length:', Array.isArray(data) ? data.length : null);
  if (Array.isArray(data) && data.length > 0) {
    console.log('first:', { id: data[0].id, title: data[0].title });
  }
} catch (e) {
  console.error('exception:', e);
}


