import { NextResponse } from 'next/server';
import supabase from '@/services/supabaseClient';
import { ActivityType } from '@/types/quiz';

/**
 * ユーザーの活動タイプ別統計を取得するAPIエンドポイント
 * 
 * @param request - クエリパラメータからユーザーIDを取得
 * @returns 活動タイプ別の集計結果
 */
export async function GET(request: Request) {
  try {
    // URLからクエリパラメータを取得
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // ユーザーIDが提供されていない場合はエラー
    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDが必要です' },
        { status: 400 }
      );
    }

    // 認証チェックは削除（元々コメントアウト）

    // 活動タイプの定義
    const activityTypes: ActivityType[] = [
      'CREATE_CONTENT',
      'PROVIDE_FEEDBACK',
      'CONSUME_CONTENT',
      'RECEIVE_FEEDBACK',
      'SHARE_RESOURCE',
      'ASK_QUESTION'
    ];

    // 各活動タイプごとのデータを取得
    const activityCounts: Record<ActivityType, number> = {} as Record<ActivityType, number>;

    // CREATE_CONTENT: 教材作成数
    const { count: createCount, error: createError } = await supabase
      .from('materials')
      .select('id', { count: 'exact' })
      .eq('author_id', userId);

    if (createError) {
      console.error('教材数取得エラー:', createError);
    } else {
      activityCounts['CREATE_CONTENT'] = createCount || 0;
    }

    // CONSUME_CONTENT: 教材利用数
    const { count: consumeCount, error: consumeError } = await supabase
      .from('material_views')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);

    if (consumeError) {
      console.error('教材利用数取得エラー:', consumeError);
    } else {
      activityCounts['CONSUME_CONTENT'] = consumeCount || 0;
    }

    // PROVIDE_FEEDBACK: フィードバック提供数
    const { count: feedbackCount, error: feedbackError } = await supabase
      .from('material_feedback')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);

    if (feedbackError) {
      console.error('フィードバック数取得エラー:', feedbackError);
    } else {
      activityCounts['PROVIDE_FEEDBACK'] = feedbackCount || 0;
    }

    // RECEIVE_FEEDBACK: 受け取ったフィードバック数
    // 入れ子クエリの代わりに2段階のクエリを実行
    // まずユーザーが作成した教材のIDを取得
    const { data: userMaterials, error: materialsError } = await supabase
      .from('materials')
      .select('id')
      .eq('author_id', userId);
    
    if (materialsError) {
      console.error('ユーザー教材取得エラー:', materialsError);
      activityCounts['RECEIVE_FEEDBACK'] = 0;
    } else {
      // 次に、これらの教材へのフィードバック数を取得
      const materialIds = userMaterials.map(m => m.id);
      
      if (materialIds.length > 0) {
        const { count: receiveFeedbackCount, error: receiveFeedbackError } = await supabase
          .from('material_feedback')
          .select('id', { count: 'exact' })
          .in('material_id', materialIds);

        if (receiveFeedbackError) {
          console.error('受領フィードバック数取得エラー:', receiveFeedbackError);
          activityCounts['RECEIVE_FEEDBACK'] = 0;
        } else {
          activityCounts['RECEIVE_FEEDBACK'] = receiveFeedbackCount || 0;
        }
      } else {
        activityCounts['RECEIVE_FEEDBACK'] = 0;
      }
    }

    // SHARE_RESOURCE: リソース共有数（モック）
    activityCounts['SHARE_RESOURCE'] = Math.floor(Math.random() * 10);

    // ASK_QUESTION: 質問数（モック）
    activityCounts['ASK_QUESTION'] = Math.floor(Math.random() * 15);

    // レスポンスデータの作成
    return NextResponse.json({ activityCounts });
  } catch (error) {
    console.error('活動統計取得エラー:', error);
    return NextResponse.json(
      { error: '予期せぬエラーが発生しました' },
      { status: 500 }
    );
  }
} 