import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// 推薦リソース取得 (GET /api/learning/recommendations)
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const strategy = searchParams.get('strategy') || 'mixed'; // 'collaborative', 'content', 'mixed'

    switch (strategy) {
      case 'collaborative': {
        const recommendations = await getCollaborativeRecommendations(supabase, user.id, limit);
        return NextResponse.json({
          recommendations,
          strategy_used: strategy,
          count: recommendations.length
        });
      }
      case 'content': {
        const recommendations = await getContentBasedRecommendations(supabase, user.id, limit);
        return NextResponse.json({
          recommendations,
          strategy_used: strategy,
          count: recommendations.length
        });
      }
      case 'mixed':
      default: {
        // 複合推薦：コラボレーティブ50% + コンテンツベース50%
        const collabLimit = Math.floor(limit / 2);
        const contentLimit = limit - collabLimit;
        
        const [collabRecs, contentRecs] = await Promise.all([
          getCollaborativeRecommendations(supabase, user.id, collabLimit),
          getContentBasedRecommendations(supabase, user.id, contentLimit)
        ]);

        // 重複除去とシャッフル
        const seenIds = new Set();
        const recommendations = [...collabRecs, ...contentRecs].filter(rec => {
          if (seenIds.has(rec.id)) return false;
          seenIds.add(rec.id);
          return true;
        });
        
        // 推薦スコアでソート
        recommendations.sort((a, b) => b.recommendation_score - a.recommendation_score);
        const finalRecommendations = recommendations.slice(0, limit);
        
        return NextResponse.json({
          recommendations: finalRecommendations,
          strategy_used: strategy,
          count: finalRecommendations.length
        });
      }
    }

  } catch (error) {
    console.error('Recommendations fetch error:', error);
    return NextResponse.json(
      { error: '推薦の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// コラボレーティブフィルタリング推薦
async function getCollaborativeRecommendations(supabase: any, userId: string, limit: number) {
  try {
    // 1. ユーザーの学習履歴を取得
    const { data: userProgress } = await supabase
      .from('learning_progress')
      .select('resource_id, is_completed')
      .eq('user_id', userId);

    if (!userProgress || userProgress.length === 0) {
      return await getFallbackRecommendations(supabase, limit);
    }

    const completedResourceIds = userProgress
      .filter(p => p.is_completed)
      .map(p => p.resource_id);

    if (completedResourceIds.length === 0) {
      return await getFallbackRecommendations(supabase, limit);
    }

    // 2. 類似ユーザーを見つける（同じリソースを完了したユーザー）
    const { data: similarUsers } = await supabase
      .from('learning_progress')
      .select('user_id')
      .in('resource_id', completedResourceIds)
      .eq('is_completed', true)
      .neq('user_id', userId);

    if (!similarUsers || similarUsers.length === 0) {
      return await getFallbackRecommendations(supabase, limit);
    }

    const similarUserIds = [...new Set(similarUsers.map(u => u.user_id))];

    // 3. 類似ユーザーが完了した他のリソースを取得
    const { data: recommendedResources } = await supabase
      .from('learning_progress')
      .select(`
        resource_id,
        learning_resources!inner(
          id,
          title,
          description,
          content_type,
          average_rating,
          view_count,
          completion_count,
          estimated_duration,
          resource_categories(name, icon_name),
          difficulty_levels(display_name, color_code)
        )
      `)
      .in('user_id', similarUserIds)
      .eq('is_completed', true)
      .not('resource_id', 'in', `(${completedResourceIds.join(',')})`);

    if (!recommendedResources) return [];

    // 4. 推薦スコア計算（完了した類似ユーザー数 + リソースの品質）
    const resourceScores = new Map();
    
    recommendedResources.forEach(item => {
      const resource = item.learning_resources;
      const resourceId = resource.id;
      
      if (!resourceScores.has(resourceId)) {
        resourceScores.set(resourceId, {
          ...resource,
          user_count: 0,
          recommendation_score: 0
        });
      }
      
      const current = resourceScores.get(resourceId);
      current.user_count += 1;
      
      // スコア計算：類似ユーザー数 + 品質スコア
      const qualityScore = (resource.average_rating || 0) * 10 + 
                          Math.log(resource.view_count + 1) * 2 +
                          Math.log(resource.completion_count + 1) * 3;
      
      current.recommendation_score = current.user_count * 20 + qualityScore;
    });

    return Array.from(resourceScores.values())
      .sort((a, b) => b.recommendation_score - a.recommendation_score)
      .slice(0, limit);

  } catch (error) {
    console.error('Collaborative filtering error:', error);
    return await getFallbackRecommendations(supabase, limit);
  }
}

// コンテンツベース推薦
async function getContentBasedRecommendations(supabase: any, userId: string, limit: number) {
  try {
    // 1. ユーザーの学習履歴から好みを分析
    const { data: userProgress } = await supabase
      .from('learning_progress')
      .select(`
        learning_resources!inner(
          category_id,
          difficulty_level_id,
          content_type,
          average_rating,
          resource_categories(name),
          difficulty_levels(level_code)
        )
      `)
      .eq('user_id', userId)
      .eq('is_completed', true);

    if (!userProgress || userProgress.length === 0) {
      return await getFallbackRecommendations(supabase, limit);
    }

    // 2. 好みの分析
    const preferences = {
      categories: new Map(),
      difficulties: new Map(),
      contentTypes: new Map()
    };

    userProgress.forEach(item => {
      const resource = item.learning_resources;
      
      // カテゴリ好み
      if (resource.category_id) {
        const categoryName = resource.resource_categories?.name;
        if (categoryName) {
          preferences.categories.set(categoryName, 
            (preferences.categories.get(categoryName) || 0) + 1);
        }
      }
      
      // 難易度好み
      if (resource.difficulty_level_id) {
        const difficultyCode = resource.difficulty_levels?.level_code;
        if (difficultyCode) {
          preferences.difficulties.set(difficultyCode,
            (preferences.difficulties.get(difficultyCode) || 0) + 1);
        }
      }
      
      // コンテンツタイプ好み
      preferences.contentTypes.set(resource.content_type,
        (preferences.contentTypes.get(resource.content_type) || 0) + 1);
    });

    // 3. 好みに基づいて推薦候補を取得
    const topCategories = Array.from(preferences.categories.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name);

    const topDifficulties = Array.from(preferences.difficulties.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([code]) => code);

    const topContentTypes = Array.from(preferences.contentTypes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type]) => type);

    // 4. 推薦リソースを検索
    let query = supabase
      .from('learning_resources')
      .select(`
        id,
        title,
        description,
        content_type,
        average_rating,
        view_count,
        completion_count,
        estimated_duration,
        resource_categories!inner(name, icon_name),
        difficulty_levels!inner(display_name, color_code, level_code)
      `)
      .eq('is_published', true)
      .eq('moderation_status', 'approved');

    // 未完了のリソースのみ
    const { data: completedIds } = await supabase
      .from('learning_progress')
      .select('resource_id')
      .eq('user_id', userId);

    if (completedIds && completedIds.length > 0) {
      const completedResourceIds = completedIds.map(item => item.resource_id);
      query = query.not('id', 'in', `(${completedResourceIds.join(',')})`);
    }

    const { data: candidates } = await query.limit(limit * 3); // 余裕を持って取得

    if (!candidates) return [];

    // 5. コンテンツベーススコア計算
    const scoredCandidates = candidates.map(resource => {
      let score = 0;

      // カテゴリマッチ
      const categoryName = resource.resource_categories?.name;
      if (categoryName && topCategories.includes(categoryName)) {
        const categoryIndex = topCategories.indexOf(categoryName);
        score += (3 - categoryIndex) * 30; // 1位:90pt, 2位:60pt, 3位:30pt
      }

      // 難易度マッチ
      const difficultyCode = resource.difficulty_levels?.level_code;
      if (difficultyCode && topDifficulties.includes(difficultyCode)) {
        const difficultyIndex = topDifficulties.indexOf(difficultyCode);
        score += (2 - difficultyIndex) * 20; // 1位:40pt, 2位:20pt
      }

      // コンテンツタイプマッチ
      if (topContentTypes.includes(resource.content_type)) {
        const typeIndex = topContentTypes.indexOf(resource.content_type);
        score += (3 - typeIndex) * 15; // 1位:45pt, 2位:30pt, 3位:15pt
      }

      // 品質スコア
      const qualityScore = (resource.average_rating || 0) * 5 + 
                          Math.log(resource.view_count + 1) +
                          Math.log(resource.completion_count + 1) * 2;
      
      score += qualityScore;

      return {
        ...resource,
        recommendation_score: score
      };
    });

    return scoredCandidates
      .sort((a, b) => b.recommendation_score - a.recommendation_score)
      .slice(0, limit);

  } catch (error) {
    console.error('Content-based filtering error:', error);
    return await getFallbackRecommendations(supabase, limit);
  }
}

// フォールバック推薦（人気リソース）
async function getFallbackRecommendations(supabase: any, limit: number) {
  try {
    const { data: popularResources } = await supabase
      .from('learning_resources')
      .select(`
        id,
        title,
        description,
        content_type,
        average_rating,
        view_count,
        completion_count,
        estimated_duration,
        resource_categories(name, icon_name),
        difficulty_levels(display_name, color_code)
      `)
      .eq('is_published', true)
      .eq('moderation_status', 'approved')
      .order('view_count', { ascending: false })
      .order('average_rating', { ascending: false })
      .limit(limit);

    return (popularResources || []).map(resource => ({
      ...resource,
      recommendation_score: resource.view_count + (resource.average_rating || 0) * 10
    }));

  } catch (error) {
    console.error('Fallback recommendations error:', error);
    return [];
  }
} 