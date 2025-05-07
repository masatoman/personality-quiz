import React from 'react';

export type LearningType = 'giver' | 'taker' | 'matcher';

// 質問の回答詳細を表す型
export type QuestionDetail = {
  questionId: number;
  answer: number;
  timeSpent: number;
};

export interface QuizResults {
  giver: number;
  taker: number;
  matcher: number;
  dominantType: LearningType;
  percentage: {
    giver: number;
    taker: number;
    matcher: number;
  };
  timestamp?: Date;
  // 詳細データ（オプショナル）
  details?: QuestionDetail[];
}

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

export interface ResultsData {
  personality_types: Record<LearningType, PersonalityTypeInfo>;
  type_combinations: {
    giver_taker: TypeCombination;
    giver_matcher: TypeCombination;
    taker_matcher: TypeCombination;
  };
  [key: string]: {
    title: string;
    description: string;
    strengths: string[];
    weaknesses: string[];
    tips: string[];
  } | Record<LearningType, PersonalityTypeInfo> | {
    giver_taker: TypeCombination;
    giver_matcher: TypeCombination;
    taker_matcher: TypeCombination;
  };
}

// タブの種類
export type TabType = 'overview' | 'strengths' | 'weaknesses' | 'tips';

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

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

// コンポーネントのProps型定義
export interface ResultsHeaderProps {
  type: LearningType;
  secondaryType: LearningType;
  scores: {
    giver: number;
    taker: number;
    matcher: number;
  };
  resultsData: ResultsData;
}

export interface ResultsTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export interface ResultsTabContentProps {
  activeTab: TabType;
  learningType: {
    primary: LearningType;
    secondary: LearningType;
    scores: {
      giver: number;
      taker: number;
      matcher: number;
    };
  };
  quizResults: QuizResults;
  resultsData: ResultsData;
}

export interface ResultsChartProps {
  scores: {
    giver: number;
    taker: number;
    matcher: number;
  };
}

export interface NextStepsProps {
  learningType: {
    primary: LearningType;
    secondary: LearningType;
    scores: {
      giver: number;
      taker: number;
      matcher: number;
    };
  };
  resultsData: ResultsData;
}

export interface ResultsFooterProps {
  user: AuthUser | null;
  isSaved: boolean;
  onSave: () => Promise<void>;
}

export interface LoginPromptProps {
  onLogin: () => void;
}

export interface SaveNotificationProps {
  success: boolean;
  error: string | null;
}

export interface UserProgress {
  userId: number;
  level: number;
  totalScore: number;
  badges: import('./badges').Badge[];
  streakDays: number;
  lastActivityDate: Date;
}

export interface Level {
  number: number;
  title: string;
  requiredScore: number;
  benefits: string[];
}