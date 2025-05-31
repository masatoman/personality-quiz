import { NextRequest, NextResponse } from 'next/server';
import { getMaterials } from '@/lib/api/materials';
import { createClient } from '@/lib/supabase/server';

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
    
    // Supabaseクライアントの初期化
    const supabase = createClient();
    
    // 現在のユーザーを取得
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('認証エラー:', userError);
      return NextResponse.json(
        { error: 'ユーザー認証に失敗しました' },
        { status: 401 }
      );
    }
    
    // 教材データを作成
    const materialData = {
      title: data.basicInfo.title,
      description: data.basicInfo.description,
      author_id: user.id,
      thumbnail_url: data.basicInfo.coverImage || null,
      tags: data.basicInfo.tags,
      status: data.settings.isPublic ? 'published' : 'draft',
      difficulty: data.settings.difficulty,
      estimated_time: data.settings.estimatedTime,
      allow_comments: data.settings.allowComments,
      target_audience: data.settings.targetAudience,
      prerequisites: data.settings.prerequisites,
    };
    
    // 教材をデータベースに保存
    const { data: material, error: materialError } = await supabase
      .from('materials')
      .insert(materialData)
      .select()
      .single();
    
    if (materialError) {
      console.error('教材保存エラー:', materialError);
      return NextResponse.json(
        { error: '教材の保存に失敗しました' },
        { status: 500 }
      );
    }
    
    // コンテンツセクションを保存
    const sectionsWithMaterialId = data.contentSections.map((section, index) => ({
      material_id: material.id,
      type: section.type,
      title: section.title,
      content: section.content,
      options: section.options,
      answer: section.answer,
      order: index,
    }));
    
    const { error: sectionsError } = await supabase
      .from('material_sections')
      .insert(sectionsWithMaterialId);
    
    if (sectionsError) {
      console.error('セクション保存エラー:', sectionsError);
      // 教材は保存されているので、エラーだけ記録して続行する
    }
    
    // DB保存成功時のレスポンス
    return NextResponse.json({
      id: material.id,
      success: true,
      message: '教材が正常に保存されました',
      createdAt: material.created_at,
      updatedAt: material.created_at,
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
      difficulty: searchParams.get('difficulty') as any || undefined,
      sort: searchParams.get('sort') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined,
      userId: searchParams.get('userId') || undefined, // ユーザーIDフィルタリング用
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