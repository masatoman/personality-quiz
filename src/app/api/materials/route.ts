import { NextRequest, NextResponse } from 'next/server';
import { getMaterials } from '@/lib/api/materials';

// 基本情報の型定義
interface BasicInfo {
  title: string;
  description: string;
  tags: string[];
  coverImage?: string;
}

// コンテンツセクションの型定義
interface ContentSection {
  id: string;
  type: 'text' | 'image' | 'video' | 'quiz';
  title: string;
  content: string;
  options?: string[];
  answer?: number;
}

// 設定情報の型定義
interface SettingsData {
  isPublic: boolean;
  allowComments: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  targetAudience: string[];
  prerequisites: string;
}

interface MaterialData {
  basicInfo: BasicInfo;
  contentSections: ContentSection[];
  settings: SettingsData;
}

export async function POST(request: NextRequest) {
  try {
    // リクエストボディからデータを取得
    const data: MaterialData = await request.json();
    
    // バリデーション
    if (!data.basicInfo?.title) {
      return NextResponse.json(
        { error: 'タイトルは必須です' },
        { status: 400 }
      );
    }
    
    if (!data.contentSections || data.contentSections.length === 0) {
      return NextResponse.json(
        { error: 'コンテンツが必要です' },
        { status: 400 }
      );
    }
    
    // 実際のプロジェクトでは、ここでDBに保存する処理を実装
    
    // 仮のレスポンスデータ
    const materialId = `material-${Date.now()}`;
    
    // DB保存成功時のレスポンス
    return NextResponse.json({
      id: materialId,
      success: true,
      message: '教材が正常に保存されました',
      // DB保存後にサーバー側で生成された値をクライアントに返す
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // ギバースコア変動値を仮に返す
      giverScoreChange: 10,
      earnedPoints: 50,
    });
  } catch (error) {
    console.error('教材保存エラー:', error);
    return NextResponse.json(
      { error: '教材の保存中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// 教材一覧を取得
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // クエリパラメータの取得
    const options = {
      category: searchParams.get('category') || undefined,
      difficulty: searchParams.get('difficulty') || undefined,
      sort: searchParams.get('sort') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined,
    };
    
    const materials = await getMaterials(options);
    
    return NextResponse.json(materials);
  } catch (error) {
    console.error('教材一覧取得エラー:', error);
    return NextResponse.json(
      { error: '教材一覧の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 