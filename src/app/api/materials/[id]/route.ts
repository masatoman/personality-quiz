import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const materialId = params.id;
    const skipAuth = process.env.SKIP_AUTH === 'true';

    // 認証チェック（開発環境ではスキップ）
    if (skipAuth) {
      console.log('開発環境: 認証をスキップしています');
    } else {
      const supabase = createClient();
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        return NextResponse.json(
          { error: '認証が必要です' },
          { status: 401 }
        );
      }
    }

    const supabase = createClient();

    // 教材データを取得
    const { data: materialData, error: materialError } = await supabase
      .from('materials')
      .select(`
        id,
        title,
        description,
        content,
        category,
        tags,
        difficulty_level,
        view_count,
        rating,
        created_at,
        is_published,
        user_id
      `)
      .eq('id', materialId)
      .eq('is_published', true)
      .single();

    if (materialError || !materialData) {
      return NextResponse.json(
        { error: '教材が見つかりませんでした' },
        { status: 404 }
      );
    }

    // プロファイル情報を取得
    let authorProfile = null;
    let authorUser = null;

    if (materialData.user_id) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', materialData.user_id)
        .single();

      const { data: userData } = await supabase
        .from('users')
        .select('personality_type, giver_score')
        .eq('id', materialData.user_id)
        .single();

      authorProfile = profileData;
      authorUser = userData;
    }

    // ビューカウントを増加
    await supabase
      .from('materials')
      .update({ view_count: (materialData.view_count || 0) + 1 })
      .eq('id', materialId);

    // 難易度ラベルを取得
    const getDifficultyLabel = (level: number): 'beginner' | 'intermediate' | 'advanced' => {
      if (level <= 2) return 'beginner';
      if (level <= 3) return 'intermediate';
      return 'advanced';
    };

    const getPersonalityType = (type: string | null): 'ギバー' | 'マッチャー' | 'テイカー' => {
      switch (type) {
        case 'giver': return 'ギバー';
        case 'matcher': return 'マッチャー';
        case 'taker': return 'テイカー';
        default: return 'マッチャー';
      }
    };

    // レスポンスデータを構築
    const responseData = {
      id: materialData.id,
      title: materialData.title,
      description: materialData.description || '',
      content: materialData.content || '',
      category: materialData.category,
      difficulty: getDifficultyLabel(materialData.difficulty_level),
      author: {
        id: materialData.user_id,
        name: authorProfile?.display_name || '匿名ユーザー',
        avatar: authorProfile?.avatar_url || '/avatars/default.png',
        giverScore: authorUser?.giver_score || 50,
        type: getPersonalityType(authorUser?.personality_type)
      },
      created_at: materialData.created_at,
      view_count: (materialData.view_count || 0) + 1,
      rating: materialData.rating || 0,
      is_bookmarked: false, // TODO: ユーザーのブックマーク状態を取得
      is_published: materialData.is_published,
      tags: materialData.tags || []
    };

    return NextResponse.json(responseData);
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