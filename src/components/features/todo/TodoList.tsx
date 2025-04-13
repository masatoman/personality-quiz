'use client';

import React, { useState } from 'react';
import TodoForm from './TodoForm';
import TaskItem from './TaskItem';
import useTodoStorage from '../../../hooks/useTodoStorage';

export default function TodoList() {
  const {
    tasks,
    addTask,
    deleteTask,
    toggleTaskCompletion,
    completedTasks,
    incompleteTasks,
    totalPoints,
    completedPoints
  } = useTodoStorage();
  
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  
  // フィルタリングされたタスクのリストを表示
  const filteredTasks = filter === 'all' 
    ? tasks 
    : filter === 'active' 
      ? incompleteTasks 
      : completedTasks;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">ToDoリスト</h1>
        <p className="text-gray-600">
          合計ポイント: {completedPoints} / {totalPoints}
        </p>
      </div>

      {/* タスク追加フォーム */}
      <TodoForm onAddTask={addTask} />
      
      {/* フィルター */}
      <div className="flex space-x-2 my-4">
        <button
          className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setFilter('all')}
        >
          すべて
        </button>
        <button
          className={`px-3 py-1 rounded ${filter === 'active' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setFilter('active')}
        >
          未完了
        </button>
        <button
          className={`px-3 py-1 rounded ${filter === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setFilter('completed')}
        >
          完了済み
        </button>
      </div>
      
      {/* タスクリスト */}
      <div className="space-y-4 mt-4">
        {filteredTasks.length === 0 ? (
          <p className="text-gray-500 text-center py-4">タスクがありません</p>
        ) : (
          filteredTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={toggleTaskCompletion}
              onDelete={deleteTask}
            />
          ))
        )}
      </div>
    </div>
  );
} 