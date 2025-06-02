import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Dynamic Server Usage エラーを解決するため動的レンダリングを強制
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// カテゴリ一覧取得 (GET /api/categories)
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // 基本的なカテゴリ一覧を取得
    const { data: categories, error } = await supabase
      .from('resource_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      categories: categories || []
    });

  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json(
      { error: 'カテゴリの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 