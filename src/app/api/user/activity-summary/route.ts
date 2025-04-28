import { NextResponse } from 'next/server';
import supabase from '@/services/supabaseClient';

/**
 * ユーザー活動サマリー情報を取得するAPIエンドポイント
 * 
 * @param request - クエリパラメータからユーザーIDを取得
 * @returns ユーザーのアクティビティ統計情報
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

    // データベースからユーザーの活動情報を取得
    // 1. 作成した教材数
    const { count: createdMaterialsCount, error: createdError } = await supabase
      .from('materials')
      .select('id', { count: 'exact' })
      .eq('author_id', userId);

    if (createdError) {
      console.error('教材数取得エラー:', createdError);
      return NextResponse.json(
        { error: '教材数の取得に失敗しました' },
        { status: 500 }
      );
    }

    // 2. 閲覧した教材数
    const { count: viewedMaterialsCount, error: viewedError } = await supabase
      .from('material_views')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);

    if (viewedError) {
      console.error('閲覧教材数取得エラー:', viewedError);
      return NextResponse.json(
        { error: '閲覧教材数の取得に失敗しました' },
        { status: 500 }
      );
    }

    // 3. 合計獲得ポイント
    const { data: pointsData, error: pointsError } = await supabase
      .from('points_history')
      .select('amount')
      .eq('user_id', userId)
      .gt('amount', 0); // プラスのポイントのみを集計

    if (pointsError) {
      console.error('ポイント取得エラー:', pointsError);
      return NextResponse.json(
        { error: 'ポイント情報の取得に失敗しました' },
        { status: 500 }
      );
    }

    const totalPoints = pointsData.reduce((sum, item) => sum + item.amount, 0);

    // 4. 前週との比較データを取得（簡易実装 - 実際には過去のデータと比較）
    // 実際のプロダクションでは、前の期間のデータを取得して比較する実装が必要
    const createdMaterialsChange = Math.floor(Math.random() * 5) * (Math.random() > 0.3 ? 1 : -1);
    const viewedMaterialsChange = Math.floor(Math.random() * 10) * (Math.random() > 0.3 ? 1 : -1);
    const totalPointsChange = Math.floor(Math.random() * 200) * (Math.random() > 0.3 ? 1 : -1);

    // レスポンスデータの作成
    const activityStats = {
      createdMaterials: createdMaterialsCount || 0,
      totalPoints: totalPoints || 0,
      viewedMaterials: viewedMaterialsCount || 0,
      createdMaterialsChange,
      totalPointsChange,
      viewedMaterialsChange,
    };

    return NextResponse.json(activityStats);
  } catch (error) {
    console.error('アクティビティサマリー取得エラー:', error);
    return NextResponse.json(
      { error: '予期せぬエラーが発生しました' },
      { status: 500 }
    );
  }
} 