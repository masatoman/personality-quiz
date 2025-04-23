import { NextResponse } from 'next/server';
import { removeAuthCookie } from '@/lib/auth';

export async function POST() {
  try {
    removeAuthCookie();
    return NextResponse.json({ message: 'ログアウトしました' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'ログアウトに失敗しました' },
      { status: 500 }
    );
  }
} 