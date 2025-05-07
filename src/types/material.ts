// マテリアル関連の型定義

// 難易度の型定義
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

// 対象者の型定義
export type TargetAudience = 
  | 'student'
  | 'professional'
  | 'teacher'
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'developer';

// セクションの基本インターフェース
export interface Section {
  id: string;
  title: string;
  type: 'text' | 'image' | 'quiz';
}

// テキストセクションの型定義
export interface TextSection extends Section {
  type: 'text';
  content: string;
  format?: 'plain' | 'markdown' | 'html';
}

// 画像セクションの型定義
export interface ImageSection extends Section {
  type: 'image';
  imageUrl: string;
  altText?: string;
  description?: string;
}

// クイズの質問の型定義
export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

// クイズセクションの型定義
export interface QuizSection extends Section {
  type: 'quiz';
  questions: Question[];
}

// レビューの型定義
export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpful?: number; // 「役に立った」の数
}

// 関連教材の型定義
export interface RelatedMaterial {
  id: string;
  title: string;
  difficulty: Difficulty;
  estimatedTime: number;
  rating: number;
  reviewCount: number;
  thumbnailUrl?: string;
}

// 著者の型定義
export interface Author {
  id: string;
  name: string;
  avatarUrl: string;
  bio?: string;
  expertise?: string[];
}

// マテリアルの型定義
export interface Material {
  id: string;
  title: string;
  description: string;
  category?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  sections: Section[];
}

export interface MaterialSection {
  id: string;
  title: string;
  content: string;
}

// クイズ結果の型定義
export interface QuizResult {
  score: number;
  total: number;
  submitted: boolean;
  completedAt?: string;
  timeSpent?: number; // 所要時間（秒）
  correctAnswers?: string[]; // 正解した問題のID
} 