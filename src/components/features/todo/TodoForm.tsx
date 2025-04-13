import React, { useState } from 'react';
import { Task } from '@/hooks/useTodoStorage';

interface TodoFormProps {
  onAddTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void;
}

export default function TodoForm({ onAddTask }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    onAddTask({
      title: title.trim(),
      description: description.trim() || undefined,
      points,
      type: 'custom',
      dueDate: undefined
    });
    
    // リセット
    setTitle('');
    setDescription('');
    setPoints(1);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg mb-4">
      <h2 className="text-lg font-medium mb-3">新しいタスク</h2>
      
      <div className="mb-3">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          タイトル *
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="タスク名を入力"
          required
        />
      </div>
      
      <div className="mb-3">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          説明
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="詳細を入力（任意）"
          rows={2}
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-1">
          ポイント
        </label>
        <input
          id="points"
          type="number"
          min="1"
          max="100"
          value={points}
          onChange={(e) => setPoints(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <button
        type="submit"
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
      >
        タスクを追加
      </button>
    </form>
  );
} 