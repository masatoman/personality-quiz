import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 教材詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    
    // 教材データを取得
    const { data: material, error } = await supabase
      .from('materials')
      .select(`
        *,
        author:profiles!materials_author_id_fkey(
          id,
          username,
          display_name,
          avatar_url
        ),
        material_sections(*)
      `)
      .eq('id', params.id)
      .single();
    
    if (error) {
      console.error('教材取得エラー:', error);
      return NextResponse.json(
        { error: '教材が見つかりませんでした' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(material);
  } catch (error) {
    console.error('教材詳細取得エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

// 教材更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    
    // 認証確認
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }
    
    // リクエストボディ取得
    const updateData = await request.json();
    
    // 権限確認 - 自分の教材のみ更新可能
    const { data: material, error: checkError } = await supabase
      .from('materials')
      .select('author_id')
      .eq('id', params.id)
      .single();
    
    if (checkError || !material) {
      return NextResponse.json(
        { error: '教材が見つかりません' },
        { status: 404 }
      );
    }
    
    if (material.author_id !== user.id) {
      return NextResponse.json(
        { error: '編集権限がありません' },
        { status: 403 }
      );
    }
    
    // 教材更新
    const { data: updatedMaterial, error: updateError } = await supabase
      .from('materials')
      .update({
        title: updateData.title,
        description: updateData.description,
        content: updateData.content,
        category: updateData.category,
        difficulty: updateData.difficulty,
        estimated_time: updateData.estimatedTime,
        is_public: updateData.isPublic,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('教材更新エラー:', updateError);
      return NextResponse.json(
        { error: '教材の更新に失敗しました' },
        { status: 500 }
      );
    }
    
    // 活動履歴記録
    await supabase
      .from('user_activities')
      .insert({
        user_id: user.id,
        activity_type: 'material_updated',
        activity_data: {
          material_id: params.id,
          title: updateData.title,
        },
        points_earned: 5,
      });
    
    return NextResponse.json({
      success: true,
      material: updatedMaterial,
      message: '教材が正常に更新されました',
    });
  } catch (error) {
    console.error('教材更新エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

// 教材削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    
    // 認証確認
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }
    
    // 権限確認
    const { data: material, error: checkError } = await supabase
      .from('materials')
      .select('author_id, title')
      .eq('id', params.id)
      .single();
    
    if (checkError || !material) {
      return NextResponse.json(
        { error: '教材が見つかりません' },
        { status: 404 }
      );
    }
    
    if (material.author_id !== user.id) {
      return NextResponse.json(
        { error: '削除権限がありません' },
        { status: 403 }
      );
    }
    
    // 関連データを先に削除（カスケード削除でない場合）
    await supabase
      .from('material_sections')
      .delete()
      .eq('material_id', params.id);
    
    // 教材削除
    const { error: deleteError } = await supabase
      .from('materials')
      .delete()
      .eq('id', params.id);
    
    if (deleteError) {
      console.error('教材削除エラー:', deleteError);
      return NextResponse.json(
        { error: '教材の削除に失敗しました' },
        { status: 500 }
      );
    }
    
    // 活動履歴記録
    await supabase
      .from('user_activities')
      .insert({
        user_id: user.id,
        activity_type: 'material_deleted',
        activity_data: {
          material_id: params.id,
          title: material.title,
        },
        points_earned: 0,
      });
    
    return NextResponse.json({
      success: true,
      message: '教材が正常に削除されました',
    });
  } catch (error) {
    console.error('教材削除エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
} 