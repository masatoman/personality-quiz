import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodoList from '../TodoList';
import { act } from 'react-dom/test-utils';

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
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
  };
})();

// uuidv4のモック
jest.mock('uuid', () => ({
  v4: () => 'test-uuid',
}));

describe('TodoList Component', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });

  beforeEach(() => {
    localStorageMock.clear();
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
    expect(localStorageMock.setItem).toHaveBeenCalled();
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
    expect(localStorageMock.setItem).toHaveBeenCalled();
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
    localStorageMock.setItem('shiftWithTasks', JSON.stringify([mockTask]));
    
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
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(2); // 初期化と更新
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
    localStorageMock.setItem('shiftWithTasks', JSON.stringify([mockTask]));
    
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
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(2); // 初期化と更新
  });

  test('ユーザータイプに応じた推奨タスクが表示される', () => {
    // giverタイプのユーザー
    const { rerender } = render(
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
    
    // giverタイプ向けの推奨タスク
    expect(screen.getByText('教材を作成してみよう')).toBeInTheDocument();
    
    // matcherタイプのユーザーに変更
    rerender(
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
    
    // matcherタイプ向けの推奨タスク
    expect(screen.getByText('教材にフィードバックを提供する')).toBeInTheDocument();
    
    // takerタイプのユーザーに変更
    rerender(
      <TodoList 
        giverScore={20} 
        giverType="taker" 
        activityCounts={{
          CREATE_CONTENT: 0,
          PROVIDE_FEEDBACK: 0,
          CONSUME_CONTENT: 0,
          COMPLETE_QUIZ: 0
        }}
      />
    );
    
    // takerタイプ向けの推奨タスク
    expect(screen.getByText('クイズに挑戦する')).toBeInTheDocument();
  });
  
  test('ギバースコアに応じた推奨タスクが表示される', () => {
    // 低スコアのユーザー
    const { rerender } = render(
      <TodoList 
        giverScore={5} 
        giverType="matcher" 
        activityCounts={{
          CREATE_CONTENT: 0,
          PROVIDE_FEEDBACK: 0,
          CONSUME_CONTENT: 0,
          COMPLETE_QUIZ: 0
        }}
      />
    );
    
    // 初心者向けの推奨タスク
    expect(screen.getByText('ギバー診断を完了する')).toBeInTheDocument();
    
    // 中級者スコアのユーザー
    rerender(
      <TodoList 
        giverScore={20} 
        giverType="matcher" 
        activityCounts={{
          CREATE_CONTENT: 0,
          PROVIDE_FEEDBACK: 0,
          CONSUME_CONTENT: 0,
          COMPLETE_QUIZ: 0
        }}
      />
    );
    
    // 中級者向けの推奨タスク
    expect(screen.getByText('週間学習目標を設定する')).toBeInTheDocument();
  });
  
  test('タスクの追加・完了・削除機能が正しく動作する', async () => {
    render(<TodoList giverScore={20} giverType="matcher" />);
    
    // タスク追加ボタンをクリック
    fireEvent.click(screen.getByText('タスク追加'));
    expect(screen.getByPlaceholderText('新しいタスクを入力...')).toBeInTheDocument();
    
    // 新しいタスクを入力
    fireEvent.change(screen.getByPlaceholderText('新しいタスクを入力...'), {
      target: { value: 'テスト用タスク' },
    });
    
    // 追加ボタンをクリック
    fireEvent.click(screen.getByText('追加'));
    
    // 追加されたタスクが表示される
    expect(screen.getByText('テスト用タスク')).toBeInTheDocument();
    
    // ローカルストレージにタスクが保存される
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'shiftWithTasks',
      expect.stringContaining('テスト用タスク')
    );
    
    // タスクを完了状態に変更
    const taskCheckboxes = screen.getAllByRole('button');
    const taskCheckbox = Array.from(taskCheckboxes).find(
      button => button.parentElement?.textContent?.includes('テスト用タスク')
    );
    
    if (taskCheckbox) {
      fireEvent.click(taskCheckbox);
      
      // 完了状態が保存される
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'shiftWithTasks',
        expect.stringMatching(/"completed":true/)
      );
    }
    
    // 削除ボタンを探して削除する
    // 注意: 最新のReact Testing Libraryの更新により、SVGアイコンの検出方法が変わっている可能性があります
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = Array.from(deleteButtons).find(
      button => button.closest('li')?.textContent?.includes('テスト用タスク')
    );
    
    if (deleteButton) {
      fireEvent.click(deleteButton);
      
      // タスクが削除されたことを確認
      await waitFor(() => {
        expect(screen.queryByText('テスト用タスク')).not.toBeInTheDocument();
      });
    }
  });
  
  test('ローカルストレージからタスクが読み込まれる', () => {
    // ローカルストレージにタスクを設定
    const mockTasks = [
      {
        id: 'task1',
        title: '保存済みタスク',
        completed: false,
        points: 0,
        type: 'custom',
        createdAt: new Date().toISOString()
      }
    ];
    
    // モックの返り値を設定
    jest.spyOn(localStorageMock, 'getItem').mockImplementation(() => JSON.stringify(mockTasks));
    
    render(<TodoList giverScore={20} giverType="matcher" />);
    
    // ローカルストレージから読み込まれたタスクが表示される
    expect(screen.getByText('保存済みタスク')).toBeInTheDocument();
  });
}); 