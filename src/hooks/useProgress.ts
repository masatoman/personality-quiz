import { useState, useCallback, useEffect } from 'react';
import { UserProgress, Badge, ActivityType, Level, BadgeType } from '@/types/quiz';
import { BADGE_DEFINITIONS } from '@/data/badges';
import { LEVELS } from '@/data/levels';

interface ProgressUpdateResult {
  newBadges: Badge[];
  levelUp: boolean;
}

export const useProgress = (userId: number): {
  progress: UserProgress;
  updateProgress: (activityType: ActivityType, scoreChange: number) => Promise<ProgressUpdateResult>;
  fetchProgress: () => Promise<void>;
} => {
  const [userProgress, setUserProgress] = useState<UserProgress>({
    userId,
    level: 1,
    totalScore: 0,
    badges: [],
    streakDays: 0,
    lastActivityDate: new Date()
  });

  // 進捗データの取得
  const fetchProgress = useCallback(async (): Promise<void> => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/get_progress.php?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('進捗データの取得に失敗しました');
      }

      const data = (await response.json()) as UserProgress;
      setUserProgress(data);
    } catch (error) {
      console.error('進捗データの取得中にエラーが発生しました:', error);
      throw error;
    }
  }, [userId]);

  // バッジの進捗確認
  const checkBadgeProgress = useCallback((activityType: ActivityType): Badge[] => {
    const newBadges: Badge[] = [];
    
    Object.entries(BADGE_DEFINITIONS).forEach(([type, badgeDef]) => {
      const existingBadge = userProgress.badges.find((b: Badge) => b.type === type as BadgeType);
      if (existingBadge) return;

      const relevantRequirements = badgeDef.requirements.filter(
        req => req.activityType === activityType
      );

      if (relevantRequirements.length === 0) return;

      // 進捗の計算
      const progress = Math.min(
        relevantRequirements.reduce((acc: number, req) => acc + (req.count * 10), 0),
        100
      );

      if (progress >= 100) {
        const newBadge: Badge = {
          id: `${type}_${Date.now()}`,
          type: type as BadgeType,
          name: badgeDef.name,
          description: badgeDef.description,
          iconUrl: badgeDef.iconUrl,
          level: badgeDef.level,
          requirements: badgeDef.requirements,
          progress: 100,
          acquiredAt: new Date(),
          isSecret: badgeDef.isSecret
        };
        newBadges.push(newBadge);
      }
    });

    return newBadges;
  }, [userProgress.badges]);

  // レベルの確認
  const checkLevel = useCallback((totalScore: number): Level => {
    let newLevel = LEVELS[0];
    
    for (const level of LEVELS) {
      if (totalScore >= level.requiredScore) {
        newLevel = level;
      } else {
        break;
      }
    }

    return newLevel;
  }, []);

  // 進捗の更新
  const updateProgress = useCallback(async (
    activityType: ActivityType,
    scoreChange: number
  ): Promise<ProgressUpdateResult> => {
    try {
      const newBadges = checkBadgeProgress(activityType);
      const newTotalScore = userProgress.totalScore + scoreChange;
      const newLevel = checkLevel(newTotalScore);

      const updatedProgress: UserProgress = {
        ...userProgress,
        level: newLevel.number,
        totalScore: newTotalScore,
        badges: [...userProgress.badges, ...newBadges],
        lastActivityDate: new Date()
      };

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/update_progress.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProgress),
      });

      if (!response.ok) {
        throw new Error('進捗の更新に失敗しました');
      }

      setUserProgress(updatedProgress);
      return { newBadges, levelUp: newLevel.number > userProgress.level };
    } catch (error) {
      console.error('進捗の更新中にエラーが発生しました:', error);
      throw error;
    }
  }, [userProgress, checkBadgeProgress, checkLevel]);

  // 初期データの取得
  useEffect(() => {
    void fetchProgress();
  }, [fetchProgress]);

  return {
    progress: userProgress,
    updateProgress,
    fetchProgress
  };
}; 