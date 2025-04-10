import { NextRequest, NextResponse } from 'next/server';
import { logActivity } from '@/lib/activities';
import { v4 as uuidv4 } from 'uuid';
import { ActivityType } from '@/types/activity';

// このAPIルートはNode.jsランタイムで実行されることを明示的に指定
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { userId, activityType, referenceId } = await request.json();
    
    // バリデーション
    if (!userId || !activityType) {
      return NextResponse.json(
        { error: 'ユーザーIDとアクティビティタイプは必須です' },
        { status: 400 }
      );
    }
    
    // アクティビティタイプの検証
    const validActivityTypes: ActivityType[] = [
      'CREATE_CONTENT', 
      'PROVIDE_FEEDBACK', 
      'CONSUME_CONTENT', 
      'SHARE_RESOURCE', 
      'ASK_QUESTION', 
      'COMPLETE_QUIZ'
    ];
    
    if (!validActivityTypes.includes(activityType as ActivityType)) {
      return NextResponse.json(
        { error: '無効なアクティビティタイプです' },
        { status: 400 }
      );
    }
    
    // アクティビティログの記録
    const success = await logActivity(
      userId, 
      activityType as ActivityType, 
      referenceId
    );
    
    if (success) {
      return NextResponse.json({ 
        success: true,
        message: 'アクティビティが記録されました',
      });
    } else {
      return NextResponse.json(
        { error: 'アクティビティの記録に失敗しました' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('アクティビティログの記録中にエラーが発生しました:', error);
    return NextResponse.json(
      { error: 'アクティビティログの記録中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 