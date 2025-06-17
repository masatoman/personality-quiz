import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Service Role Keyを使用したSupabaseクライアント
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId, name, email } = await request.json();
    
    if (!userId || !name) {
      return NextResponse.json(
        { error: 'ユーザーIDと名前は必須です' },
        { status: 400 }
      );
    }
    
    // プロフィールが既に存在するかチェック
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('プロフィール存在チェックエラー:', checkError);
      return NextResponse.json(
        { error: 'プロフィール確認中にエラーが発生しました' },
        { status: 500 }
      );
    }
    
    if (existingProfile) {
      return NextResponse.json(
        { message: 'プロフィールは既に存在します', profile: existingProfile },
        { status: 200 }
      );
    }
    
    // プロフィールを作成
    const displayName = name || email?.split('@')[0] || 'Anonymous User';
    const username = displayName.replace(/\s+/g, '_').toLowerCase() || `user_${userId.substring(0, 8)}`;
    
    const { data: newProfile, error: insertError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        username: username,
        display_name: displayName,
        bio: null,
        avatar_url: null
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('プロフィール作成エラー:', insertError);
      return NextResponse.json(
        { error: 'プロフィール作成に失敗しました', details: insertError.message },
        { status: 500 }
      );
    }
    
    // user_pointsテーブルにも初期データを作成（存在する場合）
    try {
      const { error: pointsError } = await supabaseAdmin
        .from('user_points')
        .insert({
          user_id: userId,
          total_points: 0,
          giver_score: 0
        });
      
      if (pointsError && !pointsError.message.includes('duplicate key')) {
        console.warn('ポイント初期化エラー:', pointsError.message);
      }
    } catch (pointsErr) {
      console.warn('ポイント初期化で例外:', pointsErr);
    }
    
    return NextResponse.json(
      { message: 'プロフィール作成成功', profile: newProfile },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('API処理エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
} 