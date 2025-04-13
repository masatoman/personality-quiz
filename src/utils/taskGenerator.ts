import { v4 as uuidv4 } from 'uuid';
import { Task } from '@/hooks/useTodoStorage';

type GiverType = 'giver' | 'matcher' | 'taker';

interface ActivityCounts {
  CREATE_CONTENT: number;
  PROVIDE_FEEDBACK: number;
  CONSUME_CONTENT: number;
  COMPLETE_QUIZ: number;
}

/**
 * ユーザーの特性（ギバータイプとスコア）と活動履歴に基づいて
 * 最適な推奨タスクを生成するユーティリティ
 */
export function generateSuggestedTasks(
  giverType: GiverType = 'matcher',
  giverScore: number = 0,
  activityCounts: ActivityCounts = {
    CREATE_CONTENT: 0,
    PROVIDE_FEEDBACK: 0,
    CONSUME_CONTENT: 0,
    COMPLETE_QUIZ: 0
  }
): Task[] {
  const suggestedTasks: Task[] = [];
  
  // デイリータスク: 毎日のコンテンツ閲覧
  suggestedTasks.push({
    id: uuidv4(),
    title: '教材を1つ閲覧する',
    description: '毎日の学習習慣を維持しましょう',
    completed: false,
    points: 3,
    type: 'daily',
    createdAt: new Date()
  });

  // ギバータイプに応じたタスク
  if (giverType === 'giver') {
    // ギバータイプの場合は教材作成を推奨
    if (activityCounts.CREATE_CONTENT < 1) {
      suggestedTasks.push({
        id: uuidv4(),
        title: '教材を作成してみよう',
        description: 'あなたの知識を共有することで学びが深まります',
        completed: false,
        points: 50,
        type: 'suggested',
        createdAt: new Date()
      });
    }
  } else if (giverType === 'matcher') {
    // マッチャータイプの場合はフィードバック提供を推奨
    suggestedTasks.push({
      id: uuidv4(),
      title: '教材にフィードバックを提供する',
      description: '他のユーザーの教材にコメントすることでポイントを獲得できます',
      completed: false,
      points: 10,
      type: 'suggested',
      createdAt: new Date()
    });
  } else {
    // テイカータイプの場合はクイズ完了を推奨
    suggestedTasks.push({
      id: uuidv4(),
      title: 'クイズに挑戦する',
      description: 'クイズを完了してギバースコアを上げましょう',
      completed: false,
      points: 5,
      type: 'suggested',
      createdAt: new Date()
    });
  }

  // ギバースコアに応じたタスク
  if (giverScore < 10) {
    suggestedTasks.push({
      id: uuidv4(),
      title: 'ギバー診断を完了する',
      description: 'あなたのギバータイプを知りましょう',
      completed: false,
      points: 20,
      type: 'suggested',
      createdAt: new Date()
    });
  } else if (giverScore < 30) {
    // 中級者向けタスク
    suggestedTasks.push({
      id: uuidv4(),
      title: '週間学習目標を設定する',
      description: '目標設定でモチベーションを維持しましょう',
      completed: false,
      points: 5,
      type: 'weekly',
      createdAt: new Date()
    });
  }

  return suggestedTasks;
} 