import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// お気に入り教材一覧取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDが必要です' },
        { status: 400 }
      );
    }
    
    const supabase = createClient();
    
    // お気に入り教材を取得
    const { data: favorites, error } = await supabase
      .from('user_material_favorites')
      .select(`
        material_id,
        created_at,
        materials!inner(
          *,
          author:profiles!materials_author_id_fkey(
            id,
            username,
            display_name,
            avatar_url
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('お気に入り教材取得エラー:', error);
      return NextResponse.json(
        { error: 'お気に入り教材の取得に失敗しました' },
        { status: 500 }
      );
    }
    
    // データを整形
    const formattedFavorites = favorites?.map(fav => ({
      ...fav.materials,
      favorited_at: fav.created_at,
    })) || [];
    
    return NextResponse.json(formattedFavorites);
  } catch (error) {
    console.error('お気に入り教材取得エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

// お気に入り追加
export async function POST(request: NextRequest) {
  try {
    const { materialId, userId } = await request.json();
    
    if (!materialId || !userId) {
      return NextResponse.json(
        { error: '教材IDとユーザーIDが必要です' },
        { status: 400 }
      );
    }
    
    const supabase = createClient();
    
    // 認証確認
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user || user.id !== userId) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }
    
    // 既にお気に入りに追加されているかチェック
    const { data: existing } = await supabase
      .from('user_material_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('material_id', materialId)
      .single();
    
    if (existing) {
      return NextResponse.json(
        { error: '既にお気に入りに追加されています' },
        { status: 409 }
      );
    }
    
    // お気に入りに追加
    const { data: favorite, error } = await supabase
      .from('user_material_favorites')
      .insert({
        user_id: userId,
        material_id: materialId,
      })
      .select()
      .single();
    
    if (error) {
      console.error('お気に入り追加エラー:', error);
      return NextResponse.json(
        { error: 'お気に入りの追加に失敗しました' },
        { status: 500 }
      );
    }
    
    // 活動履歴記録
    await supabase
      .from('user_activities')
      .insert({
        user_id: userId,
        activity_type: 'material_favorited',
        activity_data: {
          material_id: materialId,
        },
        points_earned: 1,
      });
    
    return NextResponse.json({
      success: true,
      favorite,
      message: 'お気に入りに追加されました',
    });
  } catch (error) {
    console.error('お気に入り追加エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

// お気に入り削除
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const materialId = searchParams.get('materialId');
    const userId = searchParams.get('userId');
    
    if (!materialId || !userId) {
      return NextResponse.json(
        { error: '教材IDとユーザーIDが必要です' },
        { status: 400 }
      );
    }
    
    const supabase = createClient();
    
    // 認証確認
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user || user.id !== userId) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }
    
    // お気に入りから削除
    const { error } = await supabase
      .from('user_material_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('material_id', materialId);
    
    if (error) {
      console.error('お気に入り削除エラー:', error);
      return NextResponse.json(
        { error: 'お気に入りの削除に失敗しました' },
        { status: 500 }
      );
    }
    
    // 活動履歴記録
    await supabase
      .from('user_activities')
      .insert({
        user_id: userId,
        activity_type: 'material_unfavorited',
        activity_data: {
          material_id: materialId,
        },
        points_earned: 0,
      });
    
    return NextResponse.json({
      success: true,
      message: 'お気に入りから削除されました',
    });
  } catch (error) {
    console.error('お気に入り削除エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
} 