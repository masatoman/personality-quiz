import React from 'react';
import { ActivityType } from '@/types/quiz';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';

interface TodoListProps {
  giverScore: number;
  giverType: string;
  className?: string;
  activityCounts: Record<ActivityType, number>;
}

export const TodoList: React.FC<TodoListProps> = ({
  giverScore,
  giverType,
  className,
  activityCounts,
}) => {
  const todos = [
    {
      id: 'create-content',
      title: 'コンテンツを作成する',
      target: 5,
      current: activityCounts['CREATE_CONTENT'],
      points: 10,
    },
    {
      id: 'provide-feedback',
      title: 'フィードバックを提供する',
      target: 3,
      current: activityCounts['PROVIDE_FEEDBACK'],
      points: 5,
    },
    {
      id: 'consume-content',
      title: 'コンテンツを閲覧する',
      target: 10,
      current: activityCounts['CONSUME_CONTENT'],
      points: 2,
    },
    {
      id: 'ask-question',
      title: '質問をする',
      target: 3,
      current: activityCounts['ASK_QUESTION'],
      points: 5,
    },
  ];

  return (
    <div className={clsx('space-y-4', className)}>
      <h3 className="text-lg font-semibold">タスク一覧</h3>
      <div className="space-y-2">
        {todos.map((todo) => {
          const isCompleted = todo.current >= todo.target;
          return (
            <div
              key={todo.id}
              className={clsx(
                'flex items-center justify-between p-3 rounded-lg border',
                isCompleted ? 'border-green-500 bg-green-50' : 'border-gray-200'
              )}
            >
              <div className="flex items-center space-x-3">
                {isCompleted && (
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                )}
                <span
                  className={clsx(
                    'text-sm',
                    isCompleted && 'line-through text-gray-500'
                  )}
                >
                  {todo.title}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {`${todo.current}/${todo.target}`}
                </span>
                <span className="text-xs text-gray-500">{`+${todo.points}pts`}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};