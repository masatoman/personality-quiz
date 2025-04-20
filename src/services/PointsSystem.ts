import { ACTIVITY_POINTS, ACHIEVEMENT_THRESHOLDS } from '../constants';
import { IPointsSystem, IActivity, IActivityHistory, INotificationService, IActivityService, IUserService } from './interfaces';

export class PointsSystem implements IPointsSystem {
  private notificationService?: INotificationService;
  private activityService?: IActivityService;
  private userService?: IUserService;

  constructor() {
    // サービスは外部から注入されるため、コンストラクタでは初期化しない
  }

  private validateServices(): void {
    if (!this.notificationService || !this.activityService || !this.userService) {
      throw new Error('Services not properly initialized');
    }
  }

  private validatePoints(points: number): void {
    if (points < 0) {
      throw new Error('Points cannot be negative');
    }
  }

  private validateActivityType(activity: IActivity): void {
    if (!ACTIVITY_POINTS[activity.type]) {
      throw new Error('Invalid activity type');
    }
  }

  private async calculateLevel(points: number): Promise<{ currentLevel: number; nextLevel: number }> {
    let currentLevel = 1;
    for (let i = 1; i < ACHIEVEMENT_THRESHOLDS.length; i++) {
      if (points >= ACHIEVEMENT_THRESHOLDS[i]) {
        currentLevel = i + 1;
      } else {
        return { currentLevel, nextLevel: i + 1 };
      }
    }
    return { currentLevel, nextLevel: currentLevel };
  }

  public async addPoints(userId: string, points: number, activity: IActivity): Promise<void> {
    this.validateServices();
    this.validatePoints(points);
    this.validateActivityType(activity);

    const currentPoints = await this.userService!.getUserPoints(userId);
    const newPoints = currentPoints + points;

    const { currentLevel: oldLevel } = await this.calculateLevel(currentPoints);
    const { currentLevel: newLevel } = await this.calculateLevel(newPoints);

    try {
      await this.activityService!.completeActivity(activity);

      if (oldLevel !== newLevel) {
        await this.notificationService!.notify({
          type: 'LEVEL_UP',
          oldLevel: oldLevel.toString(),
          newLevel: newLevel.toString()
        });
      } else {
        await this.notificationService!.notify({
          type: 'POINTS_ADDED',
          oldLevel: oldLevel.toString(),
          newLevel: newLevel.toString()
        });
      }
    } catch (error) {
      // 通知の失敗はポイント加算に影響を与えない
      console.error('Notification failed:', error);
    }
  }

  public async getPoints(userId: string): Promise<number> {
    this.validateServices();
    return this.userService!.getUserPoints(userId);
  }

  public async getActivityHistory(userId: string): Promise<IActivityHistory[]> {
    this.validateServices();
    return this.activityService!.getUserActivityHistory(userId);
  }

  public setNotificationService(service: INotificationService): void {
    this.notificationService = service;
  }

  public setActivityService(service: IActivityService): void {
    this.activityService = service;
    service.setPointsSystem(this);
  }

  public setUserService(service: IUserService): void {
    this.userService = service;
    service.setPointsSystem(this);
  }

  public async getNextLevelPoints(userId: string): Promise<number> {
    this.validateServices();
    const currentPoints = await this.userService!.getUserPoints(userId);
    const { currentLevel, nextLevel } = await this.calculateLevel(currentPoints);
    
    if (currentLevel === nextLevel) {
      return 0; // 最高レベルに達している場合
    }
    
    return ACHIEVEMENT_THRESHOLDS[nextLevel - 1] - currentPoints;
  }
} 