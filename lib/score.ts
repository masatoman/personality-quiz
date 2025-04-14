import { User, Activity, GiverDiagnosis } from '@prisma/client';

export type UserWithRelations = User & {
  activities: Activity[];
  giverDiagnosis: GiverDiagnosis | null;
};

export type GiverScore = {
  level: number;
  points: number;
  progress: number;
  pointsToNextLevel: number;
  personalityType: 'giver' | 'matcher' | 'taker';
};

const POINTS_PER_LEVEL = 10;
const MAX_LEVEL = 10;

export function calculateGiverScore(userData: UserWithRelations): GiverScore {
  const totalPoints = calculateTotalPoints(userData.activities);
  const level = Math.min(Math.floor(totalPoints / POINTS_PER_LEVEL) + 1, MAX_LEVEL);
  const pointsForNextLevel = level * POINTS_PER_LEVEL;
  const progress = ((totalPoints % POINTS_PER_LEVEL) / POINTS_PER_LEVEL) * 100;
  
  return {
    level,
    points: totalPoints,
    progress,
    pointsToNextLevel: pointsForNextLevel - totalPoints,
    personalityType: determinePersonalityType(totalPoints)
  };
}

function calculateTotalPoints(activities: Activity[]): number {
  return activities.reduce((total, activity) => {
    const basePoints = getBasePoints(activity.type);
    const timeDecay = calculateTimeDecay(activity.createdAt);
    return total + (basePoints * timeDecay);
  }, 0);
}

function getBasePoints(activityType: string): number {
  const pointsMap: Record<string, number> = {
    CREATE_CONTENT: 5,
    PROVIDE_FEEDBACK: 3,
    COMPLETE_QUIZ: 2,
    CONSUME_CONTENT: 1
  };
  return pointsMap[activityType] || 0;
}

function calculateTimeDecay(createdAt: Date): number {
  const daysSinceCreation = Math.floor(
    (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(0.5, 1 - (daysSinceCreation * 0.1));
}

function determinePersonalityType(points: number): 'giver' | 'matcher' | 'taker' {
  if (points >= 67) return 'giver';
  if (points >= 34) return 'matcher';
  return 'taker';
} 