import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// 開発環境でのみRLSポリシーを修正するAPI
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'このエンドポイントは開発環境でのみ使用できます' },
      { status: 403 }
    );
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // SQLコマンドを実行してRLSポリシーを追加
    const rlsQueries = [
      `CREATE POLICY IF NOT EXISTS "テストユーザープロフィール作成許可" ON public.profiles
       FOR INSERT WITH CHECK (true);`,
      
      `DROP POLICY IF EXISTS "ギバースコアは本人のみ作成可能" ON public.giver_scores;`,
      
      `CREATE POLICY IF NOT EXISTS "ギバースコア作成許可" ON public.giver_scores
       FOR INSERT WITH CHECK (true);`
    ];

    const results = [];

    for (const query of rlsQueries) {
      try {
        const { data, error } = await supabase.rpc('execute_sql', { sql_query: query });
        
        if (error) {
          console.error('SQL実行エラー:', error);
          results.push({
            query: query.substring(0, 50) + '...',
            status: 'error',
            error: error.message
          });
        } else {
          results.push({
            query: query.substring(0, 50) + '...',
            status: 'success'
          });
        }
      } catch (err: any) {
        results.push({
          query: query.substring(0, 50) + '...',
          status: 'error',
          error: err.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'RLSポリシー修正処理を実行しました',
      results
    });

  } catch (error: any) {
    console.error('RLSポリシー修正エラー:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
} 