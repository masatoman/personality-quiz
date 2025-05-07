import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { auth } from '@/lib/auth';

// 学習進捗を更新するAPIルート
export async function POST(request: NextRequest) {
  try {
    // リクエストボディの取得
    const body = await request.json();
    const { userId, resourceId, completionPercentage, notes } = body;
    
    // 必須パラメータの検証
    if (!userId || !resourceId || completionPercentage === undefined) {
      return NextResponse.json(
        { error: 'ユーザーID、リソースID、進捗率は必須です' },
        { status: 400 }
      );
    }
    
    // 進捗率の範囲チェック
    if (completionPercentage < 0 || completionPercentage > 100) {
      return NextResponse.json(
        { error: '進捗率は0〜100の範囲で指定してください' },
        { status: 400 }
      );
    }

    // 認証チェック - 自分のデータまたは管理者のみが更新可能
    const session = await auth();
    if (!session || (session.user.id !== userId && session.user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'この操作を行う権限がありません' },
        { status: 403 }
      );
    }

    // Supabaseクライアントを作成
    const supabase = createClient();
    
    // ユーザーとリソースの存在確認
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();
      
    if (userError || !userData) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }
    
    const { data: resourceData, error: resourceError } = await supabase
      .from('materials')
      .select('id')
      .eq('id', resourceId)
      .single();
      
    if (resourceError || !resourceData) {
      return NextResponse.json(
        { error: 'リソースが見つかりません' },
        { status: 404 }
      );
    }
    
    // 現在の進捗を確認
    const { data: currentProgress } = await supabase
      .from('user_learning_progress')
      .select('completion_percentage')
      .eq('user_id', userId)
      .eq('resource_id', resourceId)
      .single();
    
    const wasCompletedBefore = currentProgress?.completion_percentage === 100;
    const isCompletedNow = completionPercentage === 100;
    
    // 進捗データの更新または挿入
    const { error: updateError } = await supabase
      .from('user_learning_progress')
      .upsert({
        user_id: userId,
        resource_id: resourceId,
        completion_percentage: completionPercentage,
        notes: notes || null,
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'user_id,resource_id'
      });
      
    if (updateError) {
      console.error('進捗更新エラー:', updateError);
      return NextResponse.json(
        { error: '進捗の更新中にエラーが発生しました' },
        { status: 500 }
      );
    }
    
    // 新たに完了した場合はポイント付与とアクティビティ記録
    if (!wasCompletedBefore && isCompletedNow) {
      // 教材情報を取得
      const { data: materialDetails } = await supabase
        .from('materials')
        .select('title, difficulty_level')
        .eq('id', resourceId)
        .single();
        
      // 難易度に応じてポイント設定
      let pointsToAdd = 5; // デフォルト
      if (materialDetails) {
        if (materialDetails.difficulty_level === 'intermediate') {
          pointsToAdd = 10;
        } else if (materialDetails.difficulty_level === 'advanced') {
          pointsToAdd = 15;
        }
      }
      
      // ユーザーのポイント更新
      await supabase.rpc('increment_user_points', {
        target_user_id: userId,
        points_to_add: pointsToAdd
      });
      
      // アクティビティ記録
      await supabase
        .from('user_activity')
        .insert({
          user_id: userId,
          activity_type: 'complete_resource',
          reference_id: resourceId,
          points: pointsToAdd,
          details: {
            resource_title: materialDetails?.title,
            difficulty_level: materialDetails?.difficulty_level
          }
        });
    }

    // 成功レスポンス
    return NextResponse.json({
      success: true,
      message: '学習進捗が更新されました',
      completionPercentage,
      isNewCompletion: !wasCompletedBefore && isCompletedNow
    });
    
  } catch (error) {
    console.error('進捗更新中の予期せぬエラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
} 