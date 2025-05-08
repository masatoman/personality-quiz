'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';

// テーマの型定義
export type ThemeName = 'tealPurpleTheme' | 'blueAmberTheme' | 'greenMagentaTheme';

interface ThemeContextType {
  currentTheme: ThemeName;
  changeTheme: (theme: ThemeName) => void;
  themeColors: typeof themeColors;
  isLoading: boolean;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

// カラーをRGBに変換するヘルパー関数
const hexToRgb = (hex: string): string => {
  try {
    // 有効な16進数カラーコードかチェック
    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      throw new Error(`無効なカラーコード: ${hex}`);
    }
    
    // #を取り除く
    hex = hex.replace('#', '');
    
    // RGB値に変換
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `${r}, ${g}, ${b}`;
  } catch (error) {
    console.error('RGB変換エラー:', error);
    return '0, 0, 0'; // フォールバック値
  }
};

// テーマの色定義
const themeColors = {
  tealPurpleTheme: {
    primary: '#1A9A9D',
    primaryLight: '#2DB6B9',
    primaryDark: '#158385',
    accent: '#6B2D90',
    accentLight: '#8039AB',
    accentDark: '#572476',
    secondary: '#4ECDC4',
    secondaryLight: '#6AD9D2',
    secondaryDark: '#39B3AA',
    neutral: '#1D3461',
    neutralLight: '#274580',
    neutralDark: '#152648',
    base: '#F7F9FC',
    base100: '#F7F9FC',
    base200: '#EDF1F7',
    base300: '#E2E8F0',
  },
  blueAmberTheme: {
    primary: '#2D5DA1',
    primaryLight: '#4978BC',
    primaryDark: '#234A87',
    accent: '#F39237',
    accentLight: '#F5A85F',
    accentDark: '#D97A25',
    secondary: '#7FB3D5',
    secondaryLight: '#9DC5E0',
    secondaryDark: '#5F99C4',
    neutral: '#364156',
    neutralLight: '#4A5675',
    neutralDark: '#2A3344',
    base: '#F5F7FA',
    base100: '#F5F7FA',
    base200: '#E9EEF5',
    base300: '#DCE4F0',
  },
  greenMagentaTheme: {
    primary: '#00A896',
    primaryLight: '#05C6B1',
    primaryDark: '#008B7B',
    accent: '#C33764',
    accentLight: '#D85980',
    accentDark: '#A82D54',
    secondary: '#6BD5BD',
    secondaryLight: '#8BDECB',
    secondaryDark: '#4FC1A6',
    neutral: '#2D3142',
    neutralLight: '#3E4359',
    neutralDark: '#20232F',
    base: '#EDF2F4',
    base100: '#EDF2F4',
    base200: '#DDE5E9',
    base300: '#CCD8DE',
  },
};

// コンテキストの作成
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// テーマフックを使用するためのカスタムフック
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// テーマプロバイダーコンポーネント
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('tealPurpleTheme');
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // テーマの色をCSSカスタムプロパティに適用
  const applyThemeColors = useCallback((theme: ThemeName) => {
    // サーバーサイドレンダリング時には実行しない
    if (typeof document === 'undefined') return;
    
    const colors = themeColors[theme];
    const root = document.documentElement;
    
    // バッチ処理のためにRequestAnimationFrameを使用
    requestAnimationFrame(() => {
      try {
        // メインカラー
        root.style.setProperty('--color-primary', colors.primary);
        root.style.setProperty('--color-primary-light', colors.primaryLight);
        root.style.setProperty('--color-primary-dark', colors.primaryDark);
        root.style.setProperty('--color-primary-rgb', hexToRgb(colors.primary));
        root.style.setProperty('--color-primary-light-rgb', hexToRgb(colors.primaryLight));
        root.style.setProperty('--color-primary-dark-rgb', hexToRgb(colors.primaryDark));

        // アクセントカラー
        root.style.setProperty('--color-accent', colors.accent);
        root.style.setProperty('--color-accent-light', colors.accentLight);
        root.style.setProperty('--color-accent-dark', colors.accentDark);
        root.style.setProperty('--color-accent-rgb', hexToRgb(colors.accent));
        root.style.setProperty('--color-accent-light-rgb', hexToRgb(colors.accentLight));
        root.style.setProperty('--color-accent-dark-rgb', hexToRgb(colors.accentDark));

        // 補助カラー
        root.style.setProperty('--color-secondary', colors.secondary);
        root.style.setProperty('--color-secondary-light', colors.secondaryLight);
        root.style.setProperty('--color-secondary-dark', colors.secondaryDark);
        root.style.setProperty('--color-secondary-rgb', hexToRgb(colors.secondary));
        root.style.setProperty('--color-secondary-light-rgb', hexToRgb(colors.secondaryLight));
        root.style.setProperty('--color-secondary-dark-rgb', hexToRgb(colors.secondaryDark));

        // ニュートラルカラー
        root.style.setProperty('--color-neutral', colors.neutral);
        root.style.setProperty('--color-neutral-light', colors.neutralLight);
        root.style.setProperty('--color-neutral-dark', colors.neutralDark);
        root.style.setProperty('--color-neutral-rgb', hexToRgb(colors.neutral));
        root.style.setProperty('--color-neutral-light-rgb', hexToRgb(colors.neutralLight));
        root.style.setProperty('--color-neutral-dark-rgb', hexToRgb(colors.neutralDark));

        // ベースカラー
        root.style.setProperty('--color-base', colors.base);
        root.style.setProperty('--color-base-100', colors.base100);
        root.style.setProperty('--color-base-200', colors.base200);
        root.style.setProperty('--color-base-300', colors.base300);
        root.style.setProperty('--color-base-rgb', hexToRgb(colors.base));
        root.style.setProperty('--color-base-100-rgb', hexToRgb(colors.base100));
        root.style.setProperty('--color-base-200-rgb', hexToRgb(colors.base200));
        root.style.setProperty('--color-base-300-rgb', hexToRgb(colors.base300));

        // トランジションの追加
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
      } catch (error) {
        console.error('テーマ適用エラー:', error);
      }
    });
  }, []);

  const changeTheme = useCallback((theme: ThemeName) => {
    setCurrentTheme(theme);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('theme', theme);
      } catch (error) {
        console.error('ローカルストレージ保存エラー:', error);
      }
    }
    applyThemeColors(theme);
  }, [applyThemeColors]);

  // ダークモード切り替え
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => {
      const newValue = !prev;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('darkMode', newValue ? 'dark' : 'light');
          document.documentElement.classList.toggle('dark', newValue);
        } catch (error) {
          console.error('ダークモード設定保存エラー:', error);
        }
      }
      return newValue;
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    const initializeTheme = async () => {
      try {
        const savedTheme = localStorage.getItem('theme') as ThemeName | null;
        if (savedTheme && Object.keys(themeColors).includes(savedTheme)) {
          setCurrentTheme(savedTheme);
          await new Promise(resolve => requestAnimationFrame(resolve));
          applyThemeColors(savedTheme);
        } else {
          await new Promise(resolve => requestAnimationFrame(resolve));
          applyThemeColors('tealPurpleTheme');
        }

        // ダークモード設定を読み込む
        const savedDarkMode = localStorage.getItem('darkMode');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldUseDarkMode = savedDarkMode ? savedDarkMode === 'dark' : prefersDark;
        
        setIsDarkMode(shouldUseDarkMode);
        document.documentElement.classList.toggle('dark', shouldUseDarkMode);
      } catch (error) {
        console.error('テーマ初期化エラー:', error);
        await new Promise(resolve => requestAnimationFrame(resolve));
        applyThemeColors('tealPurpleTheme');
      } finally {
        setIsLoading(false);
      }
    };

    initializeTheme();
  }, [applyThemeColors]);

  const contextValue = useMemo(() => ({
    currentTheme,
    changeTheme,
    themeColors,
    isLoading,
    isDarkMode,
    toggleDarkMode
  }), [currentTheme, changeTheme, isLoading, isDarkMode, toggleDarkMode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}; 