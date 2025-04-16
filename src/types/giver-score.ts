export interface GiverScore {
  level: number;
  points: number;
  progress: number;
  pointsToNextLevel: number;
  personalityType: 'giver' | 'matcher' | 'taker';
} 