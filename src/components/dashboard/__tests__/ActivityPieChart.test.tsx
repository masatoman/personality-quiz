import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ActivityPieChart from '../ActivityPieChart';

// モックを設定してframer-motionのアニメーションによるエラーを回避
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Rechartsのコンポーネントをモック
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie">{children}</div>
  ),
  Cell: () => <div data-testid="cell" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />
}));

describe('ActivityPieChart', () => {
  const mockData = [
    { type: '教材作成', percentage: 35 },
    { type: '教材閲覧', percentage: 25 },
    { type: 'フィードバック', percentage: 20 },
    { type: 'その他', percentage: 20 }
  ];

  it('チャートが正しくレンダリングされる', () => {
    render(<ActivityPieChart data={mockData} />);

    // 必要なチャートコンポーネントが存在することを確認
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie')).toBeInTheDocument();
    expect(screen.getAllByTestId('cell')).toHaveLength(mockData.length);
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });

  it('空のデータでもクラッシュしない', () => {
    render(<ActivityPieChart data={[]} />);
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });
}); 