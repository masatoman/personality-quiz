import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Task } from '@/types/todo';

type TaskFormProps = {
  onAddTask: (task: Task) => void;
  onCancel: () => void;
};

/**
 * 新規タスク追加フォームコンポーネント
 */
export default function TaskForm({ onAddTask, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    const newTask: Task = {
      id: uuidv4(),
      title: title.trim(),
      description: description.trim() || undefined,
      completed: false,
      points,
      type: 'custom',
      createdAt: new Date(),
    };

    onAddTask(newTask);
    
    // フォームをリセット
    setTitle('');
    setDescription('');
    setPoints(5);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-medium mb-4">新しいタスクを追加</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            タイトル *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            説明
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-1">
            ポイント
          </label>
          <input
            type="number"
            id="points"
            value={points}
            onChange={(e) => setPoints(parseInt(e.target.value))}
            min={1}
            max={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            追加
          </button>
        </div>
      </form>
    </div>
  );
} 