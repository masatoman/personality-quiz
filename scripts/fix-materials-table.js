#!/usr/bin/env node

/**
 * materialsテーブル修正スクリプト
 * テーブル存在確認・作成・RLSポリシー設定
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // service_roleキーを使用

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  process.exit(1);
}

async function fixMaterialsTable() {
  console.log('🔧 materialsテーブル修正開始...');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. テーブル存在確認
    console.log('1️⃣ テーブル存在確認...');
    const { data: tables, error: tableError } = await supabase
      .rpc('exec_sql', { 
        sql: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'materials'" 
      });

    if (tableError) {
      console.error('❌ テーブル確認エラー:', tableError.message);
      return false;
    }

    const tableExists = tables && tables.length > 0;
    console.log(`📊 テーブル存在: ${tableExists ? '✅ 存在' : '❌ 不存在'}`);

    // 2. テーブルが存在しない場合は作成
    if (!tableExists) {
      console.log('2️⃣ テーブル作成...');
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS public.materials (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          content JSONB,
          author_id UUID REFERENCES auth.users(id),
          is_published BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      const { error: createError } = await supabase
        .rpc('exec_sql', { sql: createTableSQL });

      if (createError) {
        console.error('❌ テーブル作成エラー:', createError.message);
        return false;
      }
      console.log('✅ テーブル作成完了');
    }

    // 3. RLS有効化
    console.log('3️⃣ RLS有効化...');
    const { error: rlsError } = await supabase
      .rpc('exec_sql', { 
        sql: 'ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;' 
      });

    if (rlsError) {
      console.error('❌ RLS有効化エラー:', rlsError.message);
    } else {
      console.log('✅ RLS有効化完了');
    }

    // 4. RLSポリシー設定
    console.log('4️⃣ RLSポリシー設定...');
    const policies = [
      // 既存ポリシー削除
      "DROP POLICY IF EXISTS \"公開教材は誰でも参照可能\" ON public.materials;",
      "DROP POLICY IF EXISTS \"教材は作成者のみ更新可能\" ON public.materials;",
      "DROP POLICY IF EXISTS \"教材は認証済みユーザーが作成可能\" ON public.materials;",
      
      // 新しいポリシー作成
      `CREATE POLICY "公開教材は誰でも参照可能" ON public.materials
         FOR SELECT USING (is_published = true OR auth.uid() = author_id);`,
      
      `CREATE POLICY "教材は作成者のみ更新可能" ON public.materials
         FOR UPDATE USING (auth.uid() = author_id);`,
      
      `CREATE POLICY "教材は認証済みユーザーが作成可能" ON public.materials
         FOR INSERT WITH CHECK (auth.uid() = author_id);`
    ];

    for (const policy of policies) {
      const { error: policyError } = await supabase
        .rpc('exec_sql', { sql: policy });
      
      if (policyError) {
        console.error('❌ ポリシー設定エラー:', policyError.message);
      }
    }
    console.log('✅ RLSポリシー設定完了');

    // 5. サンプルデータ投入
    console.log('5️⃣ サンプルデータ投入...');
    const sampleData = [
      {
        title: 'JavaScript基礎',
        description: 'JavaScriptの基本を学ぶ',
        content: { type: 'tutorial', level: 'beginner' },
        is_published: true
      },
      {
        title: 'React入門',
        description: 'Reactフレームワークの基礎',
        content: { type: 'tutorial', level: 'intermediate' },
        is_published: true
      }
    ];

    const { data: insertData, error: insertError } = await supabase
      .from('materials')
      .insert(sampleData)
      .select();

    if (insertError) {
      console.error('❌ サンプルデータ投入エラー:', insertError.message);
    } else {
      console.log(`✅ サンプルデータ投入完了 (${insertData?.length || 0}件)`);
    }

    // 6. 動作確認
    console.log('6️⃣ 動作確認...');
    const { data: testData, error: testError } = await supabase
      .from('materials')
      .select('*')
      .eq('is_published', true)
      .limit(5);

    if (testError) {
      console.error('❌ 動作確認エラー:', testError.message);
      return false;
    }

    console.log(`✅ 動作確認成功 (${testData?.length || 0}件の教材を取得)`);
    console.log('🎉 materialsテーブル修正完了！');

    return true;

  } catch (error) {
    console.error('❌ 予期しないエラー:', error.message);
    return false;
  }
}

// メイン実行
if (require.main === module) {
  fixMaterialsTable()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ 予期しないエラー:', error);
      process.exit(1);
    });
}

module.exports = { fixMaterialsTable };
