import { useState, useCallback } from 'react';
import { ActivityType, ActivityLog, ScoreChange } from '@/types/quiz';
import { calculateScoreChange } from '@/utils/score';

export const useActivityLog = (userId: number) => {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [currentScores, setCurrentScores] = useState<ScoreChange>({
    giver: 0,
    taker: 0,
    matcher: 0
  });

  const logActivity = useCallback(async (activityType: ActivityType) => {
    const scoreChange = calculateScoreChange(activityType);
    const newLog: ActivityLog = {
      id: Date.now(), // 仮のID
      userId,
      activityType,
      scoreChange,
      createdAt: new Date()
    };

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/log_activity.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLog),
      });

      if (!response.ok) {
        throw new Error('活動ログの保存に失敗しました');
      }

      setActivityLogs(prev => [...prev, newLog]);
      setCurrentScores(prev => ({
        giver: prev.giver + scoreChange.giver,
        taker: prev.taker + scoreChange.taker,
        matcher: prev.matcher + scoreChange.matcher
      }));

      return newLog;
    } catch (error) {
      console.error('活動ログの記録中にエラーが発生しました:', error);
      throw error;
    }
  }, [userId]);

  const getRecentActivities = useCallback(async (limit: number = 10) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/get_activities.php?userId=${userId}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('活動履歴の取得に失敗しました');
      }

      const data = await response.json();
      setActivityLogs(data.activities);
      return data.activities;
    } catch (error) {
      console.error('活動履歴の取得中にエラーが発生しました:', error);
      throw error;
    }
  }, [userId]);

  return {
    activityLogs,
    currentScores,
    logActivity,
    getRecentActivities
  };
}; 