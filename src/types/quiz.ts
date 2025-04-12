import React from 'react';

export type LearningType = 'giver' | 'taker' | 'matcher';

// 質問の回答詳細を表す型
export type QuestionDetail = {
  questionId: number;
  answer: number;
  timeSpent: number;
};

export type QuizResults = {
  giver: number;
  taker: number;
  matcher: number;
  dominantType: LearningType;
  percentage: {
    giver: number;
    taker: number;
    matcher: number;
  };
  // 詳細データ（オプショナル）
  details?: QuestionDetail[];
};

export type Tool = {
  name: string;
  description: string;
};

export type Scenario = {
  scenario: string;
  approach: string;
  effectiveness_rate: number;
};

export type LearningAdvice = {
  tips: string[];
  tools: Tool[];
};

// パーソナリティタイプ
export type PersonalityType = 'giver' | 'taker' | 'matcher';

// パーソナリティタイプの説明
export interface PersonalityDescription {
  title: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  learningAdvice: {
    title: string;
    tips: string[];
    tools: string[];
  };
}

export type TypeStats = {
  count: number;
  percentage: number;
};

export type TypeTotals = {
  giver: number;
  matcher: number;
  taker: number;
};

export type Stats = {
  giver: TypeStats;
  matcher: TypeStats;
  taker: TypeStats;
  total: number;
};

export type PersonalityTypeInfo = {
  title: string;
  short_title: string;
  color: string;
  icon: React.ReactNode;
  description: string;
  extended_description: string;
  strengths: string[];
  weaknesses: string[];
  learning_advice: LearningAdvice;
  scenarios: Scenario[];
};

export type TypeCombination = {
  title: string;
  description: string;
  tips: string[];
};

export type ResultsData = {
  personality_types: Record<LearningType, PersonalityTypeInfo>;
  type_combinations: {
    giver_taker: TypeCombination;
    giver_matcher: TypeCombination;
    taker_matcher: TypeCombination;
  };
};

// タブの種類
export type TabType = 'strengths' | 'weaknesses' | 'advice' | 'tools' | 'scenarios';

// スコア変更オブジェクト
export interface ScoreChange {
  giver: number;
  taker: number;
  matcher: number;
}

// 活動タイプ
export type ActivityType = 
  | 'CREATE_CONTENT'
  | 'PROVIDE_FEEDBACK'
  | 'CONSUME_CONTENT'
  | 'RECEIVE_FEEDBACK'
  | 'SHARE_RESOURCE'
  | 'ASK_QUESTION';

// 教材タイプ
export type MaterialType = 
  | 'ARTICLE'
  | 'VIDEO'
  | 'QUIZ'
  | 'FLASHCARD'
  | 'EXERCISE'
  | 'EBOOK'
  | 'AUDIO'
  | 'OTHER';

// クイズの質問
export interface QuizQuestion {
  id: number;
  text: string;
  options: QuizOption[];
  category?: string;
  description?: string;
}

// クイズの選択肢
export interface QuizOption {
  text: string;
  score: {
    giver: number;
    taker: number;
    matcher: number;
  };
  description?: string;
}

// クイズの結果
export interface QuizResult {
  personalityType: PersonalityType;
  giverScore: number;
  takerScore: number;
  matcherScore: number;
  description: string;
  recommendations: string[];
}

// ポイント履歴項目
export interface PointHistoryItem {
  id: string;
  userId: string;
  points: number;
  actionType: string;
  referenceId?: string;
  referenceType?: string;
  description?: string;
  createdAt: Date;
}

// ギバースコア履歴項目
export interface GiverScoreHistoryItem {
  date: string;
  score: number;
  userId: string;
}