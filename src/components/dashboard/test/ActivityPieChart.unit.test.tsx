import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ActivityPieChart from '@/components/dashboard/ActivityPieChart';

// recharts コンポーネントをモック
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: any) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    PieChart: ({ children }: any) => (
      <div data-testid="pie-chart">{children}</div>
    ),
    Pie: ({ children, ...props }: any) => (
      <div data-testid="recharts-pie" {...props}>{children}</div>
    ),
    Cell: (props: any) => <div data-testid="recharts-cell" {...props} />,
    Tooltip: (props: any) => <div data-testid="recharts-tooltip" {...props} />,
    Legend: (props: any) => <div data-testid="recharts-legend" {...props} />,
  };
});

describe('ActivityPieChart Component', () => {
  const mockData = [
    { type: '教材作成', percentage: 30 },
    { type: '学習', percentage: 50 },
    { type: 'フィードバック', percentage: 20 }
  ];
  
  it('活動種類の円グラフが正しく表示されること', () => {
    render(<ActivityPieChart data={mockData} />);
    
    // グラフコンポーネントが表示されていることを確認
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-pie')).toBeInTheDocument();
    
    // データの数だけセルが表示されていることを確認
    const cells = screen.getAllByTestId('recharts-cell');
    expect(cells.length).toBe(mockData.length);
  });
  
  it('データが空の場合は空のグラフが表示されること', () => {
    render(<ActivityPieChart data={[]} />);
    
    // グラフコンポーネントは表示されるが、セルは表示されないことを確認
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.queryAllByTestId('recharts-cell').length).toBe(0);
  });
}); 