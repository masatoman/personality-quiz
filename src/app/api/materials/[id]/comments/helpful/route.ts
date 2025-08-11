import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// コメント役立った投票 (POST /api/materials/[id]/comments/helpful)
export async function POST(
  request: NextRequest,
  { params: _ }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const { comment_id, is_helpful } = body;

    if (!comment_id || typeof is_helpful !== 'boolean') {
      return NextResponse.json(
        { error: 'comment_idとis_helpfulが必要です' },
        { status: 400 }
      );
    }

    // コメントの存在確認
    const { data: comment } = await supabase
      .from('material_comments')
      .select('id, user_id, material_id')
      .eq('id', comment_id)
      .eq('is_approved', true)
      .single();

    if (!comment) {
      return NextResponse.json({ error: 'コメントが見つかりません' }, { status: 404 });
    }

    // 自分のコメントには投票できない
    if (comment.user_id === user.id) {
      return NextResponse.json(
        { error: '自分のコメントには投票できません' },
        { status: 400 }
      );
    }

    // 既存の投票をチェック
    const { data: existingVote } = await supabase
      .from('comment_helpful_votes')
      .select('id, is_helpful')
      .eq('user_id', user.id)
      .eq('comment_id', comment_id)
      .single();

    const now = new Date().toISOString();

    let voteResult;
    if (existingVote) {
      if (existingVote.is_helpful === is_helpful) {
        // 同じ投票なら削除（取り消し）
        const { error: deleteError } = await supabase
          .from('comment_helpful_votes')
          .delete()
          .eq('user_id', user.id)
          .eq('comment_id', comment_id);

        if (deleteError) throw deleteError;
        voteResult = { action: 'removed', is_helpful: null };
      } else {
        // 異なる投票なら更新
        const { data, error } = await supabase
          .from('comment_helpful_votes')
          .update({
            is_helpful,
            updated_at: now
          })
          .eq('user_id', user.id)
          .eq('comment_id', comment_id)
          .select()
          .single();

        if (error) throw error;
        voteResult = { action: 'updated', is_helpful, vote: data };
      }
    } else {
      // 新規投票
      const { data, error } = await supabase
        .from('comment_helpful_votes')
        .insert({
          user_id: user.id,
          comment_id,
          is_helpful,
          created_at: now,
          updated_at: now
        })
        .select()
        .single();

      if (error) throw error;
      voteResult = { action: 'created', is_helpful, vote: data };
    }

    // コメントの役立った数を更新
    await updateCommentHelpfulCount(supabase, comment_id);

    // 役立った投票でポイント付与（コメント投稿者へ）
    if (is_helpful && (voteResult.action === 'created' || 
       (voteResult.action === 'updated' && !existingVote?.is_helpful))) {
      await awardHelpfulVotePoints(comment.user_id, comment_id);
    }

    return NextResponse.json({
      success: true,
      result: voteResult
    });

  } catch (error) {
    console.error('Comment helpful vote error:', error);
    return NextResponse.json(
      { error: '投票中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// コメント投票状況取得 (GET /api/materials/[id]/comments/helpful?comment_id=xxx)
export async function GET(
  request: NextRequest,
  { params: _ }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('comment_id');

    if (!commentId) {
      return NextResponse.json({ error: 'comment_idが必要です' }, { status: 400 });
    }

    if (!user) {
      return NextResponse.json({
        success: true,
        user_vote: null
      });
    }

    // ユーザーの投票状況を取得
    const { data: vote } = await supabase
      .from('comment_helpful_votes')
      .select('is_helpful')
      .eq('user_id', user.id)
      .eq('comment_id', commentId)
      .single();

    return NextResponse.json({
      success: true,
      user_vote: vote ? vote.is_helpful : null
    });

  } catch (error) {
    console.error('Vote status fetch error:', error);
    return NextResponse.json(
      { error: '投票状況の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// ヘルパー関数：コメント役立ち度カウント更新
async function updateCommentHelpfulCount(supabase: any, commentId: string) {
  try {
    const { data } = await supabase.rpc('update_comment_helpful_count', {
      comment_id: commentId
    });
    
    return data;
  } catch (error) {
    console.error('Failed to update helpful count:', error);
    // エラーでも処理継続
  }
}

// ヘルパー関数：役立ち投票ポイント付与
async function awardHelpfulVotePoints(userId: string, _commentId: string) {
  try {
    // ハートをもらったユーザーにボーナスポイント
    await fetch('/api/points/giver-rewards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        activity_type: 'helpful_vote_received',
        points: 5, // ハート1つにつき5ポイント
        description: 'コメントが役立ったと評価されました'
      })
    });
    
  } catch (error) {
    console.error('Failed to award helpful vote points:', error);
    // ポイント付与エラーでも投票は成功扱い
  }
}
