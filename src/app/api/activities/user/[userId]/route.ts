import { NextRequest, NextResponse } from 'next/server';
import { getUserActivities, getGiverScore } from '@/lib/activities';

// このAPIルートはNode.jsランタイムで実行されることを明示的に指定
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDは必須です' },
        { status: 400 }
      );
    }
    
    // クエリパラメータからlimitを取得
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    
    // ユーザーのアクティビティ履歴を取得
    const activities = await getUserActivities(userId, limit);
    
    // ユーザーのギバースコアを取得
    const giverScore = await getGiverScore(userId);
    
    return NextResponse.json({
      success: true,
      data: {
        activities,
        giverScore,
        count: activities.length
      }
    });
  } catch (error) {
    console.error('アクティビティ履歴の取得中にエラーが発生しました:', error);
    return NextResponse.json(
      { error: 'アクティビティ履歴の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 