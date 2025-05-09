import React, { useState } from 'react';
import { Task } from '@/types/todo';
import { FaPlus, FaCalendarAlt, FaTag, FaInfoCircle, FaRegListAlt, FaTimes, FaSave } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface TodoFormProps {
  onAddTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void;
}

export default function TodoForm({ onAddTask }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState(1);
  const [dueDate, setDueDate] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    onAddTask({
      title: title.trim(),
      description: description.trim() || undefined,
      points,
      type: 'custom',
      dueDate: dueDate ? new Date(dueDate) : undefined
    });
    
    // リセット
    setTitle('');
    setDescription('');
    setPoints(1);
    setDueDate('');
    setIsExpanded(false);
  };

  // 今日の日付をYYYY-MM-DD形式で取得
  const today = new Date().toISOString().split('T')[0];

  // フォームアニメーション
  const formVariants = {
    closed: { 
      height: 0, 
      opacity: 0 
    },
    open: { 
      height: 'auto', 
      opacity: 1,
      transition: { 
        height: { 
          type: "spring", 
          stiffness: 300, 
          damping: 30 
        },
        opacity: { duration: 0.2 }
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-700 transition-all duration-300">
      <motion.div 
        className="bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-indigo-900/20 px-5 py-4 cursor-pointer flex justify-between items-center"
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
        whileTap={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}
      >
        <h2 className="text-lg font-medium text-blue-800 dark:text-blue-300 flex items-center">
          <FaRegListAlt className="mr-2" />
          新しいタスクを追加
        </h2>
        <motion.button 
          type="button"
          className="text-blue-600 dark:text-blue-400 p-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-colors"
          aria-label={isExpanded ? "フォームを閉じる" : "フォームを開く"}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <FaPlus className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-45' : ''}`} />
          </motion.div>
        </motion.button>
      </motion.div>
      
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="form"
            initial="closed"
            animate="open"
            exit="closed"
            variants={formVariants}
          >
            <form onSubmit={handleSubmit} className="p-5 border-t border-blue-100 dark:border-blue-900/30">
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1.5">
                  タイトル <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors shadow-sm"
                    placeholder="タスク名を入力"
                    required
                  />
                  {title.length === 0 && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <FaInfoCircle className="text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="points" className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1.5 flex items-center">
                    <FaTag className="mr-1.5 text-blue-600 dark:text-blue-400" /> ポイント
                  </label>
                  <div className="relative">
                    <input
                      id="points"
                      type="number"
                      min="1"
                      max="100"
                      value={points}
                      onChange={(e) => setPoints(Number(e.target.value))}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors shadow-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1.5 flex items-center">
                    <FaCalendarAlt className="mr-1.5 text-blue-600 dark:text-blue-400" /> 期限日
                  </label>
                  <input
                    id="dueDate"
                    type="date"
                    min={today}
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors shadow-sm"
                  />
                </div>
              </div>
              
              <div className="mb-5">
                <label htmlFor="description" className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1.5">
                  説明
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors shadow-sm"
                  placeholder="詳細を入力（任意）"
                  rows={2}
                />
              </div>
              
              <div className="flex justify-end items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="flex items-center justify-center px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  <FaTimes className="mr-1.5" />
                  キャンセル
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  <FaSave className="mr-1.5" />
                  タスクを追加
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 