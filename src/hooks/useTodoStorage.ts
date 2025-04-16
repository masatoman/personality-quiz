import { useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Task } from '@/types/todo';

const STORAGE_KEY = 'todo-tasks';
const BATCH_SIZE = 50; // 一度に処理するタスク数

interface StoredTask extends Omit<Task, 'createdAt' | 'dueDate'> {
  createdAt: string;
  dueDate: string | null;
}

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

export function useTodoStorage(): UseTodoStorageReturn {
  const [tasks, setTasks] = useState<Task[]>([]);

  // ローカルストレージからタスクを読み込む
  useEffect(() => {
    const loadTasks = () => {
      try {
        const storedTasks = localStorage.getItem(STORAGE_KEY);
        if (!storedTasks) return;

        const parsedTasks = JSON.parse(storedTasks) as StoredTask[];
        const convertedTasks: Task[] = parsedTasks.map(task => ({
          ...task,
          createdAt: new Date(task.createdAt),
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined
        }));

        setTasks(convertedTasks);
      } catch (error) {
        console.error('Failed to load tasks:', error);
      }
    };

    loadTasks();
  }, []);

  // タスクの変更を保存
  useEffect(() => {
    try {
      const storedTasks: StoredTask[] = tasks.map(task => ({
        ...task,
        createdAt: task.createdAt.toISOString(),
        dueDate: task.dueDate?.toISOString() ?? null
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedTasks));
    } catch (error) {
      console.error('Failed to save tasks:', error);
    }
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
      totalPoints: tasks.reduce((sum, task) => sum + task.points, 0),
      completedPoints: completedTasks.reduce((sum, task) => sum + task.points, 0)
    };
  }, [tasks, completedTasks]);
  
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