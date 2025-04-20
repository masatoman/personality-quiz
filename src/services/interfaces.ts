import { ActivityType } from '../types/learning';

export interface IActivity {
  userId: string;
  type: ActivityType;
  resourceId: string;
}

export interface IActivityHistory extends IActivity {
  points: number;
  timestamp: Date;
}

export interface INotificationData {
  type: string;
  oldLevel?: string;
  newLevel?: string;
}

export interface INotificationService {
  notify(data: INotificationData): Promise<void>;
}

export interface IActivityService {
  setPointsSystem(pointsSystem: IPointsSystem): void;
  completeActivity(activity: IActivity): Promise<void>;
  getUserActivityHistory(userId: string): Promise<IActivityHistory[]>;
}

export interface IUserService {
  setPointsSystem(pointsSystem: IPointsSystem): void;
  getUserPoints(userId: string): Promise<number>;
}

export interface IPointsSystem {
  addPoints(userId: string, points: number, activity: IActivity): Promise<void>;
  getPoints(userId: string): Promise<number>;
  setNotificationService(service: INotificationService): void;
  setActivityService(service: IActivityService): void;
  setUserService(service: IUserService): void;
} 