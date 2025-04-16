import { ActivityType } from './learning';

export interface ActivityDetails {
  resourceId?: string;
  resourceTitle?: string;
  score?: number;
  progress?: number;
  feedback?: string;
  [key: string]: string | number | undefined;
}

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
    type: ActivityType;
    percentage: number;
  }>;
  activities: {
    id: string;
    type: ActivityType;
    timestamp: string;
    details: ActivityDetails;
  }[];
} 