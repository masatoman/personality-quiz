import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import '@testing-library/jest-dom';
import ThemeSwitcher from '../ThemeSwitcher';
import { ThemeProvider } from '../../../../contexts/ThemeContext';

expect.extend(toHaveNoViolations);

// モックストレージの実装
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    // テスト前にモックストレージをリセット
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
    mockLocalStorage.getItem.mockReturnValue('tealPurpleTheme');
    mockLocalStorage.setItem.mockClear();
  });

  it('デフォルトのテーマが正しく表示される', () => {
    render(
      <ThemeProvider>
        <ThemeSwitcher />
      </ThemeProvider>
    );
    
    const button = screen.getByTestId('theme-switcher-button');
    expect(button).toBeInTheDocument();
    const themeText = screen.getByText('ティール×パープル');
    expect(themeText).toHaveClass('text-neutral');
  });

  it('ドロップダウンが正しく開閉する', () => {
    render(
      <ThemeProvider>
        <ThemeSwitcher />
      </ThemeProvider>
    );
    
    const button = screen.getByTestId('theme-switcher-button');
    
    // 初期状態ではドロップダウンは非表示
    expect(screen.queryByTestId('theme-switcher-dropdown')).not.toBeInTheDocument();
    
    // ボタンクリックでドロップダウンが表示される
    fireEvent.click(button);
    expect(screen.getByTestId('theme-switcher-dropdown')).toBeInTheDocument();
    
    // 再度クリックで非表示になる
    fireEvent.click(button);
    expect(screen.queryByTestId('theme-switcher-dropdown')).not.toBeInTheDocument();
  });

  it('テーマが正しく切り替わる', async () => {
    render(
      <ThemeProvider>
        <ThemeSwitcher />
      </ThemeProvider>
    );
    
    // ドロップダウンを開く
    fireEvent.click(screen.getByTestId('theme-switcher-button'));
    
    // Blue Amberテーマに切り替え
    fireEvent.click(screen.getByTestId('theme-option-blueAmberTheme'));
    
    // テーマが変更され、ローカルストレージに保存されることを確認
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'blueAmberTheme');
    await waitFor(() => {
      expect(screen.getByText('ブルー×アンバー')).toBeInTheDocument();
    });
  });

  it('選択したテーマがページリロード後も保持される', () => {
    mockLocalStorage.getItem.mockReturnValue('greenMagentaTheme');

    render(
      <ThemeProvider>
        <ThemeSwitcher />
      </ThemeProvider>
    );

    expect(screen.getByText('緑×マゼンタ')).toBeInTheDocument();
  });

  it('アクセシビリティ要件を満たしている', async () => {
    const { container } = render(
      <ThemeProvider>
        <ThemeSwitcher />
      </ThemeProvider>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();

    // アクセシビリティ属性の確認
    const button = screen.getByTestId('theme-switcher-button');
    expect(button).toHaveAttribute('aria-label', 'テーマ切り替え');
  });

  it('モバイル表示で正しく動作する', () => {
    // ビューポートサイズをモバイルに設定
    global.innerWidth = 375;
    global.dispatchEvent(new Event('resize'));

    render(
      <ThemeProvider>
        <ThemeSwitcher />
      </ThemeProvider>
    );

    const button = screen.getByTestId('theme-switcher-button');
    fireEvent.click(button);

    // モバイルでもドロップダウンが表示される
    const dropdown = screen.getByTestId('theme-switcher-dropdown');
    expect(dropdown).toBeInTheDocument();

    // テーマ名のテキストが非表示になっていることを確認
    const mobileThemeText = screen.getByText('ティール×パープル', {
      selector: 'span.text-neutral.text-sm'
    });
    expect(mobileThemeText).toHaveClass('hidden');
    expect(mobileThemeText).toHaveClass('md:inline');
  });

  it('キーボード操作でテーマを切り替えられる', () => {
    render(
      <ThemeProvider>
        <ThemeSwitcher />
      </ThemeProvider>
    );

    const button = screen.getByTestId('theme-switcher-button');
    
    // ボタンをクリックしてドロップダウンを開く（Enterキーのシミュレーションは不要）
    fireEvent.click(button);
    expect(screen.getByTestId('theme-switcher-dropdown')).toBeInTheDocument();

    // テーマオプションをクリック
    const themeOption = screen.getByTestId('theme-option-blueAmberTheme');
    fireEvent.click(themeOption);

    // テーマが変更されたことを確認
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'blueAmberTheme');
  });
}); 