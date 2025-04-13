import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (!data.type) {
      return NextResponse.json(
        { error: 'タイプが指定されていません。' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    
    const { data: result, error } = await supabase
      .from('results')
      .insert([{ type: data.type }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: '結果が保存されました。',
      id: result.id,
      type: result.type
    });
  } catch (error) {
    console.error('保存エラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: '保存エラー',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    );
  }
} 