import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// 開発環境でのみ既存の匿名ユーザーをテストユーザーに更新するAPI
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'このエンドポイントは開発環境でのみ使用できます' },
      { status: 403 }
    );
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 現在の匿名ユーザーを取得
    const { data: existingProfiles, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .limit(4);

    if (fetchError) {
      throw fetchError;
    }

    console.log('既存プロフィール:', existingProfiles);

    if (!existingProfiles || existingProfiles.length === 0) {
      return NextResponse.json({
        success: false,
        message: '更新対象のプロフィールが見つかりません'
      });
    }

    // テストユーザーデータ
    const testUserUpdates = [
      {
        username: 'giver_taro',
        display_name: 'ギバー太郎',
        bio: 'ギバータイプのテストユーザーです。積極的に教えることで学ぶ姿勢を持っています。'
      },
      {
        username: 'matcher_hanako',
        display_name: 'マッチャー花子',
        bio: 'マッチャータイプのテストユーザーです。バランスの取れた学習スタイルです。'
      },
      {
        username: 'taker_jiro',
        display_name: 'テイカー次郎',
        bio: 'テイカータイプのテストユーザーです。学びを受け取ることを重視しています。'
      },
      {
        username: 'admin_user',
        display_name: '管理者',
        bio: '管理者アカウントです。'
      }
    ];

    const updateResults = [];

    // 既存プロフィールを順番に更新
    for (let i = 0; i < Math.min(existingProfiles.length, testUserUpdates.length); i++) {
      const profile = existingProfiles[i];
      const updateData = testUserUpdates[i];

      try {
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', profile.id)
          .select();

        if (updateError) {
          throw updateError;
        }

        updateResults.push({
          id: profile.id,
          oldData: profile,
          newData: updatedProfile,
          status: 'success'
        });

        // ギバースコアも追加
        const giverScore = {
          user_id: profile.id,
          score_type: 'overall',
          score_value: i === 0 ? 80 : i === 1 ? 50 : i === 2 ? 20 : 100,
          description: `${updateData.display_name}の初期スコア`
        };

        const { error: scoreError } = await supabase
          .from('giver_scores')
          .upsert(giverScore, { 
            onConflict: 'user_id,score_type',
            ignoreDuplicates: true 
          });

        if (scoreError) {
          console.error('ギバースコア作成エラー:', scoreError);
        }

      } catch (err: any) {
        updateResults.push({
          id: profile.id,
          status: 'error',
          error: err.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: '既存プロフィールをテストユーザーに更新しました',
      updates: updateResults
    });

  } catch (error: any) {
    console.error('プロフィール更新エラー:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
} 