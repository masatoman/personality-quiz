import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { auth } from '@/lib/auth';
import { RecentResource } from '@/types/learning';

interface ResourceWithMaterials {
  resource_id: string | number;
  completion_percentage: number;
  last_updated: string;
  materials?: {
    id: string | number;
    title: string;
    thumbnail_url?: string | null;
    created_at: string;
    category?: string;
    difficulty_level?: string;
  };
}

// 最近アクセスした学習リソースを取得するAPIルート
export async function GET(request: NextRequest) {
  try {
    // URLからクエリパラメータを取得
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const limit = parseInt(url.searchParams.get('limit') || '5', 10);
    
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
    
    // 最近アクセスしたリソースを取得
    const { data: recentResources, error: resourceError } = await supabase
      .from('user_learning_progress')
      .select(`
        resource_id,
        completion_percentage,
        last_updated,
        materials(
          id,
          title,
          thumbnail_url,
          created_at,
          category,
          difficulty_level
        )
      `)
      .eq('user_id', userId)
      .order('last_updated', { ascending: false })
      .limit(limit);
      
    if (resourceError) {
      console.error('最近のリソース取得エラー:', resourceError);
      return NextResponse.json(
        { error: 'リソースの取得中にエラーが発生しました' },
        { status: 500 }
      );
    }

    // レスポンス用にデータを整形
    const formattedResources: RecentResource[] = (recentResources as unknown as ResourceWithMaterials[]).map(item => ({
      id: item.resource_id,
      title: item.materials?.title || '不明なタイトル',
      thumbnailUrl: item.materials?.thumbnail_url || null,
      completionPercentage: item.completion_percentage,
      lastUpdated: item.last_updated,
      resourceType: item.materials?.category || '一般'
    }));

    // レスポンスを返す
    return NextResponse.json(formattedResources);
    
  } catch (error) {
    console.error('リソース取得中の予期せぬエラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
} 