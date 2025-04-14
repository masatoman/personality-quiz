export interface DashboardData {
  summary: {
    createdMaterials: number;
    earnedPoints: number;
    viewedMaterials: number;
  };
  giverScores: Array<{
    date: string;
    score: number;
  }>;
  activityDistribution: Array<{
    type: string;
    percentage: number;
  }>;
  activities: {
    id: string;
    type: string;
    timestamp: string;
    details: Record<string, any>;
  }[];
} 