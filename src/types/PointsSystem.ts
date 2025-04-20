import { ACTIVITY_POINTS, ActivityPointsKey } from '../constants/points';

export interface IPointsSystem {
  calculatePoints(activityType: ActivityPointsKey): number;
  getTotalPoints(): number;
  addPoints(points: number): void;
}

export class PointsSystem implements IPointsSystem {
  private totalPoints: number = 0;

  calculatePoints(activityType: ActivityPointsKey): number {
    return ACTIVITY_POINTS[activityType];
  }

  getTotalPoints(): number {
    return this.totalPoints;
  }

  addPoints(points: number): void {
    this.totalPoints += points;
  }
} 