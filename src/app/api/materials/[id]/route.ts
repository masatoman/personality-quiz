import { NextResponse } from 'next/server';
import { getMaterial } from '@/lib/api/materials';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const material = await getMaterial(params.id);
    
    if (!material) {
      return NextResponse.json(
        { error: '教材が見つかりませんでした' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(material);
  } catch (error) {
    console.error('教材取得エラー:', error);
    return NextResponse.json(
      { error: '教材データの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 