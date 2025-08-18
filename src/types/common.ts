// 共通の型定義
export type PersonalityType = 'giver' | 'taker' | 'matcher';

export interface Stats {
  total: number;
  giver: { count: number; percentage: number };
  taker: { count: number; percentage: number };
  matcher: { count: number; percentage: number };
}

export type ActivityType = 
  | 'CREATE_CONTENT'
  | 'PROVIDE_FEEDBACK'
  | 'CONSUME_CONTENT'
  | 'RECEIVE_FEEDBACK'
  | 'SHARE_RESOURCE'
  | 'ASK_QUESTION';

export type MaterialType = 
  | 'ARTICLE'
  | 'VIDEO'
  | 'QUIZ'
  | 'FLASHCARD'
  | 'EXERCISE'
  | 'EBOOK'
  | 'AUDIO'
  | 'OTHER';

export interface ScoreChange {
  giver: number;
  taker: number;
  matcher: number;
}

export interface ActivityLog {
  id: string;
  userId: string;
  activityType: ActivityType;
  timestamp: Date;
  scoreChange?: ScoreChange;
  createdAt?: Date;
  metadata?: Record<string, any>;
}

export interface Level {
  id: number;
  number: number;
  name: string;
  title: string;
  minPoints: number;
  maxPoints: number;
  requiredScore: number;
  description: string;
  icon: string;
  benefits: string[];
}

export interface UserProgress {
  userId: string;
  level: number;
  points: number;
  activities: ActivityLog[];
}

export interface PointHistoryItem {
  id: string;
  userId: string;
  points: number;
  activityType: ActivityType;
  actionType: ActivityType;
  timestamp: Date;
  createdAt: Date;
  description: string;
}

export type LearningType = 'giver' | 'taker' | 'matcher';

export type TabType = 'overview' | 'details' | 'recommendations' | 'strengths' | 'weaknesses' | 'learning' | 'tips';

export interface QuizResults {
  giver: number;
  taker: number;
  matcher: number;
  dominantType: PersonalityType;
  percentage: {
    giver: number;
    taker: number;
    matcher: number;
  };
  details?: Array<{
    questionId: number;
    answer: number;
  }>;
}

export interface PersonalityDescription {
  title: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  learningTips: string[];
  learningAdvice: {
    title: string;
    tips: string[];
    tools: string[];
  };
}

export interface GiverScoreHistoryItem {
  userId: string;
  date: string;
  score: number;
  createdAt: string;
}
