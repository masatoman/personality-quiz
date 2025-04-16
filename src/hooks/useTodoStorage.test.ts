import { renderHook, act } from '@testing-library/react';
import { useTodoStorage } from './useTodoStorage';
import type { Task } from '@/types/todo';

describe('useTodoStorage', () => {
  const mockTask: Omit<Task, 'id' | 'createdAt' | 'completed'> = {
    title: 'テストタスク',
    description: 'テスト用のタスク説明',
    points: 5,
    type: 'custom',
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it('初期状態で空の配列を返すこと', () => {
    const { result } = renderHook(() => useTodoStorage());
    
    expect(result.current.tasks).toEqual([]);
    expect(result.current.completedTasks).toEqual([]);
    expect(result.current.incompleteTasks).toEqual([]);
    expect(result.current.totalPoints).toBe(0);
    expect(result.current.completedPoints).toBe(0);
  });

  it('タスクを追加できること', () => {
    const { result } = renderHook(() => useTodoStorage());

    act(() => {
      result.current.addTask(mockTask);
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0]).toMatchObject({
      ...mockTask,
      completed: false,
    });
    expect(typeof result.current.tasks[0].id).toBe('string');
    expect(result.current.tasks[0].createdAt).toBeInstanceOf(Date);
  });

  it('タスクを削除できること', () => {
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

  it('タスクの完了状態を切り替えられること', () => {
    const { result } = renderHook(() => useTodoStorage());

    act(() => {
      result.current.addTask(mockTask);
    });

    const taskId = result.current.tasks[0].id;

    act(() => {
      result.current.toggleTaskCompletion(taskId);
    });

    expect(result.current.completedTasks).toHaveLength(1);
    expect(result.current.incompleteTasks).toHaveLength(0);
    expect(result.current.totalPoints).toBe(5);
    expect(result.current.completedPoints).toBe(5);

    act(() => {
      result.current.toggleTaskCompletion(taskId);
    });

    expect(result.current.completedTasks).toHaveLength(0);
    expect(result.current.incompleteTasks).toHaveLength(1);
    expect(result.current.totalPoints).toBe(5);
    expect(result.current.completedPoints).toBe(0);
  });

  it('ローカルストレージからタスクを読み込めること', () => {
    const storedTask: Task = {
      ...mockTask,
      id: '123',
      createdAt: new Date('2024-01-01'),
      completed: false,
    };

    localStorage.setItem('todo-tasks', JSON.stringify([{
      ...storedTask,
      createdAt: storedTask.createdAt.toISOString(),
      dueDate: null,
    }]));

    const { result } = renderHook(() => useTodoStorage());

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0]).toMatchObject(storedTask);
  });

  it('タスクの変更をローカルストレージに保存すること', () => {
    const { result } = renderHook(() => useTodoStorage());

    act(() => {
      result.current.addTask(mockTask);
    });

    const storedData = localStorage.getItem('todo-tasks');
    expect(storedData).toBeTruthy();

    const parsedData = JSON.parse(storedData!);
    expect(parsedData).toHaveLength(1);
    expect(parsedData[0]).toMatchObject({
      ...mockTask,
      completed: false,
    });
  });

  it('不正なJSONデータを処理できること', () => {
    localStorage.setItem('todo-tasks', 'invalid-json');
    
    const { result } = renderHook(() => useTodoStorage());
    
    expect(result.current.tasks).toEqual([]);
  });
}); 