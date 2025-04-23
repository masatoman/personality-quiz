import { NextResponse } from 'next/server';
import { hashPassword, validateEmail, validatePassword, generateToken, setAuthCookie } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    // バリデーション
    if (!email || !password || !name) {
      return NextResponse.json(
        { message: '必須項目が入力されていません' },
        { status: 400 }
      );
    }

    if (!await validateEmail(email)) {
      return NextResponse.json(
        { message: '無効なメールアドレスです' },
        { status: 400 }
      );
    }

    if (!validatePassword(password)) {
      return NextResponse.json(
        { message: 'パスワードは8文字以上で、大文字、小文字、数字を含む必要があります' },
        { status: 400 }
      );
    }

    // ユーザーの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'このメールアドレスは既に登録されています' },
        { status: 400 }
      );
    }

    // パスワードのハッシュ化
    const hashedPassword = await hashPassword(password);

    // ユーザーの作成
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'user'
      }
    });

    // JWTトークンの生成とCookieの設定
    const token = generateToken(user);
    setAuthCookie(token);

    // レスポンスからパスワードを除外
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'ユーザー登録に失敗しました' },
      { status: 500 }
    );
  }
} 