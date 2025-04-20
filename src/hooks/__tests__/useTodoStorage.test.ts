import { renderHook, act } from '@testing-library/react';
import { useTodoStorage } from '../useTodoStorage';
import type { Task } from '@/types/todo';

const mockTask: Omit<Task, 'id' | 'createdAt' | 'completed'> = {
  title: 'Test Task',
  description: 'Test Description',
  points: 5,
  type: 'custom',
  dueDate: new Date('2024-03-20'),
};

describe('useTodoStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should initialize with empty tasks', () => {
    const { result } = renderHook(() => useTodoStorage());
    expect(result.current.tasks).toEqual([]);
  });

  it('should add a new task', () => {
    const { result } = renderHook(() => useTodoStorage());

    act(() => {
      result.current.addTask(mockTask);
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0]).toMatchObject({
      ...mockTask,
      completed: false,
    });
    expect(result.current.tasks[0].id).toBeDefined();
    expect(result.current.tasks[0].createdAt).toBeDefined();
  });

  it('should delete a task', () => {
    const { result } = renderHook(() => useTodoStorage());

    act(() => {
      result.current.addTask(mockTask);
    });

    const taskId = result.current.tasks[0].id;

    act(() => {
      result.current.deleteTask(taskId);
    });

    expect(result.current.tasks).toHaveLength(0);
  });

  it('should toggle task completion', () => {
    const { result } = renderHook(() => useTodoStorage());

    act(() => {
      result.current.addTask(mockTask);
    });

    const taskId = result.current.tasks[0].id;

    act(() => {
      result.current.toggleTaskCompletion(taskId);
    });

    expect(result.current.tasks[0].completed).toBe(true);

    act(() => {
      result.current.toggleTaskCompletion(taskId);
    });

    expect(result.current.tasks[0].completed).toBe(false);
  });

  it('should calculate points correctly', () => {
    const { result } = renderHook(() => useTodoStorage());

    act(() => {
      result.current.addTask(mockTask);
      result.current.addTask({ ...mockTask, points: 3 });
    });

    expect(result.current.totalPoints).toBe(8);
    expect(result.current.completedPoints).toBe(0);

    const taskId = result.current.tasks[0].id;
    act(() => {
      result.current.toggleTaskCompletion(taskId);
    });

    expect(result.current.completedPoints).toBe(5);
  });

  it('should separate completed and incomplete tasks', () => {
    const { result } = renderHook(() => useTodoStorage());

    act(() => {
      result.current.addTask(mockTask);
      result.current.addTask({ ...mockTask, title: 'Task 2' });
    });

    const taskId = result.current.tasks[0].id;
    act(() => {
      result.current.toggleTaskCompletion(taskId);
    });

    expect(result.current.completedTasks).toHaveLength(1);
    expect(result.current.incompleteTasks).toHaveLength(1);
  });
}); 