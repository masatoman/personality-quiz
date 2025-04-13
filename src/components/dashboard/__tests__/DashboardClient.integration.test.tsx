import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardClient from '../DashboardClient';

// コンポーネントをモック
jest.mock('../ActivitySummary', () => ({
  __esModule: true,
  default: ({ createdMaterialsCount, earnedPoints, viewedMaterialsCount }: any) => (
    <div data-testid="activity-summary">
      <div>作成教材数: {createdMaterialsCount}</div>
      <div>獲得ポイント: {earnedPoints}</div>
      <div>閲覧教材数: {viewedMaterialsCount}</div>
    </div>
  ),
}));

jest.mock('../DashboardLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dashboard-layout">{children}</div>
  ),
}));

jest.mock('../../features/todo/TodoList', () => ({
  __esModule: true,
  default: () => <div data-testid="todo-list">ToDoリスト</div>
}));

jest.mock('../../features/giver-score/GiverScoreDisplay', () => ({
  __esModule: true,
  default: ({ userData }: any) => (
    <div data-testid="giver-score-display">
      <div>スコア: {userData.score}</div>
      <div>レベル: {userData.level}</div>
    </div>
  ),
}));

jest.mock('../GiverScoreChart', () => ({
  __esModule: true,
  default: ({ data }: any) => (
    <div data-testid="giver-score-chart">
      <div>データポイント数: {data?.length || 0}</div>
    </div>
  ),
}));

jest.mock('../ActivityPieChart', () => ({
  __esModule: true,
  default: ({ activityCounts }: any) => (
    <div data-testid="activity-pie-chart">
      <div>教材作成: {activityCounts.CREATE_CONTENT}</div>
      <div>フィードバック: {activityCounts.PROVIDE_FEEDBACK}</div>
      <div>教材利用: {activityCounts.CONSUME_CONTENT}</div>
      <div>クイズ完了: {activityCounts.COMPLETE_QUIZ}</div>
    </div>
  ),
}));

// localStorage モック
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// fetchのモック化
beforeEach(() => {
  // @ts-ignore - fetchのモック
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    json: async () => ({}),
  });
});

describe('DashboardClient', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<DashboardClient />);
    
    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument(); // ローディングインジケータ
  });

  it('renders dashboard components after loading', async () => {
    render(<DashboardClient />);
    
    // ローディング状態が終わるのを待つ
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    // 各コンポーネントが表示されていることを確認
    expect(screen.getByTestId('activity-summary')).toBeInTheDocument();
    expect(screen.getByTestId('giver-score-display')).toBeInTheDocument();
    expect(screen.getByTestId('giver-score-chart')).toBeInTheDocument();
    expect(screen.getByTestId('activity-pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('todo-list')).toBeInTheDocument();
    
    // 最近の活動と次のイベント情報も表示されていることを確認
    expect(screen.getByText('最近の活動')).toBeInTheDocument();
    expect(screen.getByText('次のイベント')).toBeInTheDocument();
  });

  it('uses localStorage data when fetch fails', async () => {
    // ローカルストレージにダミーデータを設定
    localStorageMock.setItem('giverScore', '30');
    localStorageMock.setItem('activities', JSON.stringify([
      { activityType: 'CREATE_CONTENT' },
      { activityType: 'CONSUME_CONTENT' },
      { activityType: 'CONSUME_CONTENT' }
    ]));
    
    render(<DashboardClient />);
    
    // ローディング状態が終わるのを待つ
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    // ローカルストレージのデータが正しく表示されているか確認
    expect(screen.getByText('獲得ポイント: 30')).toBeInTheDocument();
    expect(screen.getByText('教材作成: 1')).toBeInTheDocument();
    expect(screen.getByText('教材利用: 2')).toBeInTheDocument();
  });
}); 