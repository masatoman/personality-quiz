import React from 'react';
import { render, screen } from '@testing-library/react';
import GiverScoreChart from '../GiverScoreChart';

// recharts はテスト環境ではエラーになるため、モック化する
jest.mock('recharts', () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => <div data-testid="chart-line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

describe('GiverScoreChart', () => {
  const mockData = [
    { date: '2023-04-01', score: 0 },
    { date: '2023-04-08', score: 10 },
    { date: '2023-04-15', score: 20 },
  ];

  it('renders the chart with title', () => {
    render(<GiverScoreChart data={mockData} />);
    
    expect(screen.getByText('ギバースコア推移')).toBeInTheDocument();
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('renders with default height', () => {
    render(<GiverScoreChart data={mockData} />);
    
    const container = screen.getByTestId('responsive-container');
    expect(container).toHaveAttribute('height', '300');
  });

  it('renders with custom height', () => {
    render(<GiverScoreChart data={mockData} height={400} />);
    
    const container = screen.getByTestId('responsive-container');
    expect(container).toHaveAttribute('height', '400');
  });

  it('uses sample data when no data is provided', () => {
    render(<GiverScoreChart />);
    
    // サンプルデータが使用されていることを間接的に確認
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });
}); 