export interface RankingData {
  id: string;
  rank: number;
  username: string;
  score: number;
  activityCount: number;
  lastActive: string;
}

export interface ActionProps {
  label: string;
  onClick: () => void;
} 