import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export type Task = {
  id: string;
  title: string;
  description?: string;
  points: number;
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
  type: 'custom' | 'suggested';
};

export type UseTodoStorageReturn = {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  completedTasks: Task[];
  incompleteTasks: Task[];
  totalPoints: number;
  completedPoints: number;
};

export default function useTodoStorage(): UseTodoStorageReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // ローカルストレージからデータを読み込む
  useEffect(() => {
    const storedTasks = localStorage.getItem('todo-tasks');
    if (storedTasks) {
      try {
        // 日付の文字列をDateオブジェクトに変換する必要がある
        const parsedTasks = JSON.parse(storedTasks, (key, value) => {
          if (key === 'createdAt' || key === 'dueDate') {
            return value ? new Date(value) : null;
          }
          return value;
        });
        setTasks(parsedTasks);
      } catch (error) {
        console.error('タスクの読み込みに失敗しました:', error);
        setTasks([]);
      }
    }
  }, []);
  
  // データが変更されたらローカルストレージに保存
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('todo-tasks', JSON.stringify(tasks));
    }
  }, [tasks]);
  
  // タスクの追加
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    const newTask: Task = {
      ...taskData,
      id: uuidv4(),
      createdAt: new Date(),
      completed: false,
    };
    
    setTasks(prevTasks => [...prevTasks, newTask]);
  };
  
  // タスクの削除
  const deleteTask = (id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  };
  
  // タスクの完了状態の切り替え
  const toggleTaskCompletion = (id: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };
  
  // 完了したタスクと未完了のタスクを分ける
  const completedTasks = tasks.filter(task => task.completed);
  const incompleteTasks = tasks.filter(task => !task.completed);
  
  // ポイントの計算
  const totalPoints = tasks.reduce((sum, task) => sum + task.points, 0);
  const completedPoints = completedTasks.reduce((sum, task) => sum + task.points, 0);
  
  return {
    tasks,
    addTask,
    deleteTask,
    toggleTaskCompletion,
    completedTasks,
    incompleteTasks,
    totalPoints,
    completedPoints,
  };
} 