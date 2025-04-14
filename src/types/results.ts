export type LearningType = 'giver' | 'taker' | 'matcher';

export type TabType = 'overview' | 'details' | 'recommendations';

export interface Recommendation {
  title: string;
  description: string;
  link?: string;
}

export interface PersonalityTypeInfo {
  title: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  tips: string[];
}

export interface ResultsData {
  answers: Array<{
    question: string;
    answer: string;
    score: number;
  }>;
  recommendations: Recommendation[];
  timestamp: string;
  personalityInfo: Record<LearningType, PersonalityTypeInfo>;
  scores: {
    giver: number;
    taker: number;
    matcher: number;
  };
} 