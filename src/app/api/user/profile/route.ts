import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Dynamic Server Usage エラーを解決するため動的レンダリングを強制
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ユーザープロフィール取得 (GET /api/user/profile)
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // プロファイル情報を取得
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      throw profileError;
    }

    // プロフィールが存在しない場合は作成
    if (!profileData) {
      const defaultProfile = {
        user_id: user.id,
        display_name: user.email?.split('@')[0] || 'ゲスト',
        avatar_url: null,
        bio: null,
      };

      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert(defaultProfile)
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      return NextResponse.json({
        profile: {
          ...newProfile,
          email: user.email,
          user_id: user.id
        }
      });
    }

    // 既存プロフィールを返す
    return NextResponse.json({
      profile: {
        ...profileData,
        email: user.email,
        user_id: user.id
      }
    });

  } catch (error) {
    console.error('User profile fetch error:', error);
    return NextResponse.json(
      { error: 'プロフィールの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// ユーザープロフィール更新 (PUT /api/user/profile)
export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const { display_name, bio, avatar_url } = body;

    // プロフィール更新
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        display_name: display_name || user.email?.split('@')[0] || 'ゲスト',
        bio: bio || null,
        avatar_url: avatar_url || null,
      })
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      profile: {
        ...updatedProfile,
        email: user.email,
        user_id: user.id
      }
    });

  } catch (error) {
    console.error('User profile update error:', error);
    return NextResponse.json(
      { error: 'プロフィールの更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 