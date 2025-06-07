import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// このAPIルートは開発環境でのみ使用可能にします
export async function GET() {
  // 本番環境では使用不可
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'このエンドポイントは開発環境でのみ使用できます' },
      { status: 403 }
    );
  }

  try {
    // Supabaseクライアントの初期化（サービスロールキーで）
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        message: 'SUPABASE_SERVICE_ROLE_KEYが設定されていません',
        results: []
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // テストユーザーのデータ
    const testUsers = [
      {
        email: 'giver@example.com',
        password: 'password123',
        user_metadata: {
          name: 'ギバー太郎',
          personality_type: 'giver',
          giver_score: 80
        }
      },
      {
        email: 'matcher@example.com',
        password: 'password123',
        user_metadata: {
          name: 'マッチャー花子',
          personality_type: 'matcher',
          giver_score: 50
        }
      },
      {
        email: 'taker@example.com',
        password: 'password123',
        user_metadata: {
          name: 'テイカー次郎',
          personality_type: 'taker',
          giver_score: 20
        }
      },
      {
        email: 'admin@example.com',
        password: 'password123',
        user_metadata: {
          name: '管理者',
          role: 'admin',
          giver_score: 100
        }
      }
    ];

    const results = [];

    // 各ユーザーを登録
    for (const userData of testUsers) {
      try {
        // 管理者権限でユーザーを作成
        const { data, error } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true, // メール確認をスキップ
          user_metadata: userData.user_metadata
        });

        if (error) {
          // すでに存在する場合
          if (error.message.includes('already') || error.message.includes('duplicate')) {
            results.push({
              email: userData.email,
              status: 'exists',
              message: 'ユーザーはすでに存在します'
            });
            continue;
          }
          throw error;
        }

        // プロフィールテーブルにも追加
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              username: userData.user_metadata.name.replace(/\s+/g, '_').toLowerCase(),
              display_name: userData.user_metadata.name,
              bio: `${userData.user_metadata.personality_type}タイプのテストユーザーです`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (profileError) {
            console.error('プロフィール作成エラー:', profileError);
          }
        }

        results.push({
          email: userData.email,
          status: 'created',
          id: data.user?.id,
          message: 'ユーザーを作成しました'
        });
      } catch (err: any) {
        results.push({
          email: userData.email,
          status: 'error',
          message: err.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'テストユーザー登録処理を実行しました',
      results
    });
  } catch (error: any) {
    console.error('テストユーザー登録エラー:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 