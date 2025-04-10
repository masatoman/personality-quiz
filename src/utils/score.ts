import { ActivityType, ScoreChange, PersonalityType } from '@/types/quiz';

const SCORE_WEIGHTS: Record<ActivityType, ScoreChange> = {
  CREATE_CONTENT: {
    giver: 5,
    taker: 0,
    matcher: 2
  },
  PROVIDE_FEEDBACK: {
    giver: 3,
    taker: 0,
    matcher: 1
  },
  CONSUME_CONTENT: {
    giver: 0,
    taker: 2,
    matcher: 1
  },
  RECEIVE_FEEDBACK: {
    giver: 0,
    taker: 1,
    matcher: 1
  },
  SHARE_RESOURCE: {
    giver: 2,
    taker: 0,
    matcher: 1
  },
  ASK_QUESTION: {
    giver: 0,
    taker: 1,
    matcher: 1
  }
};

export const calculateScoreChange = (activityType: ActivityType): ScoreChange => {
  return SCORE_WEIGHTS[activityType];
};

export const determinePersonalityType = (
  giverScore: number,
  takerScore: number,
  matcherScore: number
): PersonalityType => {
  const scores: Record<PersonalityType, number> = {
    giver: giverScore,
    taker: takerScore,
    matcher: matcherScore
  };

  let maxType: PersonalityType = 'matcher';
  let maxScore = -Infinity;

  (Object.entries(scores) as [PersonalityType, number][]).forEach(([type, score]) => {
    if (score > maxScore) {
      maxType = type;
      maxScore = score;
    }
  });

  return maxType;
};

export const calculateProgress = (
  currentScores: ScoreChange,
  targetType: PersonalityType
): number => {
  const totalScore = Object.values(currentScores).reduce((a, b) => a + b, 0);
  const targetScore = currentScores[targetType];
  
  return totalScore === 0 ? 0 : (targetScore / totalScore) * 100;
}; 