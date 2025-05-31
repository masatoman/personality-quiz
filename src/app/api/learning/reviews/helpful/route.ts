import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// 役立った投票 (POST /api/learning/reviews/helpful)
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const { review_id, is_helpful } = body;

    if (!review_id || typeof is_helpful !== 'boolean') {
      return NextResponse.json(
        { error: 'review_idとis_helpfulが必要です' },
        { status: 400 }
      );
    }

    // レビューの存在確認
    const { data: review } = await supabase
      .from('resource_reviews')
      .select('id, user_id')
      .eq('id', review_id)
      .eq('is_approved', true)
      .single();

    if (!review) {
      return NextResponse.json({ error: 'レビューが見つかりません' }, { status: 404 });
    }

    // 自分のレビューには投票できない
    if (review.user_id === user.id) {
      return NextResponse.json(
        { error: '自分のレビューには投票できません' },
        { status: 400 }
      );
    }

    // 既存の投票をチェック
    const { data: existingVote } = await supabase
      .from('review_helpful_votes')
      .select('id, is_helpful')
      .eq('user_id', user.id)
      .eq('review_id', review_id)
      .single();

    const now = new Date().toISOString();

    let voteResult;
    if (existingVote) {
      if (existingVote.is_helpful === is_helpful) {
        // 同じ投票なら削除（取り消し）
        const { error: deleteError } = await supabase
          .from('review_helpful_votes')
          .delete()
          .eq('user_id', user.id)
          .eq('review_id', review_id);

        if (deleteError) throw deleteError;
        voteResult = { action: 'removed', is_helpful: null };
      } else {
        // 異なる投票なら更新
        const { data, error } = await supabase
          .from('review_helpful_votes')
          .update({
            is_helpful,
            updated_at: now
          })
          .eq('user_id', user.id)
          .eq('review_id', review_id)
          .select()
          .single();

        if (error) throw error;
        voteResult = { action: 'updated', is_helpful, vote: data };
      }
    } else {
      // 新規投票
      const { data, error } = await supabase
        .from('review_helpful_votes')
        .insert({
          user_id: user.id,
          review_id,
          is_helpful,
          created_at: now,
          updated_at: now
        })
        .select()
        .single();

      if (error) throw error;
      voteResult = { action: 'created', is_helpful, vote: data };
    }

    // レビューの役立った数を更新
    await updateReviewHelpfulCount(supabase, review_id);

    // 役立った投票でポイント付与（レビュー投稿者へ）
    if (is_helpful && (voteResult.action === 'created' || 
       (voteResult.action === 'updated' && !existingVote?.is_helpful))) {
      await awardHelpfulVotePoints(review.user_id, review_id);
    }

    return NextResponse.json({
      success: true,
      result: voteResult
    });

  } catch (error) {
    console.error('Helpful vote error:', error);
    return NextResponse.json(
      { error: '投票中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// 投票状況取得 (GET /api/learning/reviews/helpful?review_id=xxx)
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    const { searchParams } = new URL(request.url);
    
    const reviewId = searchParams.get('review_id');

    if (!reviewId) {
      return NextResponse.json({ error: 'review_idが必要です' }, { status: 400 });
    }

    // 役立った数の統計
    const { data: stats } = await supabase
      .from('review_helpful_votes')
      .select('is_helpful', { count: 'exact' })
      .eq('review_id', reviewId);

    const helpfulCount = stats?.filter(v => v.is_helpful).length || 0;
    const notHelpfulCount = stats?.filter(v => !v.is_helpful).length || 0;

    // ユーザーの投票状況（ログイン済みの場合）
    let userVote = null;
    if (user) {
      const { data: vote } = await supabase
        .from('review_helpful_votes')
        .select('is_helpful')
        .eq('user_id', user.id)
        .eq('review_id', reviewId)
        .single();

      userVote = vote?.is_helpful ?? null;
    }

    return NextResponse.json({
      statistics: {
        helpful_count: helpfulCount,
        not_helpful_count: notHelpfulCount,
        total_votes: helpfulCount + notHelpfulCount
      },
      user_vote: userVote
    });

  } catch (error) {
    console.error('Get helpful votes error:', error);
    return NextResponse.json(
      { error: '投票状況の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// ヘルパー関数：レビューの役立った数更新
async function updateReviewHelpfulCount(supabase: any, reviewId: string) {
  try {
    const { data: votes } = await supabase
      .from('review_helpful_votes')
      .select('is_helpful')
      .eq('review_id', reviewId);

    const helpfulCount = votes?.filter(v => v.is_helpful).length || 0;
    const totalVotes = votes?.length || 0;

    await supabase
      .from('resource_reviews')
      .update({
        helpful_count: helpfulCount,
        total_votes: totalVotes
      })
      .eq('id', reviewId);
  } catch (error) {
    console.error('Update review helpful count error:', error);
  }
}

// ヘルパー関数：役立った投票ポイント付与
async function awardHelpfulVotePoints(reviewUserId: string, reviewId: string) {
  try {
    await fetch('/api/points/giver-rewards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        activityType: 'comment_helpful',
        userId: reviewUserId,
        referenceId: reviewId,
        referenceType: 'review',
        description: 'レビューが役立ったと評価されました'
      })
    });
  } catch (error) {
    console.error('Award helpful vote points error:', error);
    // ポイント付与失敗してもメイン処理は継続
  }
} 