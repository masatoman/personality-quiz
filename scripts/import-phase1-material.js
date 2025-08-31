#!/usr/bin/env node

/**
 * Phase1教材投入スクリプト
 * 本番環境のSupabaseに教材データを投入
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 環境変数から設定を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // service_roleキーを使用

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  console.error('NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定してください');
  process.exit(1);
}

async function importPhase1Material() {
  console.log('📚 Phase1教材投入開始...');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. 教材データの読み込み
    console.log('1️⃣ 教材データ読み込み...');
    const materialPath = path.join(__dirname, '../data/phase1-material-1-nouns-pronouns.json');
    
    if (!fs.existsSync(materialPath)) {
      console.error('❌ 教材データファイルが見つかりません:', materialPath);
      return false;
    }

    const materialData = JSON.parse(fs.readFileSync(materialPath, 'utf8'));
    console.log('✅ 教材データ読み込み完了:', materialData.title);

    // 2. 既存データの確認
    console.log('2️⃣ 既存データ確認...');
    const { data: existingMaterials, error: checkError } = await supabase
      .from('materials')
      .select('id, title')
      .eq('title', materialData.title);

    if (checkError) {
      console.error('❌ 既存データ確認エラー:', checkError.message);
      return false;
    }

    if (existingMaterials && existingMaterials.length > 0) {
      console.log('⚠️ 既に同じタイトルの教材が存在します:', existingMaterials[0].id);
      console.log('更新しますか？ (y/N)');
      // 実際の運用では対話的な確認が必要
      return false;
    }

    // 3. 教材データの投入
    console.log('3️⃣ 教材データ投入...');
    const { data: insertedMaterial, error: insertError } = await supabase
      .from('materials')
      .insert({
        title: materialData.title,
        description: materialData.description,
        content: materialData.content,
        difficulty: materialData.difficulty,
        estimated_time: materialData.estimated_time,
        tags: materialData.tags,
        category: materialData.category,
        is_published: materialData.is_published,
        created_at: materialData.created_at,
        updated_at: materialData.updated_at
      })
      .select();

    if (insertError) {
      console.error('❌ 教材投入エラー:', insertError.message);
      return false;
    }

    console.log('✅ 教材投入完了:', insertedMaterial[0].id);

    // 4. 投入データの確認
    console.log('4️⃣ 投入データ確認...');
    const { data: confirmData, error: confirmError } = await supabase
      .from('materials')
      .select('*')
      .eq('id', insertedMaterial[0].id)
      .single();

    if (confirmError) {
      console.error('❌ 投入データ確認エラー:', confirmError.message);
      return false;
    }

    console.log('✅ 投入データ確認完了');
    console.log('📊 教材情報:');
    console.log(`  - ID: ${confirmData.id}`);
    console.log(`  - タイトル: ${confirmData.title}`);
    console.log(`  - 難易度: ${confirmData.difficulty}`);
    console.log(`  - 推定時間: ${confirmData.estimated_time}分`);
    console.log(`  - 公開状態: ${confirmData.is_published ? '公開' : '非公開'}`);

    // 5. API動作確認
    console.log('5️⃣ API動作確認...');
    const { data: apiTest, error: apiError } = await supabase
      .from('materials')
      .select('id, title, description')
      .eq('is_published', true)
      .limit(5);

    if (apiError) {
      console.error('❌ API動作確認エラー:', apiError.message);
      return false;
    }

    console.log(`✅ API動作確認完了 (${apiTest.length}件の教材を取得)`);
    console.log('📋 取得された教材:');
    apiTest.forEach((material, index) => {
      console.log(`  ${index + 1}. ${material.title}`);
    });

    console.log('🎉 Phase1教材投入完了！');
    return true;

  } catch (error) {
    console.error('❌ 予期しないエラー:', error.message);
    return false;
  }
}

// メイン実行
if (require.main === module) {
  importPhase1Material()
    .then(success => {
      if (success) {
        console.log('🚀 本番環境での確認:');
        console.log('curl -s "https://shiftwith-sigma.vercel.app/api/materials" | jq .');
      }
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ 予期しないエラー:', error);
      process.exit(1);
    });
}

module.exports = { importPhase1Material };
