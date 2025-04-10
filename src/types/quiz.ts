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

export type PersonalityType = {
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
  personality_types: Record<LearningType, PersonalityType>;
  type_combinations: {
    giver_taker: TypeCombination;
    giver_matcher: TypeCombination;
    taker_matcher: TypeCombination;
  };
};

// タブの種類
export type TabType = 'strengths' | 'weaknesses' | 'advice' | 'tools' | 'scenarios';