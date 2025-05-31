const { createClient } = require('@supabase/supabase-js');

// 環境変数の読み込み
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase設定が不完全です。環境変数を確認してください。');
  process.exit(1);
}

console.log('Supabase接続中...');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndCreateTables() {
  try {
    // まずテーブルの存在確認
    console.log('既存のテーブルを確認中...');
    
    // user_activitiesテーブルの確認
    const { data: userActivities, error: userActivitiesError } = await supabase
      .from('user_activities')
      .select('id')
      .limit(1);
    
    if (userActivitiesError && userActivitiesError.code === '42P01') {
      console.log('user_activitiesテーブルが存在しません。');
    } else {
      console.log('user_activitiesテーブル: 存在');
    }
    
    // materialsテーブルの確認
    const { data: materials, error: materialsError } = await supabase
      .from('materials')
      .select('id, author_id')
      .limit(1);
    
    if (materialsError) {
      if (materialsError.code === '42P01') {
        console.log('materialsテーブルが存在しません。');
      } else if (materialsError.code === '42703') {
        console.log('materialsテーブルは存在するが、author_idカラムがありません。');
      }
    } else {
      console.log('materialsテーブル: 存在 (author_idカラム含む)');
    }
    
    // user_pointsテーブルの確認
    const { data: userPoints, error: userPointsError } = await supabase
      .from('user_points')
      .select('id')
      .limit(1);
    
    if (userPointsError && userPointsError.code === '42P01') {
      console.log('user_pointsテーブルが存在しません。');
    } else {
      console.log('user_pointsテーブル: 存在');
    }
    
    console.log('\n手動でSupabase Dashboard（https://app.supabase.com）のSQL Editorを使用してテーブルを作成してください。');
    console.log('\n実行すべきSQL:');
    console.log('================');
    
    console.log(`
-- user_activitiesテーブルの作成
CREATE TABLE IF NOT EXISTS public.user_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    activity_data JSONB,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- materialsテーブルの作成または更新
CREATE TABLE IF NOT EXISTS public.materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    category VARCHAR(100),
    difficulty VARCHAR(50),
    estimated_time INTEGER,
    author_id UUID,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- user_pointsテーブルの作成
CREATE TABLE IF NOT EXISTS public.user_points (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    points INTEGER DEFAULT 0 NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 簡単なテスト用データの挿入
INSERT INTO public.user_activities (user_id, activity_type, activity_data, points_earned) VALUES
('00000000-0000-0000-0000-000000000000', 'test', '{"test": true}', 10)
ON CONFLICT DO NOTHING;

INSERT INTO public.materials (title, description, content, category, author_id) VALUES
('テスト教材', 'テスト用の教材です', '# テスト\\n\\nこれはテスト教材です。', 'テスト', '00000000-0000-0000-0000-000000000000')
ON CONFLICT DO NOTHING;
`);
    
  } catch (error) {
    console.error('テーブル確認エラー:', error);
  }
}

checkAndCreateTables().catch(console.error); 