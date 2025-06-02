import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Dynamic Server Usage エラーを解決するため動的レンダリングを強制
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const materialId = searchParams.get('materialId'); // 特定の教材に基づく推薦
    const limit = parseInt(searchParams.get('limit') || '6');
    
    const supabase = createClient();
    
    // ユーザーベースの推薦
    if (userId) {
      return getUserBasedRecommendations(supabase, userId, limit);
    }
    
    // 教材ベースの推薦
    if (materialId) {
      return getMaterialBasedRecommendations(supabase, materialId, limit);
    }
    
    // 一般的な推薦（人気・新着）
    return getGeneralRecommendations(supabase, limit);
  } catch (error) {
    console.error('レコメンデーション取得エラー:', error);
    return NextResponse.json(
      { error: 'レコメンデーションの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// ユーザーベースのレコメンデーション
async function getUserBasedRecommendations(supabase: any, userId: string, limit: number) {
  try {
    // ユーザーの学習履歴とお気に入り、活動データを取得
    const { data: userActivities } = await supabase
      .from('user_activities')
      .select('activity_data')
      .eq('user_id', userId)
      .in('activity_type', ['material_viewed', 'material_favorited', 'quiz_completed']);
    
    // ユーザーが閲覧した教材のカテゴリ・タグを分析
    const interactedMaterialIds = userActivities
      ?.map((activity: any) => activity.activity_data?.material_id)
      .filter(Boolean) || [];
    
    let recommendations: any[] = [];
    
    if (interactedMaterialIds.length > 0) {
      // ユーザーの興味分野に基づく推薦
      const { data: userInterests } = await supabase
        .from('materials')
        .select('category, tags, difficulty')
        .in('id', interactedMaterialIds);
      
      const categories = Array.from(new Set(userInterests?.map((m: any) => m.category).filter(Boolean)));
      const allTags = userInterests?.flatMap((m: any) => m.tags || []) || [];
      const popularTags = getPopularTags(allTags);

      // 類似教材を取得
      const { data: similarMaterials } = await supabase
        .from('materials')
        .select(`
          *,
          author:profiles!materials_author_id_fkey(
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('is_public', true)
        .not('id', 'in', `(${interactedMaterialIds.join(',')})`)
        .or(
          categories.length > 0 
            ? `category.in.(${categories.join(',')}),tags.ov.{${popularTags.join(',')}}`
            : `tags.ov.{${popularTags.join(',')}}`
        )
        .order('rating', { ascending: false })
        .limit(limit);

      recommendations = similarMaterials || [];
    }

    // 推薦が少ない場合、人気教材で補完
    if (recommendations.length < limit) {
      const remaining = limit - recommendations.length;
      const { data: popularMaterials } = await supabase
        .from('materials')
        .select(`
          *,
          author:profiles!materials_author_id_fkey(
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('is_public', true)
        .not('id', 'in', `(${[...interactedMaterialIds, ...recommendations.map(r => r.id)].join(',')})`)
        .order('view_count', { ascending: false })
        .limit(remaining);

      recommendations = [...recommendations, ...(popularMaterials || [])];
    }

    return NextResponse.json({
      type: 'user_based',
      recommendations,
      explanation: 'あなたの学習履歴に基づいた推薦です',
    });
  } catch (error) {
    console.error('ユーザーベース推薦エラー:', error);
    return getGeneralRecommendations(supabase, limit);
  }
}

// 教材ベースのレコメンデーション
async function getMaterialBasedRecommendations(supabase: any, materialId: string, limit: number) {
  try {
    // 基準教材の情報を取得
    const { data: baseMaterial } = await supabase
      .from('materials')
      .select('category, tags, difficulty, author_id')
      .eq('id', materialId)
      .single();

    if (!baseMaterial) {
      return getGeneralRecommendations(supabase, limit);
    }

    // 類似教材を取得
    const { data: similarMaterials } = await supabase
      .from('materials')
      .select(`
        *,
        author:profiles!materials_author_id_fkey(
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('is_public', true)
      .neq('id', materialId)
      .or(
        baseMaterial.tags?.length > 0
          ? `category.eq.${baseMaterial.category},tags.ov.{${baseMaterial.tags.join(',')}},author_id.eq.${baseMaterial.author_id}`
          : `category.eq.${baseMaterial.category},author_id.eq.${baseMaterial.author_id}`
      )
      .order('rating', { ascending: false })
      .limit(limit);

    return NextResponse.json({
      type: 'material_based',
      recommendations: similarMaterials || [],
      explanation: 'この教材に関連する推薦です',
    });
  } catch (error) {
    console.error('教材ベース推薦エラー:', error);
    return getGeneralRecommendations(supabase, limit);
  }
}

// 一般的なレコメンデーション（人気・新着）
async function getGeneralRecommendations(supabase: any, limit: number) {
  try {
    const halfLimit = Math.ceil(limit / 2);

    // 人気教材
    const { data: popularMaterials } = await supabase
      .from('materials')
      .select(`
        *,
        author:profiles!materials_author_id_fkey(
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('is_public', true)
      .order('view_count', { ascending: false })
      .limit(halfLimit);

    // 新着教材
    const { data: recentMaterials } = await supabase
      .from('materials')
      .select(`
        *,
        author:profiles!materials_author_id_fkey(
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit - halfLimit);

    const recommendations = [
      ...(popularMaterials || []),
      ...(recentMaterials || []),
    ].slice(0, limit);

    return NextResponse.json({
      type: 'general',
      recommendations,
      explanation: '人気・新着教材の推薦です',
    });
  } catch (error) {
    console.error('一般推薦エラー:', error);
    return NextResponse.json(
      { error: 'レコメンデーションの取得に失敗しました' },
      { status: 500 }
    );
  }
}

// ヘルパー関数
function getPopularTags(tags: string[]): string[] {
  const tagCounts = tags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(tagCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([tag]) => tag);
} 