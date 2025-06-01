import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// コメント一覧取得 (GET /api/learning/comments?resource_id=xxx)
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    
    const resourceId = searchParams.get('resource_id');
    const parentId = searchParams.get('parent_id');
    const sort = searchParams.get('sort') || 'created_at'; // 'created_at', 'helpful_count'
    const order = searchParams.get('order') || 'asc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    if (!resourceId) {
      return NextResponse.json({ error: 'resource_idが必要です' }, { status: 400 });
    }

    // ソート設定
    const validSortFields = ['created_at', 'helpful_count'];
    const sortField = validSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = order === 'desc' ? { ascending: false } : { ascending: true };

    // コメント取得クエリ
    let query = supabase
      .from('resource_comments')
      .select(`
        *,
        profiles!user_id(
          id,
          username,
          display_name,
          avatar_url
        ),
        replies:resource_comments!parent_comment_id(
          count
        )
      `)
      .eq('resource_id', resourceId)
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

    // 返信数を含めたコメントデータを整形
    const formattedComments = (comments || []).map((comment: any) => ({
      ...comment,
      reply_count: comment.replies?.[0]?.count || 0,
      replies: undefined // 重複データ削除
    }));

    return NextResponse.json({
      comments: formattedComments,
      pagination: {
        page,
        limit,
        has_more: (comments?.length || 0) === limit
      }
    });

  } catch (error) {
    console.error('Comments fetch error:', error);
    return NextResponse.json(
      { error: 'コメントの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// コメント作成 (POST /api/learning/comments)
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const {
      resource_id,
      parent_comment_id,
      comment_text
    } = body;

    // バリデーション
    if (!resource_id || !comment_text?.trim()) {
      return NextResponse.json(
        { error: 'resource_idとcomment_textは必須です' },
        { status: 400 }
      );
    }

    if (comment_text.length > 2000) {
      return NextResponse.json(
        { error: 'コメントは2000文字以内で入力してください' },
        { status: 400 }
      );
    }

    // リソースの存在確認
    const { data: resource } = await supabase
      .from('learning_resources')
      .select('id')
      .eq('id', resource_id)
      .eq('is_published', true)
      .single();

    if (!resource) {
      return NextResponse.json({ error: 'リソースが見つかりません' }, { status: 404 });
    }

    // 親コメントの存在確認（返信の場合）
    let parentComment = null;
    if (parent_comment_id) {
      const { data } = await supabase
        .from('resource_comments')
        .select('id, user_id, depth')
        .eq('id', parent_comment_id)
        .eq('resource_id', resource_id)
        .eq('is_approved', true)
        .single();

      if (!data) {
        return NextResponse.json({ error: '親コメントが見つかりません' }, { status: 404 });
      }

      // ネストレベル制限（最大3階層）
      if (data.depth >= 2) {
        return NextResponse.json(
          { error: 'コメントの階層が深すぎます' },
          { status: 400 }
        );
      }

      parentComment = data;
    }

    const now = new Date().toISOString();
    const depth = parentComment ? parentComment.depth + 1 : 0;

    // コメント作成
    const { data: newComment, error } = await supabase
      .from('resource_comments')
      .insert({
        user_id: user.id,
        resource_id,
        parent_comment_id: parent_comment_id || null,
        comment_text: comment_text.trim(),
        depth,
        is_approved: true, // 自動承認（後でモデレーション機能追加可能）
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
        )
      `)
      .single();

    if (error) throw error;

    // ギバーポイント付与（コメント投稿）
    await awardCommentPoints(user.id, resource_id, parent_comment_id ? 'reply' : 'comment');

    // 返信の場合、親コメント投稿者に通知ポイント
    if (parent_comment_id && parentComment && parentComment.user_id !== user.id) {
      await awardReplyNotificationPoints(parentComment.user_id, newComment.id);
    }

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
async function awardCommentPoints(userId: string, resourceId: string, type: 'comment' | 'reply') {
  try {
    const activityType = type === 'reply' ? 'answer_question' : 'create_content';
    const description = type === 'reply' ? 'コメント返信投稿' : 'コメント投稿';

    await fetch('/api/points/giver-rewards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        activityType,
        referenceId: resourceId,
        referenceType: 'learning_resource',
        description
      })
    });
  } catch (error) {
    console.error('Award comment points error:', error);
  }
}

// ヘルパー関数：返信通知ポイント付与
async function awardReplyNotificationPoints(parentUserId: string, commentId: string) {
  try {
    await fetch('/api/points/giver-rewards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        activityType: 'comment_helpful',
        userId: parentUserId,
        referenceId: commentId,
        referenceType: 'comment',
        description: 'あなたのコメントに返信がありました'
      })
    });
  } catch (error) {
    console.error('Award reply notification points error:', error);
  }
} 