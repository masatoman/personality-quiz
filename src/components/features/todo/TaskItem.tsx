import React from 'react';
import { Task } from '@/types/todo';
import { FaTrashAlt, FaCheckCircle, FaRegCircle, FaClock, FaMedal, FaStar } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * 個別のタスク項目を表示するコンポーネント
 */
export default function TaskItem({ task, onToggleComplete, onDelete }: TaskItemProps) {
  // 期限切れかどうかをチェック
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
  
  // 期限までの日数を計算
  const getDaysLeft = () => {
    if (!task.dueDate) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '今日が期限';
    if (diffDays === 1) return '明日が期限';
    if (diffDays < 0) return `${Math.abs(diffDays)}日遅延`;
    return `残り${diffDays}日`;
  };
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
      whileHover={{ scale: 1.01, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}
      transition={{ 
        type: "spring", 
        stiffness: 500, 
        damping: 30,
        layout: { duration: 0.3 }
      }}
      className={`
        bg-white dark:bg-gray-750 rounded-xl shadow-md border-2
        ${task.completed 
          ? 'border-green-200 dark:border-green-800/40'
          : isOverdue 
            ? 'border-red-200 dark:border-red-800/40' 
            : 'border-blue-100 dark:border-blue-800/40'
        }
        transition-all duration-200 overflow-hidden
      `}
    >
      <div className="p-4">
        <div className="flex items-start">
          <button
            onClick={() => onToggleComplete(task.id)}
            className={`
              flex-shrink-0 mt-1 mr-3 p-1.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2
              ${task.completed 
                ? 'text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 focus:ring-green-500'
                : 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 focus:ring-blue-500'
              }
            `}
            aria-label={task.completed ? "タスクを未完了にする" : "タスクを完了にする"}
          >
            <motion.div whileTap={{ scale: 0.8 }}>
              {task.completed ? (
                <FaCheckCircle className="w-5 h-5" />
              ) : (
                <FaRegCircle className="w-5 h-5" />
              )}
            </motion.div>
          </button>
          
          <div className="flex-1">
            <h3 className={`font-medium text-base ${
              task.completed 
                ? 'line-through text-gray-500 dark:text-gray-400' 
                : 'text-gray-900 dark:text-gray-100'
            }`}>
              {task.title}
              {task.type === 'suggested' && (
                <FaStar className="inline-block ml-1.5 text-yellow-500 dark:text-yellow-400 w-3.5 h-3.5" aria-label="おすすめタスク" />
              )}
            </h3>
            
            {task.description && (
              <p className={`text-sm mt-1.5 ${
                task.completed 
                  ? 'text-gray-400 dark:text-gray-500'
                  : 'text-gray-700 dark:text-gray-300'
              }`}>
                {task.description}
              </p>
            )}
            
            <div className="flex flex-wrap gap-2 mt-3">
              <motion.span whileHover={{ y: -2 }} className={`
                inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium shadow-sm
                ${task.completed 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                }
              `}>
                <FaMedal className="mr-1.5" />
                {task.points} ポイント
              </motion.span>
              
              {task.dueDate && (
                <motion.span whileHover={{ y: -2 }} className={`
                  inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium shadow-sm
                  ${task.completed 
                    ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                    : isOverdue
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                  }
                `}>
                  <FaClock className="mr-1.5" />
                  {getDaysLeft()}
                </motion.span>
              )}
              
              {task.type === 'suggested' && (
                <motion.span whileHover={{ y: -2 }} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium shadow-sm bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                  おすすめ
                </motion.span>
              )}
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(task.id)}
            className="ml-3 p-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label="タスクを削除"
          >
            <FaTrashAlt className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
      
      {/* タスクの進捗バー */}
      <AnimatePresence initial={false}>
        {task.completed && (
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            exit={{ width: 0 }}
            transition={{ duration: 0.4 }}
            className="h-1.5 bg-gradient-to-r from-green-400 to-green-500 dark:from-green-500 dark:to-green-600 w-full" 
          />
        )}
        
        {/* 期限切れのタスクの警告バー */}
        {isOverdue && !task.completed && (
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            exit={{ width: 0 }}
            transition={{ duration: 0.4 }}
            className="h-1.5 bg-gradient-to-r from-red-400 to-red-500 dark:from-red-500 dark:to-red-600 w-full" 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}