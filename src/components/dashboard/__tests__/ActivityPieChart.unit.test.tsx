import React from 'react';
import { render, screen } from '@testing-library/react';
import ActivityPieChart from '../ActivityPieChart';

// recharts はテスト環境ではエラーになるため、モック化する
jest.mock('recharts', () => ({
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie">{children}</div>
  ),
  Cell: () => <div data-testid="cell" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

describe('ActivityPieChart', () => {
  const mockActivityCounts = {
    CREATE_CONTENT: 5,
    PROVIDE_FEEDBACK: 3,
    CONSUME_CONTENT: 10,
    COMPLETE_QUIZ: 2
  };

  it('renders the chart with title', () => {
    render(<ActivityPieChart activityCounts={mockActivityCounts} />);
    
    expect(screen.getByText('活動種類')).toBeInTheDocument();
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('renders with default height', () => {
    render(<ActivityPieChart activityCounts={mockActivityCounts} />);
    
    const container = screen.getByTestId('responsive-container');
    expect(container).toHaveAttribute('height', '300');
  });

  it('renders with custom height', () => {
    render(<ActivityPieChart activityCounts={mockActivityCounts} height={400} />);
    
    const container = screen.getByTestId('responsive-container');
    expect(container).toHaveAttribute('height', '400');
  });

  it('displays message when there is no activity data', () => {
    const emptyActivityCounts = {
      CREATE_CONTENT: 0,
      PROVIDE_FEEDBACK: 0,
      CONSUME_CONTENT: 0,
      COMPLETE_QUIZ: 0
    };
    
    render(<ActivityPieChart activityCounts={emptyActivityCounts} />);
    
    expect(screen.getByText('まだ活動データがありません')).toBeInTheDocument();
    expect(screen.queryByTestId('pie')).not.toBeInTheDocument();
  });
}); 