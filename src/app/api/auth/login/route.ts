import { NextResponse } from 'next/server';
import { verifyPassword, generateToken, setAuthCookie } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // バリデーション
    if (!email || !password) {
      return NextResponse.json(
        { message: 'メールアドレスとパスワードを入力してください' },
        { status: 400 }
      );
    }

    // ユーザーの検索
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'メールアドレスまたはパスワードが正しくありません' },
        { status: 401 }
      );
    }

    // パスワードの検証
    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { message: 'メールアドレスまたはパスワードが正しくありません' },
        { status: 401 }
      );
    }

    // JWTトークンの生成とCookieの設定
    const token = generateToken(user);
    setAuthCookie(token);

    // レスポンスからパスワードを除外
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'ログインに失敗しました' },
      { status: 500 }
    );
  }
} 