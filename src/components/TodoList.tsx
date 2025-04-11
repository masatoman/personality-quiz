'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FaCheckCircle, FaRegCircle, FaPlus, FaTasks } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  points: number;
  type: 'daily' | 'weekly' | 'suggested' | 'custom';
  dueDate?: Date;
  createdAt: Date;
}

interface TodoListProps {
  giverScore?: number;
  giverType?: 'giver' | 'matcher' | 'taker';
  className?: string;
  activityCounts?: {
    CREATE_CONTENT: number;
    PROVIDE_FEEDBACK: number;
    CONSUME_CONTENT: number;
    COMPLETE_QUIZ: number;
  };
}

const TodoList: React.FC<TodoListProps> = ({
  giverScore = 0,
  giverType = 'matcher',
  className = '',
  activityCounts = {
    CREATE_CONTENT: 0,
    PROVIDE_FEEDBACK: 0,
    CONSUME_CONTENT: 0,
    COMPLETE_QUIZ: 0
  }
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // ギバータイプと活動履歴に基づいて推奨タスクを生成
  const generateSuggestedTasks = useCallback(() => {
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

    setTasks(suggestedTasks);
  }, [giverType, giverScore, activityCounts]);

  // ローカルストレージからタスクを読み込み
  useEffect(() => {
    const storedTasks = localStorage.getItem('shiftWithTasks');
    if (storedTasks) {
      try {
        const parsedTasks = JSON.parse(storedTasks);
        // 日付文字列をDateオブジェクトに変換
        const tasksWithDates = parsedTasks.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined
        }));
        setTasks(tasksWithDates);
      } catch (error) {
        console.error('Failed to parse stored tasks:', error);
        setTasks([]);
      }
    } else {
      // 初回表示時は推奨タスクを生成
      generateSuggestedTasks();
    }
  }, [generateSuggestedTasks]);

  // タスクが変更されたらローカルストレージに保存
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('shiftWithTasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  // タスク完了状態を切り替え
  const toggleTaskCompletion = (taskId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, completed: !task.completed } 
          : task
      )
    );
  };

  // 新しいタスクを追加
  const addNewTask = () => {
    if (!newTaskTitle.trim()) return;
    
    const newTask: Task = {
      id: uuidv4(),
      title: newTaskTitle.trim(),
      completed: false,
      points: 0,
      type: 'custom',
      createdAt: new Date()
    };
    
    setTasks(prevTasks => [...prevTasks, newTask]);
    setNewTaskTitle('');
    setShowAddForm(false);
  };

  // タスクを削除
  const deleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  return (
    <div className={`todo-list bg-white rounded-lg shadow-md p-5 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg flex items-center">
          <FaTasks className="mr-2 text-blue-500" />
          今日のタスク
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-sm text-blue-500 hover:text-blue-700 flex items-center"
        >
          <FaPlus className="mr-1" />
          {showAddForm ? 'キャンセル' : 'タスク追加'}
        </button>
      </div>

      {showAddForm && (
        <div className="mb-4 flex">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="新しいタスクを入力..."
            className="flex-1 p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-300"
            onKeyDown={(e) => e.key === 'Enter' && addNewTask()}
          />
          <button
            onClick={addNewTask}
            className="bg-blue-500 text-white px-3 py-2 rounded-r hover:bg-blue-600"
          >
            追加
          </button>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <p>タスクがありません</p>
          <p className="text-sm mt-1">「タスク追加」ボタンから新しいタスクを作成できます</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {tasks.map(task => (
            <li 
              key={task.id} 
              className={`flex items-start p-3 rounded border ${
                task.completed 
                  ? 'bg-gray-50 border-gray-200 text-gray-500' 
                  : 'bg-blue-50 border-blue-100'
              }`}
            >
              <button 
                onClick={() => toggleTaskCompletion(task.id)}
                className={`mt-1 mr-3 flex-shrink-0 ${
                  task.completed ? 'text-green-500' : 'text-gray-400 hover:text-blue-500'
                }`}
              >
                {task.completed ? <FaCheckCircle size={18} /> : <FaRegCircle size={18} />}
              </button>
              <div className="flex-1">
                <p className={`font-medium ${task.completed ? 'line-through' : ''}`}>
                  {task.title}
                  {task.points > 0 && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      +{task.points}ポイント
                    </span>
                  )}
                </p>
                {task.description && (
                  <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                )}
              </div>
              {task.type === 'custom' && (
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-gray-400 hover:text-red-500 ml-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TodoList; 