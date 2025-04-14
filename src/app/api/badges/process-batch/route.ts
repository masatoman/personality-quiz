import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@/utils/supabase/server';
import { auth } from '@/lib/auth';
import { BadgeType } from '@/types/badges';
import { BADGE_DEFINITIONS } from '@/data/badges';
import { BadgeEvaluator } from '@/utils/badgeEvaluator';

interface User {
  id: string;
  last_badge_check: string | null;
}

const BATCH_SIZE = 50; // 一度に処理するユーザー数
const PROCESSING_DELAY = 100; // バッチ間の遅延（ミリ秒）
const CACHE_TTL = 5 * 60 * 1000; // キャッシュの有効期限（5分）

// メモリ内キャッシュ
const processedUsersCache = new Map<string, { timestamp: number }>();

/**
 * ユーザーのバッジを評価し、新しく獲得したバッジを返す
 */
async function processUserBadges(
  supabase: SupabaseClient,
  userId: string
): Promise<BadgeType[]> {
  const evaluator = new BadgeEvaluator(supabase);
  const newBadges: BadgeType[] = [];

  // ユーザーの既存バッジを取得
  const { data: existingBadges } = await supabase
    .from('user_badges')
    .select('badge_type')
    .eq('user_id', userId);

  const existingBadgeTypes = new Set(existingBadges?.map(b => b.badge_type) || []);

  // 各バッジ定義に対して評価を実行
  for (const [badgeType, definition] of Object.entries(BADGE_DEFINITIONS)) {
    if (!existingBadgeTypes.has(badgeType)) {
      const isEarned = await evaluator.evaluateBadge(userId, badgeType as BadgeType);
      if (isEarned) {
        // 新しいバッジを保存
        await supabase
          .from('user_badges')
          .insert({
            user_id: userId,
            badge_type: badgeType,
            earned_at: new Date().toISOString()
          });
        newBadges.push(badgeType as BadgeType);
      }
    }
  }

  return newBadges;
}

/**
 * バッジ評価のバッチ処理API
 * このAPIは管理者専用であり、スケジューラーから呼び出されることを想定しています
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 認証チェック - 管理者のみが実行可能
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: '権限がありません。この操作は管理者のみ実行できます。' },
        { status: 403 }
      );
    }

    // リクエストからパラメータを取得
    const { batchSize = BATCH_SIZE, processAll = false } = await request.json();

    // Supabaseクライアントを作成
    const supabase = createClient();
    
    // 処理対象のユーザーを取得
    let query = supabase
      .from('users')
      .select('id, last_badge_check')
      .is('is_active', true)
      .order('last_badge_check', { ascending: true });
    
    if (!processAll) {
      query = query.limit(batchSize);
    }
    
    const { data: users, error: usersError } = await query;

    if (usersError) {
      console.error('ユーザー取得エラー:', usersError);
      return NextResponse.json(
        { error: 'ユーザー情報の取得中にエラーが発生しました' },
        { status: 500 }
      );
    }

    // 処理結果を保存する配列
    const results: { userId: string; newBadges: BadgeType[] }[] = [];
    const errors: { userId: string; error: string }[] = [];

    // ユーザーをバッチで処理
    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const userBatch = users.slice(i, i + BATCH_SIZE);
      
      // 各ユーザーのバッジを並行して評価
      const batchPromises = userBatch.map(async (user) => {
        try {
          // キャッシュをチェック
          const cached = processedUsersCache.get(user.id);
          if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return;
          }

          const newBadges = await processUserBadges(supabase, user.id);
          
          // 最終チェック日時を更新
          await supabase
            .from('users')
            .update({ last_badge_check: new Date().toISOString() })
            .eq('id', user.id);
          
          // キャッシュを更新
          processedUsersCache.set(user.id, { timestamp: Date.now() });
          
          if (newBadges.length > 0) {
            results.push({
              userId: user.id,
              newBadges
            });
          }
        } catch (error) {
          console.error(`ユーザー ${user.id} のバッジ処理エラー:`, error);
          errors.push({
            userId: user.id,
            error: error instanceof Error ? error.message : '不明なエラー'
          });
        }
      });
      
      // バッチ内のすべての処理を待機
      await Promise.all(batchPromises);
      
      // バッチ間で遅延を入れる
      if (i + BATCH_SIZE < users.length) {
        await new Promise(resolve => setTimeout(resolve, PROCESSING_DELAY));
      }
    }

    // 実行時間を計算
    const executionTime = Date.now() - startTime;

    // パフォーマンスメトリクスをログ
    console.log('バッジバッチ処理パフォーマンス:', {
      totalUsers: users.length,
      processedBatches: Math.ceil(users.length / BATCH_SIZE),
      successfulUpdates: results.length,
      errors: errors.length,
      executionTimeMs: executionTime,
      timestamp: new Date().toISOString()
    });

    // レスポンスを返す
    return NextResponse.json({
      success: true,
      processedUsers: users.length,
      newBadgesAwarded: results.length,
      errors: errors.length,
      executionTime,
      details: results,
      errorDetails: errors
    });

  } catch (error) {
    console.error('バッジバッチ処理中の予期せぬエラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
} 