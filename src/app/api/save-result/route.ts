import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { saveResult } from '@/lib/db';
import { PersonalityType } from '@/types/quiz';

// このAPIルートはNode.jsランタイムで実行されることを明示的に指定
export const runtime = 'nodejs';
// auto（デフォルト）に設定してNext.jsに判断を委ねる
export const dynamic = 'auto';

export async function POST(request: NextRequest) {
  try {
    const { personalityType, scores } = await request.json();
    
    if (!personalityType || !scores || !Array.isArray(scores) || scores.length !== 3) {
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
        `INSERT INTO results (user_id, personality_type, a_score, b_score, c_score)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [userId, personalityType, scores[0], scores[1], scores[2]]
      );
      
      return NextResponse.json({ 
        success: true,
        message: '診断結果が保存されました',
        userId,
        personalityType
      });
    } catch (dbError) {
      console.error('データベースエラー:', dbError);
      console.log('ローカルストレージに保存します');
      
      // データベースエラーの場合はローカルストレージに保存
      const success = saveResult(personalityType as PersonalityType);
      
      if (!success) {
        throw new Error('ローカルストレージへの保存に失敗しました');
      }
      
      return NextResponse.json({ 
        success: true,
        message: '診断結果がローカルに保存されました',
        personalityType
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