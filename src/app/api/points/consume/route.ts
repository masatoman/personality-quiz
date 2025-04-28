import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/services/supabaseClient';
import { getSession } from '@/lib/session';

/**
 * ポイントを消費するAPI
 * 
 * @param req リクエスト
 * @returns レスポンス
 */
export async function POST(req: NextRequest) {
  try {
    // セッションからユーザーIDを取得
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const userId = session.user.id;
    
    // リクエストボディからデータ取得
    const body = await req.json();
    const { 
      points, 
      actionType, 
      referenceId, 
      referenceType, 
      description 
    } = body;
    
    // バリデーション
    if (!points || !actionType) {
      return NextResponse.json(
        { error: 'points と actionType は必須です' }, 
        { status: 400 }
      );
    }
    
    if (typeof points !== 'number' || points <= 0) {
      return NextResponse.json(
        { error: 'points は正の数値である必要があります' }, 
        { status: 400 }
      );
    }
    
    // トランザクションを開始
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('points')
      .eq('id', userId)
      .single();
      
    if (userError) {
      console.error('ユーザーデータ取得エラー:', userError);
      return NextResponse.json(
        { error: 'ユーザーデータの取得に失敗しました' }, 
        { status: 500 }
      );
    }
    
    // ポイント不足チェック
    if ((userData?.points || 0) < points) {
      return NextResponse.json(
        { 
          error: 'ポイントが不足しています', 
          currentPoints: userData?.points || 0,
          requiredPoints: points
        }, 
        { status: 400 }
      );
    }
    
    // ポイントを消費
    const { error: updateError } = await supabase.rpc(
      'consume_user_points',
      { 
        user_id: userId,
        points_to_consume: points,
        action_type: actionType,
        reference_id: referenceId || null,
        reference_type: referenceType || null,
        description: description || null
      }
    );
    
    if (updateError) {
      console.error('ポイント消費エラー:', updateError);
      return NextResponse.json(
        { error: 'ポイントの消費に失敗しました' }, 
        { status: 500 }
      );
    }
    
    // 更新後のポイントを取得
    const { data: updatedUser, error: getError } = await supabase
      .from('users')
      .select('points')
      .eq('id', userId)
      .single();
      
    if (getError) {
      console.error('更新後ユーザーデータ取得エラー:', getError);
      return NextResponse.json(
        { error: '更新後のユーザーデータ取得に失敗しました' }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      consumedPoints: points,
      remainingPoints: updatedUser?.points || 0
    });
  } catch (error) {
    console.error('ポイント消費API例外:', error);
    return NextResponse.json(
      { error: '予期せぬエラーが発生しました' }, 
      { status: 500 }
    );
  }
} 