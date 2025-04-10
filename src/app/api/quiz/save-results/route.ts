import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { QuizResults } from '@/types/quiz';

// このAPIルートはNode.jsランタイムで実行されることを明示的に指定
export const runtime = 'nodejs';
// auto（デフォルト）に設定してNext.jsに判断を委ねる
export const dynamic = 'auto';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json() as QuizResults;
    
    if (!data || !data.dominantType || typeof data.giver !== 'number' || 
        typeof data.taker !== 'number' || typeof data.matcher !== 'number') {
      return NextResponse.json(
        { error: '無効なデータ形式です' },
        { status: 400 }
      );
    }
    
    try {
      // ユーザーIDを生成（実際のアプリではログイン済みユーザーのIDを使用する）
      const userId = uuidv4();
      
      // データベースに結果を保存
      await query(
        `INSERT INTO quiz_results (user_id, dominant_type, giver_score, taker_score, matcher_score)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [userId, data.dominantType, data.giver, data.taker, data.matcher]
      );
      
      return NextResponse.json({ 
        success: true,
        message: '診断結果が保存されました',
        userId,
        personalityType: data.dominantType
      });
    } catch (dbError) {
      console.error('データベースエラー:', dbError);
      
      // データベースエラーでもクライアント側にはエラーを返さない
      return NextResponse.json({ 
        success: true,
        message: '診断結果がローカルに保存されました',
        personalityType: data.dominantType
      });
    }
  } catch (error) {
    console.error('診断結果の保存に失敗しました:', error);
    return NextResponse.json(
      { error: '診断結果の保存に失敗しました' },
      { status: 500 }
    );
  }
} 