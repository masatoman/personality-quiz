// Supabase接続テストスクリプト
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabaseクライアントの初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('環境変数が設定されていません。.env.localファイルを確認してください。');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('環境変数が正しく読み込まれています');

// 匿名キーでのクライアント（一般ユーザー向け）
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// サービスロールキーでのクライアント（管理者向け）
const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// 各テーブルのデータを確認する関数
async function testSupabaseConnection() {
  console.log('Supabaseへの接続テストを開始します...');

  try {
    // 管理者設定の取得
    const { data: adminSettings, error: adminError } = await supabase
      .from('admin_settings')
      .select('*')
      .limit(5);

    if (adminError) throw adminError;
    console.log('\n--- 管理者設定 ---');
    console.log(adminSettings);

    // ユーザープロファイルの取得
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);

    if (profilesError) throw profilesError;
    console.log('\n--- ユーザープロファイル ---');
    console.log(profiles);

    // 教材の取得
    const { data: materials, error: materialsError } = await supabase
      .from('materials')
      .select('*')
      .limit(5);

    if (materialsError) throw materialsError;
    console.log('\n--- 教材 ---');
    console.log(materials.map(m => ({
      id: m.id,
      title: m.title,
      category: m.category,
      is_published: m.is_published
    })));

    // バッジの取得
    const { data: badges, error: badgesError } = await supabase
      .from('badges')
      .select('*')
      .limit(5);

    if (badgesError) throw badgesError;
    console.log('\n--- バッジ ---');
    console.log(badges);

    // フィードバックの取得
    const { data: feedback, error: feedbackError } = await supabase
      .from('feedback')
      .select('*')
      .limit(5);

    if (feedbackError) throw feedbackError;
    console.log('\n--- フィードバック ---');
    console.log(feedback);

    // 診断質問の取得
    const { data: questions, error: questionsError } = await supabase
      .from('personality_questions')
      .select('*')
      .limit(5);

    if (questionsError) throw questionsError;
    console.log('\n--- 診断質問 ---');
    console.log(questions);

    // テーブル名を確認する（デバッグ用）
    console.log('\n--- すべてのテーブルを確認 ---');
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('pg_catalog.pg_tables')
      .select('tablename, schemaname')
      .eq('schemaname', 'public');
      
    if (tablesError) {
      console.log('テーブル一覧の取得に失敗しました（サービスロールキーが必要です）');
    } else {
      console.log(tables);
    }

    console.log('\nすべてのテストが正常に完了しました！Supabaseとの接続は正常です。');
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// テスト実行
testSupabaseConnection(); 