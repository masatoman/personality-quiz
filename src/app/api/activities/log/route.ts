import { NextRequest, NextResponse } from 'next/server';
import { logActivity } from '@/lib/activities';
import { ActivityType } from '@/types/activity';

// このAPIルートはNode.jsランタイムで実行されることを明示的に指定
export const runtime = 'nodejs';

// POSTリクエストのキャッシュを無効化
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    // キャッシュ制御ヘッダーを設定
    const headers = new Headers();
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
    headers.set('Surrogate-Control', 'no-store');
    
    const { userId, activityType, referenceId } = await request.json();
    
    // バリデーション
    if (!userId || !activityType) {
      return NextResponse.json(
        { error: 'ユーザーIDとアクティビティタイプは必須です' },
        { 
          status: 400,
          headers
        }
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
        { 
          status: 400,
          headers
        }
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
      }, {
        headers
      });
    } else {
      return NextResponse.json(
        { error: 'アクティビティの記録に失敗しました' },
        { 
          status: 500,
          headers
        }
      );
    }
  } catch (error) {
    console.error('アクティビティログの記録中にエラーが発生しました:', error);
    return NextResponse.json(
      { error: 'アクティビティログの記録中にエラーが発生しました' },
      { 
        status: 500,
        headers: new Headers({
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store'
        })
      }
    );
  }
} 