import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navigation from '../Navigation';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/'
  })
}));

describe('Navigation', () => {
  it('すべてのナビゲーションリンクを表示する', () => {
    render(<Navigation />);
    expect(screen.getByText('ホーム')).toBeInTheDocument();
    expect(screen.getByText('教材一覧')).toBeInTheDocument();
    expect(screen.getByText('ギバー診断')).toBeInTheDocument();
    expect(screen.getByText('ランキング')).toBeInTheDocument();
  });

  it('アクティブなリンクにアクティブクラスを適用する', () => {
    render(<Navigation />);
    const activeLink = screen.getByText('ホーム').closest('a');
    expect(activeLink).toHaveClass('text-primary');
  });

  it('非アクティブなリンクにデフォルトクラスを適用する', () => {
    render(<Navigation />);
    const inactiveLink = screen.getByText('教材一覧').closest('a');
    expect(inactiveLink).toHaveClass('text-gray-600');
  });
}); 