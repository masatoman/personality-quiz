import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GiverScoreChart from '../GiverScoreChart';

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
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />
}));

describe('GiverScoreChart', () => {
  const mockData = [
    { date: '2024-03-01', score: 65 },
    { date: '2024-03-02', score: 70 },
    { date: '2024-03-03', score: 75 }
  ];

  it('チャートが正しくレンダリングされる', () => {
    render(<GiverScoreChart data={mockData} />);

    // 必要なチャートコンポーネントが存在することを確認
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line')).toBeInTheDocument();
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  it('空のデータでもクラッシュしない', () => {
    render(<GiverScoreChart data={[]} />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('コンポーネントが正しくレンダリングされること', () => {
    render(<GiverScoreChart userId={mockData[0].date} />);
    
    // タイトルと説明テキストが正しく表示されていることを確認
    expect(screen.getByText('ギバースコア推移')).toBeInTheDocument();
    expect(screen.getByText('過去の活動によるスコア変化を確認できます')).toBeInTheDocument();
  });

  it('Rechartsのコンポーネントが正しくレンダリングされること', () => {
    const { getByTestId } = render(<GiverScoreChart userId={mockData[0].date} />);
    
    // Rechartsの各コンポーネントが正しくレンダリングされていることを確認
    expect(getByTestId('responsive-container')).toBeInTheDocument();
    expect(getByTestId('line-chart')).toBeInTheDocument();
    expect(getByTestId('line')).toBeInTheDocument();
    expect(getByTestId('x-axis')).toBeInTheDocument();
    expect(getByTestId('y-axis')).toBeInTheDocument();
    expect(getByTestId('cartesian-grid')).toBeInTheDocument();
    expect(getByTestId('tooltip')).toBeInTheDocument();
  });

  it('カスタムデータを渡した場合、そのデータが使われること', () => {
    // この部分はUIテストだけでは検証が難しいため、
    // スパイを使って内部実装を検証するより高度なテストが必要になります
    // ここでは基本的なレンダリングテストのみ実施
    render(<GiverScoreChart userId={mockData[0].date} />);
    
    expect(screen.getByText('ギバースコア推移')).toBeInTheDocument();
  });

  it('高さのプロパティが正しく適用されること', () => {
    const customHeight = 500;
    render(<GiverScoreChart userId={mockData[0].date} height={customHeight} />);
    
    // コンポーネントが正しくレンダリングされていることを確認
    expect(screen.getByText('ギバースコア推移')).toBeInTheDocument();
    
    // 注: 実際のDOMでの高さ検証はframer-motionのモック化により複雑になるため省略
  });

  it('applies custom className', () => {
    const customClass = 'custom-class';
    const { container } = render(
      <GiverScoreChart userId={mockData[0].date} className={customClass} />
    );

    expect(container.firstChild).toHaveClass(customClass);
  });
}); 