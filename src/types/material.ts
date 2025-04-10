// マテリアル関連の型定義

// セクションの基本インターフェース
export interface Section {
  id: string;
  type: 'text' | 'image' | 'quiz';
  title: string;
}

// テキストセクションの型定義
export interface TextSection extends Section {
  type: 'text';
  content: string;
}

// 画像セクションの型定義
export interface ImageSection extends Section {
  type: 'image';
  imageUrl: string;
  description?: string;
}

// クイズの質問の型定義
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

// クイズセクションの型定義
export interface QuizSection extends Section {
  type: 'quiz';
  description?: string;
  questions: QuizQuestion[];
}

// マテリアルの型定義
export interface Material {
  id: string;
  title: string;
  description: string;
  sections: Section[];
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  viewCount: number;
  rating: number | null;
}

// クイズ結果の型定義
export interface QuizResult {
  score: number;
  total: number;
  submitted: boolean;
} 