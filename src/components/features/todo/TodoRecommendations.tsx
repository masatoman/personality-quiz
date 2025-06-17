'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Task } from '@/types/todo';
import { FaLightbulb } from 'react-icons/fa';

// 推奨タスクの種類
type RecommendationType = 'time-management' | 'focus' | 'motivation' | 'organization' | 'learning';

// 推奨タスクのインターフェイス
interface RecommendedTask {
  id: string;
  title: string;
  description: string;
  points: number;
  type: RecommendationType;
  dueDate?: Date;
}

interface TodoRecommendationsProps {
  currentTasks: Task[];
  onAddRecommendedTask: (task: Omit<Task, 'id' | 'completed'>) => void;
}

export default function TodoRecommendations({ 
  currentTasks, 
  onAddRecommendedTask 
}: TodoRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendedTask[]>([]);
  const [loading, setLoading] = useState(true);

  // 動的な推薦タスク生成
  const generateDynamicRecommendations = useCallback((): RecommendedTask[] => {
    const dynamicRecommendations: RecommendedTask[] = [];
    const incompleteTasks = currentTasks.filter(task => !task.completed);
    const completedTasks = currentTasks.filter(task => task.completed);
    
    // タスクが少ない場合
    if (currentTasks.length < 3) {
      dynamicRecommendations.push({
        id: 'dynamic-org-1',
        title: '今日の目標を3つ設定する',
        description: '達成可能な小さな目標を3つ設定して、生産性を向上させましょう。',
        points: 5,
        type: 'organization'
      });
    }
    
    // 未完了タスクが多い場合
    if (incompleteTasks.length > 5) {
      dynamicRecommendations.push({
        id: 'dynamic-time-1',
        title: 'タスクの優先順位を見直す',
        description: '重要度と緊急度でタスクを分類し、効率的に進めましょう。',
        points: 8,
        type: 'time-management'
      });
    }
    
    // 完了率が低い場合
    const completionRate = currentTasks.length > 0 ? completedTasks.length / currentTasks.length : 0;
    if (completionRate < 0.3) {
      dynamicRecommendations.push({
        id: 'dynamic-motivation-1',
        title: '小さな成功を積み重ねる',
        description: '簡単なタスクから始めて、達成感を味わいましょう。',
        points: 5,
        type: 'motivation'
      });
    }
    
    // 学習関連のタスクがない場合
    const hasLearningTasks = currentTasks.some(task => 
      task.title.includes('学習') || task.title.includes('勉強') || task.title.includes('教材')
    );
    if (!hasLearningTasks) {
      dynamicRecommendations.push({
        id: 'dynamic-learning-1',
        title: '今日の学習時間を確保する',
        description: '15分でも良いので、新しいことを学ぶ時間を作りましょう。',
        points: 10,
        type: 'learning'
      });
    }
    
    // 集中力向上の推薦（常に表示）
    dynamicRecommendations.push({
      id: 'dynamic-focus-1',
      title: '作業環境を整える',
      description: '集中できる環境を作り、生産性を向上させましょう。',
      points: 3,
      type: 'focus'
    });
    
    // 最大3つまでの推薦を返す
    return dynamicRecommendations.slice(0, 3);
  }, [currentTasks]);

  // 推薦タスクの取得
  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        // 将来的にはAPIから取得する予定
        // const response = await fetch('/api/todo/recommendations');
        // const data = await response.json();
        
        // 現在は動的生成を使用
        const dynamicRecs = generateDynamicRecommendations();
        setRecommendations(dynamicRecs);
      } catch (error) {
        console.error('推薦タスクの取得に失敗しました:', error);
        // エラー時は基本的な推薦のみ表示
        setRecommendations([{
          id: 'fallback-1',
          title: '今日の振り返りをする',
          description: '今日達成したことと明日の目標を整理しましょう。',
          points: 5,
          type: 'organization'
        }]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentTasks.length, generateDynamicRecommendations]); // タスク数が変わったら再計算

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
    
    // 追加後は推薦リストから削除
    setRecommendations(prev => prev.filter(rec => rec.id !== recommendation.id));
  };

  if (loading) {
    return (
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <div className="flex items-center mb-3">
          <FaLightbulb className="text-yellow-500 mr-2" />
          <h2 className="text-lg font-medium">おすすめタスク</h2>
        </div>
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 text-sm">推薦を生成中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 p-4 rounded-lg mb-6">
      <div className="flex items-center mb-3">
        <FaLightbulb className="text-yellow-500 mr-2" />
        <h2 className="text-lg font-medium">おすすめタスク</h2>
      </div>
      
      {recommendations.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-500 mb-2">素晴らしい！現在のタスク管理は順調です。</p>
          <p className="text-sm text-gray-400">新しい推薦は、タスクの状況に応じて表示されます。</p>
        </div>
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
                  className="ml-2 px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
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