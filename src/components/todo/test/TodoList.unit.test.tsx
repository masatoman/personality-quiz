import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodoList from '@/components/features/todo/TodoList';

/**
 * TodoListコンポーネントの単体テスト
 * テスト対象: タスク管理UIコンポーネントの機能と表示
 */

// モックデータ
const mockGiverScore = 15;
const mockGiverType = 'matcher';
const mockActivityCounts = {
  CREATE_CONTENT: 1,
  PROVIDE_FEEDBACK: 2,
  CONSUME_CONTENT: 5,
  COMPLETE_QUIZ: 3
};

// localStorage のモック
const mockLocalStorage: { [key: string]: string } = {};
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn((key) => mockLocalStorage[key] || null),
    setItem: jest.fn((key, value) => {
      mockLocalStorage[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete mockLocalStorage[key];
    }),
    clear: jest.fn(() => {
      Object.keys(mockLocalStorage).forEach((key) => {
        delete mockLocalStorage[key];
      });
    }),
  },
  writable: true
});

describe('TodoList コンポーネント', () => {
  beforeEach(() => {
    // テスト前に localStorage をクリア
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  test('コンポーネントが正しくレンダリングされる', () => {
    render(
      <TodoList
        giverScore={mockGiverScore}
        giverType={mockGiverType}
        activityCounts={mockActivityCounts}
      />
    );
    
    // ヘッダーが表示されていることを確認
    expect(screen.getByText('今日のタスク')).toBeInTheDocument();
    
    // 「タスク追加」ボタンが表示されていることを確認
    expect(screen.getByText('タスク追加')).toBeInTheDocument();
    
    // 初回表示時に推奨タスクが生成されていることを確認
    expect(window.localStorage.setItem).toHaveBeenCalled();
  });

  test('タスク追加フォームを表示/非表示できる', () => {
    render(<TodoList />);
    
    // 初期状態ではフォームは非表示
    expect(screen.queryByPlaceholderText('新しいタスクを入力...')).not.toBeInTheDocument();
    
    // 「タスク追加」ボタンをクリック
    fireEvent.click(screen.getByText('タスク追加'));
    
    // フォームが表示される
    expect(screen.getByPlaceholderText('新しいタスクを入力...')).toBeInTheDocument();
    
    // 「キャンセル」ボタンをクリック
    fireEvent.click(screen.getByText('キャンセル'));
    
    // フォームが非表示になる
    expect(screen.queryByPlaceholderText('新しいタスクを入力...')).not.toBeInTheDocument();
  });

  test('新しいタスクを追加できる', async () => {
    render(<TodoList />);
    
    // 「タスク追加」ボタンをクリック
    fireEvent.click(screen.getByText('タスク追加'));
    
    // 新しいタスクを入力
    const taskInput = screen.getByPlaceholderText('新しいタスクを入力...');
    fireEvent.change(taskInput, { target: { value: '新しいテストタスク' } });
    
    // 「追加」ボタンをクリック
    fireEvent.click(screen.getByText('追加'));
    
    // タスクが追加されたことを確認
    expect(screen.getByText('新しいテストタスク')).toBeInTheDocument();
    
    // localStorage に保存されたことを確認
    expect(window.localStorage.setItem).toHaveBeenCalled();
  });

  test('タスクの完了状態を切り替えられる', async () => {
    // localStorage にタスクデータをセット
    const mockTask = {
      id: '123',
      title: 'テストタスク',
      completed: false,
      points: 5,
      type: 'daily',
      createdAt: new Date().toISOString()
    };
    window.localStorage.setItem('shiftWithTasks', JSON.stringify([mockTask]));
    
    render(<TodoList />);
    
    // 未完了状態のタスクが表示される
    const taskTitle = screen.getByText('テストタスク');
    expect(taskTitle).toBeInTheDocument();
    expect(taskTitle).not.toHaveClass('line-through');
    
    // 完了ボタンをクリック
    const completeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(completeButton);
    
    // タスクが完了状態になることを確認
    await waitFor(() => {
      expect(screen.getByText('テストタスク')).toHaveClass('line-through');
    });
    
    // localStorage が更新されたことを確認
    expect(window.localStorage.setItem).toHaveBeenCalledTimes(2); // 初期化と更新
  });

  test('カスタムタスクを削除できる', async () => {
    // localStorage にカスタムタスクデータをセット
    const mockTask = {
      id: '123',
      title: 'カスタムタスク',
      completed: false,
      points: 0,
      type: 'custom',
      createdAt: new Date().toISOString()
    };
    window.localStorage.setItem('shiftWithTasks', JSON.stringify([mockTask]));
    
    render(<TodoList />);
    
    // カスタムタスクが表示される
    expect(screen.getByText('カスタムタスク')).toBeInTheDocument();
    
    // 削除ボタンをクリック
    const deleteButton = screen.getByRole('button', { name: '' });
    fireEvent.click(deleteButton);
    
    // タスクが削除されることを確認
    await waitFor(() => {
      expect(screen.queryByText('カスタムタスク')).not.toBeInTheDocument();
    });
    
    // localStorage が更新されたことを確認
    expect(window.localStorage.setItem).toHaveBeenCalledTimes(2); // 初期化と更新
  });

  test('ギバータイプに基づいた推奨タスクが生成される', () => {
    // giverタイプでコンポーネントをレンダリング
    render(
      <TodoList
        giverScore={70}
        giverType="giver"
        activityCounts={{
          CREATE_CONTENT: 0,
          PROVIDE_FEEDBACK: 0,
          CONSUME_CONTENT: 0,
          COMPLETE_QUIZ: 0
        }}
      />
    );
    
    // giverタイプ向けの推奨タスクが生成されることを確認
    expect(screen.getByText('教材を作成してみよう')).toBeInTheDocument();
    
    // クリーンアップして再テスト
    cleanup();
    window.localStorage.clear();
    
    // matcherタイプでコンポーネントをレンダリング
    render(
      <TodoList
        giverScore={50}
        giverType="matcher"
        activityCounts={{
          CREATE_CONTENT: 0,
          PROVIDE_FEEDBACK: 0,
          CONSUME_CONTENT: 0,
          COMPLETE_QUIZ: 0
        }}
      />
    );
    
    // matcherタイプ向けの推奨タスクが生成されることを確認
    expect(screen.getByText('教材にフィードバックを提供する')).toBeInTheDocument();
  });
}); 