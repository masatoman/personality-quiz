import React from 'react';
import TaskItem from './TaskItem';
import { Task } from '@/hooks/useTodoStorage';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * タスクリストを表示するコンポーネント
 */
const TaskList: React.FC<TaskListProps> = ({ tasks, onToggleComplete, onDelete }) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        タスクがありません。新しいタスクを追加してください。
      </div>
    );
  }

  return (
    <ul className="mt-2" data-testid="task-list">
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
};

export default TaskList; 