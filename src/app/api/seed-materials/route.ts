import { NextResponse } from 'next/server';
import supabase from '@/services/supabaseClient';

// サンプル教材データ
const materialsSeedData = [
  {
    title: 'ビジネス英語の基礎',
    description: 'ビジネスシーンで使える基本的な英語表現とコミュニケーション戦略を学びます',
    content: JSON.stringify({
      sections: [
        {
          title: 'ビジネス英語の基本',
          content: '<p>ビジネス英語は、職場や商談などの専門的な環境で使用される英語の一形態です。フォーマルな表現や業界特有の用語が多く使われます。</p>'
        },
        {
          title: '挨拶と自己紹介',
          content: '<p>"Good morning/afternoon/evening."</p><p>"It\'s a pleasure to meet you."</p><p>"Thank you for taking the time to meet with me today."</p>'
        },
        {
          title: '電話とメール',
          content: '<p>ビジネスコミュニケーションでは、電話やメールのスキルが非常に重要です。</p><p>"I\'m calling/writing regarding..."</p>'
        }
      ]
    }),
    category: 'ビジネス英語',
    tags: ['ビジネス英語', '自己紹介', 'メール', '電話対応'],
    difficulty_level: 1,
    is_published: true
  },
  {
    title: '日常英会話マスター',
    description: '日常生活で役立つ実践的な英会話表現とシチュエーション別のフレーズ集',
    content: JSON.stringify({
      sections: [
        {
          title: '日常英会話の基本',
          content: '<p>日常英会話は、カジュアルな状況で使われる自然な英語表現です。文法的に完璧である必要はなく、コミュニケーションの流れを重視します。</p>'
        },
        {
          title: 'カフェやレストランでの会話',
          content: '<p>"I\'d like a coffee, please."</p><p>"Could I have the menu, please?"</p><p>"What do you recommend?"</p>'
        },
        {
          title: '道案内と交通',
          content: '<p>"Excuse me, could you tell me how to get to the station?"</p><p>"Is this the right way to the museum?"</p>'
        }
      ]
    }),
    category: '日常会話',
    tags: ['日常会話', '旅行', 'レストラン', '道案内'],
    difficulty_level: 2,
    is_published: true
  },
  {
    title: '英語発音のコツとトレーニング',
    description: 'ネイティブのような発音を身につけるための実践的なトレーニング方法',
    content: JSON.stringify({
      sections: [
        {
          title: '英語発音の基礎',
          content: '<p>英語の発音は、リスニングとスピーキング能力の向上に直結する重要なスキルです。正しい口の形や舌の位置を意識することが大切です。</p>'
        },
        {
          title: '母音の発音',
          content: '<p>/i:/ - sheep, meet, leaf</p><p>/ɪ/ - ship, bit, fish</p><p>/e/ - bed, head, said</p>'
        },
        {
          title: 'リズムとイントネーション',
          content: '<p>英語は強弱のリズムを持つ言語です。強調される単語や音節に注意しましょう。</p>'
        }
      ]
    }),
    category: '発音・スピーキング',
    tags: ['発音', 'スピーキング', 'リスニング', '音声学'],
    difficulty_level: 3,
    is_published: true
  }
];

export async function GET() {
  try {
    console.log('教材データ登録開始');
    
    // データ登録前に既存のテストデータを確認
    console.log('既存データの確認中...');
    const { data: existingData, error: checkError } = await supabase
      .from('materials')
      .select('id, title')
      .eq('title', materialsSeedData[0].title);
      
    if (checkError) {
      console.error('データ確認エラー:', checkError);
      return NextResponse.json(
        { success: false, message: 'データ確認エラー', error: checkError },
        { status: 500 }
      );
    }
    
    // すでにデータが存在する場合は登録をスキップ
    if (existingData && existingData.length > 0) {
      console.log('既存データを検出:', existingData);
      return NextResponse.json(
        { 
          success: true, 
          message: 'テストデータはすでに存在します', 
          existingData
        },
        { status: 200 }
      );
    }
    
    // テスト用のユーザーIDを設定
    const test_user_id = '00000000-0000-0000-0000-000000000000';
    
    // 教材データの登録
    console.log('教材データの登録を開始...');
    const results = [];
    
    for (const material of materialsSeedData) {
      console.log(`「${material.title}」を登録中...`);
      const { data, error } = await supabase
        .from('materials')
        .insert({ ...material, user_id: test_user_id })
        .select();
        
      results.push({
        title: material.title,
        success: !error,
        data,
        error
      });
      
      if (error) {
        console.error(`「${material.title}」の登録エラー:`, error);
      } else {
        console.log(`「${material.title}」の登録成功`);
      }
    }
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'テストデータを登録しました',
        results
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('データ登録中にエラーが発生しました:', err);
    return NextResponse.json(
      { 
        success: false, 
        message: 'データ登録中にエラーが発生しました', 
        error: err instanceof Error ? err.message : String(err)
      },
      { status: 500 }
    );
  }
} 