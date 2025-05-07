import { useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Task } from '@/types/todo';

const STORAGE_KEY = 'todo-tasks';
const BATCH_SIZE = 50; // 一度に処理するタスク数

interface UseTodoStorageReturn {
  tasks: Task[];
  addTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  completedTasks: Task[];
  incompleteTasks: Task[];
  totalPoints: number;
  completedPoints: number;
}

export default function useTodoStorage(): UseTodoStorageReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // ローカルストレージからデータを読み込む
  useEffect(() => {
    const loadTasks = async () => {
      const storedTasks = localStorage.getItem(STORAGE_KEY);
      if (storedTasks) {
        try {
          // 大量のタスクを非同期で処理
          const parsedTasks = JSON.parse(storedTasks);
          const processedTasks: Task[] = [];
          
          for (let i = 0; i < parsedTasks.length; i += BATCH_SIZE) {
            const batch = parsedTasks.slice(i, i + BATCH_SIZE).map((task: any) => ({
              ...task,
              createdAt: new Date(task.createdAt),
              dueDate: task.dueDate ? new Date(task.dueDate) : null
            }));
            processedTasks.push(...batch);
            
            // 各バッチの処理後に短い遅延を入れる
            if (i + BATCH_SIZE < parsedTasks.length) {
              await new Promise(resolve => setTimeout(resolve, 0));
            }
          }
          
          setTasks(processedTasks);
        } catch (error) {
          console.error('タスクの読み込みに失敗しました:', error);
          setTasks([]);
        }
      }
    };
    
    loadTasks();
  }, []);
  
  // データが変更されたらローカルストレージに保存（デバウンス処理）
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (tasks.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      }
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [tasks]);
  
  // タスクの追加（メモ化）
  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    const newTask: Task = {
      ...taskData,
      id: uuidv4(),
      createdAt: new Date(),
      completed: false,
    };
    
    setTasks(prevTasks => [...prevTasks, newTask]);
  }, []);
  
  // タスクの削除（メモ化）
  const deleteTask = useCallback((id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  }, []);
  
  // タスクの完了状態の切り替え（メモ化）
  const toggleTaskCompletion = useCallback((id: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }, []);
  
  // 完了タスクと未完了タスクの分類（メモ化）
  const { completedTasks, incompleteTasks } = useMemo(() => {
    return {
      completedTasks: tasks.filter(task => task.completed),
      incompleteTasks: tasks.filter(task => !task.completed)
    };
  }, [tasks]);
  
  // ポイントの計算（メモ化）
  const { totalPoints, completedPoints } = useMemo(() => {
    return {
      totalPoints: tasks.reduce((sum, task) => sum + (task.points || 0), 0),
      completedPoints: tasks.filter(task => task.completed).reduce((sum, task) => sum + (task.points || 0), 0)
    };
  }, [tasks]);
  
  return {
    tasks,
    addTask,
    deleteTask,
    toggleTaskCompletion,
    completedTasks,
    incompleteTasks,
    totalPoints,
    completedPoints
  };
} 