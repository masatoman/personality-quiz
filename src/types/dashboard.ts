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
} 