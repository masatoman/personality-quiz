import { NextResponse } from 'next/server';
import supabase from '@/services/supabaseClient';

export async function GET() {
  try {
    console.log('Supabase接続テスト開始');
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Supabase Anon Key存在:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    // Supabaseへの接続テスト - シンプルなクエリを実行
    console.log('materialsテーブルへのクエリ実行...');
    const { data, error } = await supabase
      .from('materials')
      .select('id, title, description')
      .limit(5);

    if (error) {
      console.error('Supabase接続エラー:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Supabase接続エラー', 
          error: error.message,
          details: error
        }, 
        { status: 500 }
      );
    }

    console.log('Supabase接続成功。データ:', data?.length ? `${data.length}件取得` : 'データなし');
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Supabaseに正常に接続できました',
        data,
        connectionInfo: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'URL未設定',
          anon_key_exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        }
      }, 
      { status: 200 }
    );
  } catch (err) {
    console.error('接続テスト中にエラーが発生しました:', err);
    return NextResponse.json(
      { 
        success: false, 
        message: '接続テスト中にエラーが発生しました', 
        error: err instanceof Error ? err.message : String(err)
      }, 
      { status: 500 }
    );
  }
} 