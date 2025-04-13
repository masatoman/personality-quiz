import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskItem from '../TaskItem';
import { Task } from '@/hooks/useTodoStorage';

const mockTask = {
  id: '1',
  title: 'Test Task',
  description: 'Test Description',
  points: 5,
  completed: false,
  createdAt: new Date(),
  type: 'custom' as const,
};

describe('TaskItem', () => {
  const handleToggleComplete = jest.fn<void, [string]>();
  const handleDeleteTask = jest.fn<void, [string]>();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders task details correctly', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggleComplete={handleToggleComplete}
        onDeleteTask={handleDeleteTask}
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('5 ポイント')).toBeInTheDocument();
  });

  it('calls onToggleComplete when toggle button is clicked', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggleComplete={handleToggleComplete}
        onDeleteTask={handleDeleteTask}
      />
    );

    const toggleButton = screen.getByLabelText('タスクを完了にする');
    fireEvent.click(toggleButton);

    expect(handleToggleComplete).toHaveBeenCalledWith(mockTask.id);
  });

  it('calls onDeleteTask when delete button is clicked', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggleComplete={handleToggleComplete}
        onDeleteTask={handleDeleteTask}
      />
    );

    const deleteButton = screen.getByLabelText('タスクを削除');
    fireEvent.click(deleteButton);

    expect(handleDeleteTask).toHaveBeenCalledWith(mockTask.id);
  });

  it('shows completed status correctly', () => {
    const completedTask = { ...mockTask, completed: true };
    render(
      <TaskItem
        task={completedTask}
        onToggleComplete={handleToggleComplete}
        onDeleteTask={handleDeleteTask}
      />
    );

    expect(screen.getByLabelText('タスクを未完了にする')).toBeInTheDocument();
    expect(screen.getByText('Test Task')).toHaveClass('line-through');
  });

  it('説明がない場合は説明が表示されない', () => {
    const taskWithoutDescription = { ...mockTask, description: undefined };
    render(
      <TaskItem
        task={taskWithoutDescription}
        onToggleComplete={handleToggleComplete}
        onDeleteTask={handleDeleteTask}
      />
    );

    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });

  it('期限がない場合は期限が表示されない', () => {
    const taskWithoutDueDate = { ...mockTask, dueDate: undefined };
    render(
      <TaskItem
        task={taskWithoutDueDate}
        onToggleComplete={handleToggleComplete}
        onDeleteTask={handleDeleteTask}
      />
    );

    expect(screen.queryByText(/期限:/)).not.toBeInTheDocument();
  });

  it('期限切れのタスクが正しく表示される', () => {
    const overdueTask = { ...mockTask, dueDate: new Date('2023-01-01') };
    render(
      <TaskItem
        task={overdueTask}
        onToggleComplete={handleToggleComplete}
        onDeleteTask={handleDeleteTask}
      />
    );

    const dueDate = screen.getByText('期限:');
    expect(dueDate).toHaveClass('text-red-500');
  });

  test('タスクの完了状態を切り替えることができる', () => {
    render(<TaskItem task={mockTask} onToggleComplete={handleToggleComplete} onDeleteTask={handleDeleteTask} />);
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(handleToggleComplete).toHaveBeenCalledWith(mockTask.id);
  });

  test('タスクを削除できる', () => {
    render(<TaskItem task={mockTask} onToggleComplete={handleToggleComplete} onDeleteTask={handleDeleteTask} />);
    const deleteButton = screen.getByRole('button', { name: /削除/i });
    fireEvent.click(deleteButton);
    expect(handleDeleteTask).toHaveBeenCalledWith(mockTask.id);
  });
}); 