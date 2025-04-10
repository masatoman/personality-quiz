import { NextResponse } from 'next/server';
import { getStats } from '@/lib/db';
import { Stats } from '@/types/quiz';

// モックデータ
const getMockSetupData = (stats: Stats) => ({
  setup: {
    message: 'データベースのセットアップが完了しました（モックデータを使用）',
    success: true
  },
  stats,
  message: 'アプリケーションのセットアップが完了しました（モックデータを使用）',
  success: true
});

export async function GET() {
  try {
    // ベースパスを含むURL
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://yourdomain.com/quiz' 
      : 'http://localhost:3000/quiz';
    
    try {
      // データベースのセットアップAPIを呼び出す
      const setupResponse = await fetch(`${baseUrl}/api/setup-db/`, {
        method: 'GET',
      });
      
      if (!setupResponse.ok) {
        throw new Error('データベースのセットアップに失敗しました');
      }
      
      const setupData = await setupResponse.json();
      
      // 統計情報の取得を試みる
      const statsResponse = await fetch(`${baseUrl}/api/stats/`, {
        method: 'GET',
      });
      
      if (!statsResponse.ok) {
        throw new Error('統計情報の取得に失敗しました');
      }
      
      const statsData = await statsResponse.json();
      
      return NextResponse.json({
        setup: setupData,
        stats: statsData,
        message: 'アプリケーションのセットアップが完了しました',
        success: true
      });
    } catch (fetchError) {
      console.error('APIフェッチエラー:', fetchError);
      console.log('モックデータを使用します');
      
      // 統計情報を取得
      const stats = getStats();
      
      // モックデータを返す
      return NextResponse.json(getMockSetupData(stats));
    }
  } catch (error) {
    console.error('セットアップエラー:', error);
    return NextResponse.json(
      { error: 'アプリケーションのセットアップに失敗しました', success: false },
      { status: 500 }
    );
  }
} 