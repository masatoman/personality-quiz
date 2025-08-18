import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// 教材コメント一覧取得 (GET /api/materials/[id]/comments)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    
    const materialId = params.id;
    const parentId = searchParams.get('parent_id');
    const sort = searchParams.get('sort') || 'helpful_count'; // 'created_at', 'helpful_count'
    const order = searchParams.get('order') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    // ソート設定
    const validSortFields = ['created_at', 'helpful_count'];
    const sortField = validSortFields.includes(sort) ? sort : 'helpful_count';
    const sortOrder = order === 'desc' ? { ascending: false } : { ascending: true };

    // コメント取得クエリ
    let query = supabase
      .from('material_comments')
      .select(`
        *,
        profiles!user_id(
          id,
          username,
          display_name,
          avatar_url
        ),
        users!user_id(
          personality_type,
          giver_score
        )
      `)
      .eq('material_id', materialId)
      .eq('is_approved', true)
      .order(sortField, sortOrder);

    // 親コメントまたは返信の指定
    if (parentId) {
      query = query.eq('parent_comment_id', parentId);
    } else {
      query = query.is('parent_comment_id', null);
    }

    // ページネーション
    const offset = (page - 1) * limit;
    const { data: comments, error } = await query.range(offset, offset + limit - 1);

    if (error) throw error;

    // ユーザーの投票状況を取得（認証済みユーザーの場合）
    const { data: { user } } = await supabase.auth.getUser();
    
    let commentsWithVotes = comments || [];
    if (user && comments?.length) {
      const commentIds = comments.map(c => c.id);
      const { data: votes } = await supabase
        .from('comment_helpful_votes')
        .select('comment_id, is_helpful')
        .eq('user_id', user.id)
        .in('comment_id', commentIds);

      const voteMap = new Map(votes?.map(v => [v.comment_id, v.is_helpful]) || []);
      
      commentsWithVotes = comments.map(comment => ({
        ...comment,
        user_helpful_vote: voteMap.get(comment.id) || false
      }));
    }

    // 返信数を含めたコメントデータを整形
    const commentsWithReplies = await Promise.all(
      commentsWithVotes.map(async (comment) => {
        if (!parentId) { // 親コメントの場合のみ返信数を取得
          const { count } = await supabase
            .from('material_comments')
            .select('*', { count: 'exact', head: true })
            .eq('parent_comment_id', comment.id)
            .eq('is_approved', true);
          
          return {
            ...comment,
            reply_count: count || 0
          };
        }
        return comment;
      })
    );

    return NextResponse.json({
      success: true,
      comments: commentsWithReplies,
      pagination: {
        page,
        limit,
        total: commentsWithReplies.length
      }
    });

  } catch (error) {
    console.error('Comment fetch error:', error);
    return NextResponse.json(
      { error: 'コメントの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// 教材コメント作成 (POST /api/materials/[id]/comments)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const {
      parent_comment_id,
      comment_text
    } = body;

    const materialId = params.id;

    // バリデーション
    if (!comment_text?.trim()) {
      return NextResponse.json(
        { error: 'コメント内容は必須です' },
        { status: 400 }
      );
    }

    if (comment_text.length > 2000) {
      return NextResponse.json(
        { error: 'コメントは2000文字以内で入力してください' },
        { status: 400 }
      );
    }

    // 教材の存在確認
    const { data: material } = await supabase
      .from('materials')
      .select('id')
      .eq('id', materialId)
      .eq('is_published', true)
      .single();

    if (!material) {
      return NextResponse.json({ error: '教材が見つかりません' }, { status: 404 });
    }

    // 親コメントの存在確認（返信の場合）
    let parentComment = null;
    if (parent_comment_id) {
      const { data } = await supabase
        .from('material_comments')
        .select('id, user_id, depth')
        .eq('id', parent_comment_id)
        .eq('material_id', materialId)
        .eq('is_approved', true)
        .single();

      if (!data) {
        return NextResponse.json({ error: '親コメントが見つかりません' }, { status: 404 });
      }

      // ネストレベル制限（最大3階層）
      if (data.depth >= 2) {
        return NextResponse.json(
          { error: '返信の階層が深すぎます' },
          { status: 400 }
        );
      }

      parentComment = data;
    }

    const now = new Date().toISOString();
    const depth = parentComment ? parentComment.depth + 1 : 0;

    // コメント作成
    const { data: newComment, error } = await supabase
      .from('material_comments')
      .insert({
        user_id: user.id,
        material_id: materialId,
        parent_comment_id: parent_comment_id || null,
        comment_text: comment_text.trim(),
        depth,
        is_approved: true, // 自動承認
        created_at: now,
        updated_at: now
      })
      .select(`
        *,
        profiles!user_id(
          id,
          username,
          display_name,
          avatar_url
        ),
        users!user_id(
          personality_type,
          giver_score
        )
      `)
      .single();

    if (error) throw error;

    // ギバーポイント付与（コメント投稿）
    await awardCommentPoints(user.id, materialId, parent_comment_id ? 'reply' : 'comment');

    return NextResponse.json({
      success: true,
      comment: newComment
    });

  } catch (error) {
    console.error('Comment creation error:', error);
    return NextResponse.json(
      { error: 'コメントの作成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// ヘルパー関数：コメントポイント付与
async function awardCommentPoints(userId: string, materialId: string, type: 'comment' | 'reply') {
  try {
    // const supabase = createRouteHandlerClient({ cookies });
    
    // コメント投稿ポイント
    const points = type === 'comment' ? 15 : 10; // コメント15pt、返信10pt
    
    // ポイント付与API呼び出し
    await fetch('/api/points/giver-rewards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        activity_type: 'comment_helpful',
        points,
        description: type === 'comment' ? '教材への気づき共有' : 'コメントへの返信'
      })
    });
    
  } catch (error) {
    console.error('Failed to award comment points:', error);
    // ポイント付与エラーでもコメント投稿は成功扱い
  }
}
