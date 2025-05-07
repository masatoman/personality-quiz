import React from 'react';
import { Task } from '@/hooks/useTodoStorage';
import { FaTrashAlt, FaCheckCircle, FaRegCircle } from 'react-icons/fa';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * 個別のタスク項目を表示するコンポーネント
 */
export default function TaskItem({ task, onToggleComplete, onDelete }: TaskItemProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-3 transition-all">
      <div className="flex items-start">
        <button
          onClick={() => onToggleComplete(task.id)}
          className="flex-shrink-0 mt-1 mr-3 text-blue-500 hover:text-blue-600 focus:outline-none"
          aria-label={task.completed ? "タスクを未完了にする" : "タスクを完了にする"}
        >
          {task.completed ? (
            <FaCheckCircle className="w-5 h-5" />
          ) : (
            <FaRegCircle className="w-5 h-5" />
          )}
        </button>
        
        <div className="flex-1">
          <h3 className={`font-medium text-gray-800 ${task.completed ? 'line-through text-gray-500' : ''}`}>
            {task.title}
          </h3>
          
          {task.description && (
            <p className={`text-sm mt-1 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
              {task.description}
            </p>
          )}
          
          <div className="flex justify-between items-center mt-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {task.points} ポイント
            </span>
            
            {task.dueDate && (
              <span className={`text-xs ${
                task.completed ? 'text-gray-400' : new Date(task.dueDate) < new Date() ? 'text-red-500' : 'text-gray-500'
              }`}>
                期限: {new Date(task.dueDate).toLocaleDateString('ja-JP')}
              </span>
            )}
          </div>
        </div>
        
        <button
          onClick={() => onDelete(task.id)}
          className="ml-3 text-red-500 hover:text-red-600 focus:outline-none"
          aria-label="タスクを削除"
        >
          <FaTrashAlt className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}