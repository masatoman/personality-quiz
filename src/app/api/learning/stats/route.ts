import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { auth } from '@/lib/auth';

// ユーザーの学習統計を取得するAPIルート
export async function GET(request: NextRequest) {
  try {
    // URLからクエリパラメータを取得
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    // ユーザーIDが提供されていない場合はエラー
    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDが必要です' },
        { status: 400 }
      );
    }

    // 認証チェック - 自分のデータまたは管理者のみがアクセス可能
    const session = await auth();
    if (!session || (session.user.id !== userId && session.user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'このデータにアクセスする権限がありません' },
        { status: 403 }
      );
    }

    // Supabaseクライアントを作成
    const supabase = createClient();
    
    // ユーザー存在確認
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
    
    // 学習リソースの統計情報を取得
    const { data: resourceStats, error: resourceError } = await supabase
      .from('user_learning_progress')
      .select(`
        resource_id,
        completion_percentage,
        last_updated
      `)
      .eq('user_id', userId);
      
    if (resourceError) {
      console.error('学習リソース統計の取得エラー:', resourceError);
      return NextResponse.json(
        { error: '学習統計の取得中にエラーが発生しました' },
        { status: 500 }
      );
    }

    // ユーザーのポイント情報を取得
    const { data: userPoints, error: pointsError } = await supabase
      .from('user_progress')
      .select('total_score')
      .eq('user_id', userId)
      .single();
      
    if (pointsError && pointsError.code !== 'PGRST116') { // PGRST116: データが見つからない
      console.error('ユーザーポイント取得エラー:', pointsError);
      return NextResponse.json(
        { error: 'ユーザーポイントの取得中にエラーが発生しました' },
        { status: 500 }
      );
    }

    // 統計データを計算
    const totalResources = resourceStats ? resourceStats.length : 0;
    const completedResources = resourceStats 
      ? resourceStats.filter(item => item.completion_percentage === 100).length 
      : 0;
    const inProgressResources = totalResources - completedResources;
    const totalPoints = userPoints ? userPoints.total_score : 0;

    // レスポンスを返す
    return NextResponse.json({
      totalResources,
      completedResources,
      inProgressResources,
      totalPoints
    });
    
  } catch (error) {
    console.error('学習統計取得中の予期せぬエラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
} 