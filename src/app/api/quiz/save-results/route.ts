import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { QuizResults } from '@/types/quiz';
import fs from 'fs';
import path from 'path';

// このAPIルートはNode.jsランタイムで実行されることを明示的に指定
export const runtime = 'nodejs';
// auto（デフォルト）に設定してNext.jsに判断を委ねる
export const dynamic = 'auto';

// ローカルファイルへのフォールバック保存関数
const saveToLocalFile = async (data: QuizResults & { userId?: string }) => {
  try {
    const DB_DIR = path.join(process.cwd(), 'data');
    const RESULTS_FILE = path.join(DB_DIR, 'results.json');
    
    // ディレクトリの存在確認と作成
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    
    // 既存のデータを読み込む
    let existingData = [];
    try {
      if (fs.existsSync(RESULTS_FILE)) {
        const fileContent = fs.readFileSync(RESULTS_FILE, 'utf8');
        existingData = JSON.parse(fileContent);
      }
    } catch (readError) {
      console.error('ローカルファイル読み込みエラー:', readError);
    }
    
    // 新しいデータを追加
    const userId = data.userId || uuidv4();
    const timestamp = new Date().toISOString();
    existingData.push({
      ...data,
      userId,
      timestamp
    });
    
    // ファイルに保存
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(existingData, null, 2), 'utf8');
    
    return { userId, success: true };
  } catch (error) {
    console.error('ローカルファイル保存エラー:', error);
    return { success: false };
  }
};

export async function POST(request: NextRequest) {
  try {
    const data = await request.json() as QuizResults & { isQuickMode?: boolean };
    
    if (!data || !data.dominantType || typeof data.giver !== 'number' || 
        typeof data.taker !== 'number' || typeof data.matcher !== 'number') {
      return NextResponse.json(
        { error: '無効なデータ形式です' },
        { status: 400 }
      );
    }
    
    // ユーザーIDを生成（実際のアプリではログイン済みユーザーのIDを使用する）
    const userId = uuidv4();
    let dbSaveSuccess = false;
    let errorMessage: string | null = null;
    
    try {
      // データベースに結果を保存
      await query(
        `INSERT INTO quiz_results (user_id, dominant_type, giver_score, taker_score, matcher_score, is_quick_mode)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [userId, data.dominantType, data.giver, data.taker, data.matcher, !!data.isQuickMode]
      );
      
      dbSaveSuccess = true;
    } catch (err) {
      const error = err as Error;
      console.error('データベースエラー:', error);
      dbSaveSuccess = false;
      errorMessage = error.message || 'データベース接続エラー';
    }
    
    // データベース保存に失敗した場合はローカルファイルにフォールバック保存
    if (!dbSaveSuccess) {
      console.log('データベース保存に失敗したため、ローカルファイルに保存します');
      const localSaveResult = await saveToLocalFile({ ...data, userId });
      
      if (localSaveResult.success) {
        return NextResponse.json({ 
          success: true,
          message: 'データベース接続エラーが発生しましたが、診断結果はローカルに保存されました',
          userId,
          personalityType: data.dominantType,
          saveMethod: 'local_file',
          error: errorMessage
        });
      } else {
        return NextResponse.json({ 
          success: false,
          message: '診断結果の保存に失敗しましたが、ブラウザに結果が表示されています',
          personalityType: data.dominantType
        }, 
        { status: 500 });
      }
    }
    
    return NextResponse.json({ 
      success: true,
      message: '診断結果が保存されました',
      userId,
      personalityType: data.dominantType,
      saveMethod: 'database'
    });
  } catch (err) {
    const error = err as Error;
    console.error('診断結果の保存に失敗しました:', error);
    return NextResponse.json(
      { 
        error: '診断結果の保存に失敗しました', 
        message: error.message || '不明なエラーが発生しました' 
      },
      { status: 500 }
    );
  }
} 