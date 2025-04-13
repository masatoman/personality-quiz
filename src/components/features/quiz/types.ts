export type Answer = {
  questionId: number;
  selectedOption: number;
};

export interface QuizOption {
  text: string;
  score: {
    giver: number;
    taker: number;
    matcher: number;
  };
  description?: string;
}

export interface QuizQuestion {
  id: number;
  category: string;
  text: string;
  description?: string;
  options: QuizOption[];
}

export type QuizState = 'intro' | 'questioning' | 'loading' | 'completed';

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
}

export type PersonalityType = 'giver' | 'taker' | 'matcher'; 