'use client';

import React from 'react';
import { FaClipboardList } from 'react-icons/fa';
import TodoList from './features/todo/TodoList';

/**
 * Todoコンポーネント
 * Todoリスト機能のルートコンポーネント
 */
export default function Todo() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center mb-2">
          <FaClipboardList className="mr-2" />
          ToDoリスト
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          タスクを管理して、学習の進捗を把握しましょう。
        </p>
      </header>
      
      <main>
        <TodoList />
      </main>
    </div>
  );
} 