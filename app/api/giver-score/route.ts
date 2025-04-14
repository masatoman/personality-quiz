import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { calculateGiverScore } from '@/lib/score';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const userId = cookies().get('userId')?.value;
    if (!userId) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const userData = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        activities: true,
        giverDiagnosis: true
      }
    });

    if (!userData) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    const score = calculateGiverScore(userData);

    return NextResponse.json({
      score,
      activities: userData.activities,
      diagnosis: userData.giverDiagnosis
    });
  } catch (error) {
    console.error('ギバースコア取得エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
} 