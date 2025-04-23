import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { key } = await request.json();

    if (!key) {
      return NextResponse.json({
        success: false,
        error: 'キーが指定されていません'
      }, { status: 400 });
    }

    // テストデータをSupabaseに保存
    const { data, error } = await supabase
      .from('test_persistence')
      .upsert({ 
        key,
        value: key,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('テストデータ保存エラー:', error);
      return NextResponse.json({
        success: false,
        error: 'データの保存に失敗しました'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        value: data.value
      }
    });
  } catch (error) {
    console.error('テストAPI例外:', error);
    return NextResponse.json({
      success: false,
      error: '予期せぬエラーが発生しました'
    }, { status: 500 });
  }
} 