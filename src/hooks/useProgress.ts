import { useState, useCallback, useEffect } from 'react';
import { Badge } from '@/types/badges';
import { ActivityType } from '@/types/learning';
import { LEVELS } from '@/data/levels';
import { Level, UserProgress } from '@/types/common';

export const useProgress = (userId: string) => {
  const [userProgress, setUserProgress] = useState<UserProgress>({
    userId,
    level: 1,
    points: 0,
    activities: []
  });

  // 進捗データの取得
  const fetchProgress = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/get_progress.php?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('進捗データの取得に失敗しました');
      }

      const data = await response.json();
      setUserProgress(data);
    } catch (error) {
      console.error('進捗データの取得中にエラーが発生しました:', error);
      throw error;
    }
  }, [userId]);

  // バッジの進捗確認（仮実装）
  const checkBadgeProgress = useCallback((activityType: ActivityType): Badge[] => {
    const newBadges: Badge[] = [];
    
    // TODO: バッジ進捗確認ロジックを実装
    // 現在はUserProgressにbadgesフィールドがないため仮実装
    return newBadges;
  }, []);

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
  ) => {
    try {
      const newBadges = checkBadgeProgress(activityType);
      const newTotalScore = userProgress.points + scoreChange;
      const newLevel = checkLevel(newTotalScore);

      const updatedProgress: UserProgress = {
        ...userProgress,
        level: newLevel.number,
        points: newTotalScore,
        activities: [...userProgress.activities]
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
    fetchProgress();
  }, [fetchProgress]);

  return {
    progress: userProgress,
    updateProgress,
    fetchProgress
  };
}; 