import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// 開発環境でのみ使用可能な既存ユーザー確認API
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'このエンドポイントは開発環境でのみ使用できます' },
      { status: 403 }
    );
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // auth.usersテーブルから既存ユーザーを確認
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Auth users取得エラー:', authError);
    }

    // profilesテーブルから既存プロフィールを確認
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(50);

    if (profilesError) {
      console.error('Profiles取得エラー:', profilesError);
    }

    // usersテーブルから既存ユーザーを確認（もしあれば）
    const { data: appUsers, error: appUsersError } = await supabase
      .from('users')
      .select('*')
      .limit(50);

    if (appUsersError) {
      console.error('App users取得エラー:', appUsersError);
    }

    return NextResponse.json({
      success: true,
      data: {
        auth_users: authUsers?.users?.map(user => ({
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          confirmed_at: user.confirmed_at,
          email_confirmed_at: user.email_confirmed_at,
          user_metadata: user.user_metadata
        })) || [],
        profiles: profiles || [],
        app_users: appUsers || [],
        errors: {
          auth_error: authError?.message,
          profiles_error: profilesError?.message,
          app_users_error: appUsersError?.message
        }
      }
    });
  } catch (error: any) {
    console.error('ユーザー確認エラー:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 