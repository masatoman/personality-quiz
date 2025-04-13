'use client';

import React from 'react';
import { Task } from '@/hooks/useTodoStorage';
import { FaLightbulb } from 'react-icons/fa';

// 推奨タスクの種類
type RecommendationType = 'time-management' | 'focus' | 'motivation' | 'organization';

// 推奨タスクのインターフェイス
interface RecommendedTask {
  id: string;
  title: string;
  description: string;
  points: number;
  type: RecommendationType;
  dueDate?: Date;
}

// サンプル推奨タスク
const sampleRecommendations: RecommendedTask[] = [
  {
    id: 'rec-1',
    title: 'ポモドーロテクニックを試す',
    description: '25分間集中して作業し、5分休憩するサイクルを4回繰り返してみましょう。',
    points: 10,
    type: 'time-management',
  },
  {
    id: 'rec-2',
    title: '今日のタスク優先順位付け',
    description: '今日のタスクを重要度と緊急度でマトリクス化し、優先順位を決めましょう。',
    points: 5,
    type: 'organization',
  },
  {
    id: 'rec-3',
    title: '集中できる環境づくり',
    description: '作業場所を整理し、集中を妨げるものを取り除きましょう。',
    points: 8,
    type: 'focus',
  },
  {
    id: 'rec-4',
    title: '小さな目標を達成する',
    description: '簡単に達成できる小さなタスクをいくつか完了させて、モチベーションを高めましょう。',
    points: 5,
    type: 'motivation',
  },
];

interface TodoRecommendationsProps {
  currentTasks: Task[];
  onAddRecommendedTask: (task: Omit<Task, 'id' | 'completed'>) => void;
}

export default function TodoRecommendations({ 
  currentTasks, 
  onAddRecommendedTask 
}: TodoRecommendationsProps) {
  // タスクの状況に基づいて推奨タスクをフィルタリングする
  // 実際のアプリでは、ユーザーの習慣やタスク完了率などに基づいてパーソナライズされた推奨を提供する
  const getFilteredRecommendations = (): RecommendedTask[] => {
    // タスクが少ない場合は組織化を推奨
    if (currentTasks.length < 3) {
      return sampleRecommendations.filter(rec => rec.type === 'organization');
    }
    
    // 未完了タスクが多い場合は時間管理を推奨
    const incompleteTasks = currentTasks.filter(task => !task.completed);
    if (incompleteTasks.length > 5) {
      return sampleRecommendations.filter(rec => rec.type === 'time-management');
    }
    
    // 完了タスクが少ない場合はモチベーションを推奨
    const completedTasks = currentTasks.filter(task => task.completed);
    if (completedTasks.length < 2) {
      return sampleRecommendations.filter(rec => rec.type === 'motivation');
    }
    
    // それ以外の場合はすべての推奨を表示（ランダムに2つ選択）
    return sampleRecommendations.sort(() => 0.5 - Math.random()).slice(0, 2);
  };

  const recommendations = getFilteredRecommendations();

  // 推奨タスクをTodoリストに追加する
  const handleAddRecommendation = (recommendation: RecommendedTask) => {
    onAddRecommendedTask({
      title: recommendation.title,
      description: recommendation.description,
      points: recommendation.points,
      dueDate: recommendation.dueDate,
      type: 'suggested',
      createdAt: new Date(),
    });
  };

  return (
    <div className="bg-blue-50 p-4 rounded-lg mb-6">
      <div className="flex items-center mb-3">
        <FaLightbulb className="text-yellow-500 mr-2" />
        <h2 className="text-lg font-medium">おすすめタスク</h2>
      </div>
      
      {recommendations.length === 0 ? (
        <p className="text-gray-500">現在おすすめできるタスクはありません。</p>
      ) : (
        <div className="space-y-3">
          {recommendations.map(recommendation => (
            <div key={recommendation.id} className="bg-white p-3 rounded border border-blue-100">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{recommendation.title}</h3>
                  <p className="text-sm text-gray-600">{recommendation.description}</p>
                  <span className="inline-block mt-1 text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    {recommendation.points}ポイント
                  </span>
                </div>
                <button
                  onClick={() => handleAddRecommendation(recommendation)}
                  className="ml-2 px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  追加
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 