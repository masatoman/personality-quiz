export type PersonalityType = 'giver' | 'taker' | 'matcher';

export interface Question {
  id: number;
  text: string;
  options: {
    text: string;
    score: {
      giver: number;
      taker: number;
      matcher: number;
    };
  }[];
}

export interface LearningAdvice {
  title: string;
  description: string;
  tips: string[];
}

export interface Result {
  type: PersonalityType;
  description: string;
  strengths: string[];
  weaknesses: string[];
  learningAdvice: LearningAdvice[];
} 