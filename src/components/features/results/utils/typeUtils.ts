import { LearningType } from '@/types/quiz';

export const getSecondaryType = (
  giverScore: number, 
  takerScore: number, 
  matcherScore: number, 
  dominantType: LearningType
): LearningType => {
  let scores = [
    { type: 'giver' as LearningType, score: giverScore },
    { type: 'taker' as LearningType, score: takerScore },
    { type: 'matcher' as LearningType, score: matcherScore }
  ].filter(s => s.type !== dominantType)
   .sort((a, b) => b.score - a.score);
  
  return scores[0].type;
};

export const getCombinationType = (
  primaryType: LearningType, 
  secondaryType: LearningType
): string => {
  if ((primaryType === 'giver' && secondaryType === 'taker') || 
      (primaryType === 'taker' && secondaryType === 'giver')) {
    return 'giver_taker';
  } else if ((primaryType === 'giver' && secondaryType === 'matcher') || 
             (primaryType === 'matcher' && secondaryType === 'giver')) {
    return 'giver_matcher';
  } else {
    return 'taker_matcher';
  }
}; 