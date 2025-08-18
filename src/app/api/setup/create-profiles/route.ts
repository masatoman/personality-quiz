import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// 開発環境でのみプロフィールテーブルに直接テストユーザーを作成するAPI
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'このエンドポイントは開発環境でのみ使用できます' },
      { status: 403 }
    );
  }

  try {
    const supabase = createClient();

    console.log('使用中のキー: 統一されたクライアント');

    // テストユーザーのプロフィールデータ
    const testProfiles = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        username: 'giver_taro',
        display_name: 'ギバー太郎',
        bio: 'ギバータイプのテストユーザーです。積極的に教えることで学ぶ姿勢を持っています。'
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        username: 'matcher_hanako',
        display_name: 'マッチャー花子',
        bio: 'マッチャータイプのテストユーザーです。バランスの取れた学習スタイルです。'
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        username: 'taker_jiro',
        display_name: 'テイカー次郎',
        bio: 'テイカータイプのテストユーザーです。学びを受け取ることを重視しています。'
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        username: 'admin_user',
        display_name: '管理者',
        bio: '管理者アカウントです。'
      }
    ];

    // プロフィールを作成
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert(testProfiles, { 
        onConflict: 'id',
        ignoreDuplicates: true 
      })
      .select();

    if (profileError) {
      console.error('プロフィール作成エラー:', profileError);
      throw profileError;
    }

    console.log('プロフィール作成成功:', profileData);

    // ギバースコアを作成
    const giverScores = [
      {
        user_id: '11111111-1111-1111-1111-111111111111',
        score_type: 'overall',
        score_value: 80,
        description: 'ギバータイプの初期スコア'
      },
      {
        user_id: '22222222-2222-2222-2222-222222222222',
        score_type: 'overall',
        score_value: 50,
        description: 'マッチャータイプの初期スコア'
      },
      {
        user_id: '33333333-3333-3333-3333-333333333333',
        score_type: 'overall',
        score_value: 20,
        description: 'テイカータイプの初期スコア'
      },
      {
        user_id: '44444444-4444-4444-4444-444444444444',
        score_type: 'overall',
        score_value: 100,
        description: '管理者の初期スコア'
      }
    ];

    const { data: scoresData, error: scoresError } = await supabase
      .from('giver_scores')
      .upsert(giverScores, { 
        onConflict: 'user_id,score_type',
        ignoreDuplicates: true 
      })
      .select();

    if (scoresError) {
      console.error('ギバースコア作成エラー:', scoresError);
      // エラーがあっても続行（プロフィールが作成できていれば十分）
    }

    console.log('ギバースコア作成結果:', scoresData);

    return NextResponse.json({
      success: true,
      message: 'テストユーザープロフィールを作成しました',
      profiles: profileData,
      giverScores: scoresData
    });

  } catch (error: any) {
    console.error('テストプロフィール作成エラー:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        details: error
      },
      { status: 500 }
    );
  }
} 