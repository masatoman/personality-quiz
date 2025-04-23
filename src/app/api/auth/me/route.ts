import { NextResponse } from 'next/server';
import { getAuthCookie, verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const token = getAuthCookie();

    if (!token) {
      return NextResponse.json(
        { message: '認証されていません' },
        { status: 401 }
      );
    }

    // トークンの検証
    const decoded = verifyToken(token);

    // ユーザー情報の取得
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    // レスポンスからパスワードを除外
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { message: '認証に失敗しました' },
      { status: 401 }
    );
  }
} 