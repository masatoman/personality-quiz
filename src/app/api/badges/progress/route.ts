import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// バッジ進捗取得 (GET /api/badges/progress)
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // ユーザーのバッジ進捗を取得（仮想データ）
    const badges = [
      {
        id: 'beginner-learner',
        name: '学習者',
        description: '最初の学習を完了',
        icon: '🎓',
        progress: 80,
        acquired: false,
        requirements: [
          { type: 'complete_resource', count: 5, current: 4 }
        ]
      },
      {
        id: 'helpful-giver',
        name: 'ヘルプフル',
        description: '他の人に教える',
        icon: '🤝',
        progress: 60,
        acquired: false,
        requirements: [
          { type: 'provide_feedback', count: 10, current: 6 }
        ]
      },
      {
        id: 'first-step',
        name: 'ファーストステップ',
        description: 'アカウント作成',
        icon: '👋',
        progress: 100,
        acquired: true,
        acquired_at: new Date().toISOString()
      }
    ];

    return NextResponse.json({
      badges,
      total_badges: badges.length,
      acquired_badges: badges.filter(b => b.acquired).length
    });

  } catch (error) {
    console.error('Badge progress fetch error:', error);
    return NextResponse.json(
      { error: 'バッジ進捗の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 