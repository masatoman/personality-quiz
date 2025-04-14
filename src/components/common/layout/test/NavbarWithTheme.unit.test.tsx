import React from 'react';
import { render, screen } from '@testing-library/react';
import NavbarWithTheme from '../NavbarWithTheme';

// 必要なコンポーネントのモック
jest.mock('../Navbar', () => {
  return function MockNavbar() {
    return <div data-testid="mock-navbar">Navbar</div>;
  };
});

jest.mock('./ThemeSwitcher', () => {
  return function MockThemeSwitcher() {
    return <div data-testid="mock-theme-switcher">ThemeSwitcher</div>;
  };
});

describe('NavbarWithTheme', () => {
  it('NavbarとThemeSwitcherを正しく表示する', () => {
    render(<NavbarWithTheme />);
    
    expect(screen.getByTestId('mock-navbar')).toBeInTheDocument();
    expect(screen.getByTestId('mock-theme-switcher')).toBeInTheDocument();
  });

  it('ThemeSwitcherが正しい位置に配置される', () => {
    render(<NavbarWithTheme />);
    
    const container = screen.getByTestId('mock-theme-switcher').parentElement;
    expect(container).toHaveClass('absolute right-4 top-4 md:right-8 md:top-5');
  });
}); 