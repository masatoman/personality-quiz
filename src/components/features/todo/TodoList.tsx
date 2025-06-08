'use client';

import React, { useState } from 'react';
import TodoForm from './TodoForm';
import TaskItem from './TaskItem';
import useTodoStorage from '@/hooks/useTodoStorage';
import { FaClipboardList, FaCheck, FaListUl, FaRegCalendarCheck } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

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

  // 完了率の計算
  const completionRate = tasks.length > 0 
    ? Math.round((completedTasks.length / tasks.length) * 100) 
    : 0;

  // フィルター切り替えのアニメーション
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transition-all duration-300 border border-gray-100 dark:border-gray-700"
    >
      <div className="bg-blue-600 p-5 relative overflow-hidden">
        {/* 装飾効果 */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-indigo-400/20 rounded-full -ml-10 -mb-10 blur-lg"></div>
        
        <div className="relative flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center">
            <FaClipboardList className="mr-2" />
            ToDoリスト
          </h2>
          <div className="text-sm font-medium text-white bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm shadow-inner">
            {completedPoints} / {totalPoints} ポイント
          </div>
        </div>

        {tasks.length > 0 && (
          <div className="mt-4 relative">
            <div className="flex justify-between text-xs text-white mb-1.5">
              <span className="font-medium">完了率 {completionRate}%</span>
              <span>{completedTasks.length}/{tasks.length} タスク</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2.5 backdrop-blur-sm overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-2.5 rounded-full bg-emerald-400 dark:bg-emerald-500 shadow-inner"
              ></motion.div>
            </div>
          </div>
        )}
      </div>

      <div className="p-5">
        {/* タスク追加フォーム */}
        <TodoForm onAddTask={addTask} />
        
        {/* フィルター */}
        <div className="flex space-x-2 my-5 bg-gray-100 dark:bg-gray-700/80 p-1 rounded-xl transition-all duration-300 shadow-inner">
          <button
            className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              filter === 'all' 
                ? 'bg-white dark:bg-gray-600 text-blue-700 dark:text-blue-300 shadow-sm' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-gray-600/70'
            }`}
            onClick={() => setFilter('all')}
            aria-pressed={filter === 'all'}
          >
            <div className="flex items-center justify-center">
              <FaListUl className="mr-1.5" />
              すべて
            </div>
          </button>
          <button
            className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              filter === 'active' 
                ? 'bg-white dark:bg-gray-600 text-blue-700 dark:text-blue-300 shadow-sm' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-gray-600/70'
            }`}
            onClick={() => setFilter('active')}
            aria-pressed={filter === 'active'}
          >
            <div className="flex items-center justify-center">
              <FaClipboardList className="mr-1.5" />
              未完了
            </div>
          </button>
          <button
            className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              filter === 'completed' 
                ? 'bg-white dark:bg-gray-600 text-blue-700 dark:text-blue-300 shadow-sm' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-gray-600/70'
            }`}
            onClick={() => setFilter('completed')}
            aria-pressed={filter === 'completed'}
          >
            <div className="flex items-center justify-center">
              <FaRegCalendarCheck className="mr-1.5" />
              完了済み
            </div>
          </button>
        </div>
        
        {/* タスクリスト */}
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="space-y-3 mt-4"
          >
            {filteredTasks.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center py-10"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700/80 text-gray-400 dark:text-gray-500 mb-4 shadow-inner">
                  {filter === 'completed' 
                    ? <FaCheck className="w-8 h-8" />
                    : <FaClipboardList className="w-8 h-8" />
                  }
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  {filter === 'all' 
                    ? 'タスクがありません' 
                    : filter === 'active' 
                      ? '未完了のタスクがありません'
                      : '完了したタスクがありません'
                  }
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
                  {filter === 'all' && 'タスクを追加してToDoリストを作成しましょう'}
                  {filter === 'active' && 'すべてのタスクを完了しました！'}
                  {filter === 'completed' && 'タスクを完了するとここに表示されます'}
                </p>
              </motion.div>
            ) : (
              <AnimatePresence>
                {filteredTasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggleComplete={toggleTaskCompletion}
                    onDelete={deleteTask}
                  />
                ))}
              </AnimatePresence>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
} 