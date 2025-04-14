import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodoRecommendations from '../TodoRecommendations';
import { Task } from '../../../../hooks/useTodoStorage';

// モックのタスクデータ
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'テストタスク1',
    description: 'テスト説明1',
    points: 5,
    completed: false,
    createdAt: new Date(),
    type: 'custom'
  },
  {
    id: '2',
    title: 'テストタスク2',
    description: 'テスト説明2',
    points: 10,
    completed: true,
    createdAt: new Date(),
    type: 'custom'
  }
];

describe('TodoRecommendations', () => {
  // 基本的なレンダリングのテスト
  test('コンポーネントが正しくレンダリングされる', () => {
    const mockAddTask = jest.fn();
    render(
      <TodoRecommendations 
        currentTasks={mockTasks} 
        onAddRecommendedTask={mockAddTask as any} 
      />
    );
    
    // コンポーネントのタイトルが表示されていることを確認
    expect(screen.getByText('おすすめタスク')).toBeInTheDocument();
  });

  // 追加ボタンクリック時の動作テスト
  test('推奨タスク追加時に正しいプロパティが設定される', () => {
    const mockAddTask = jest.fn();
    render(
      <TodoRecommendations 
        currentTasks={mockTasks} 
        onAddRecommendedTask={mockAddTask as any} 
      />
    );
    
    // 追加ボタンをクリック
    const addButtons = screen.getAllByText('追加');
    fireEvent.click(addButtons[0]);
    
    // onAddRecommendedTaskが呼ばれたことを確認
    expect(mockAddTask).toHaveBeenCalled();
    
    // 呼ばれた引数をテスト
    const calledWithArg = mockAddTask.mock.calls[0][0];
    
    // 今回追加した「type」と「createdAt」プロパティが存在し、正しい値が設定されていることを確認
    expect(calledWithArg.type).toBe('suggested');
    expect(calledWithArg.createdAt).toBeInstanceOf(Date);
  });

  // 異なるタスク状況でのフィルタリングテスト
  test('タスクの状況に応じて適切な推奨が表示される', () => {
    const mockAddTask = jest.fn();
    
    // タスクが少ない場合
    render(
      <TodoRecommendations 
        currentTasks={[]} 
        onAddRecommendedTask={mockAddTask as any} 
      />
    );
    
    // 組織化タイプの推奨タスクが表示されていることを確認
    expect(screen.getByText('今日のタスク優先順位付け')).toBeInTheDocument();
    
    // クリーンアップ
    cleanup();
    
    // 未完了タスクが多い場合
    const manyIncompleteTasks = Array(6).fill(null).map((_, i) => ({
      id: `inc-${i}`,
      title: `未完了タスク${i}`,
      description: `説明${i}`,
      points: 5,
      completed: false,
      createdAt: new Date(),
      type: 'custom' as const
    }));
    
    render(
      <TodoRecommendations 
        currentTasks={manyIncompleteTasks} 
        onAddRecommendedTask={mockAddTask as any} 
      />
    );
    
    // 時間管理タイプの推奨タスクが表示されていることを確認
    expect(screen.getByText('ポモドーロテクニックを試す')).toBeInTheDocument();
  });
}); 