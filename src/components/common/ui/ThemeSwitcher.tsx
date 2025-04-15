'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme, ThemeName } from '../../../contexts/ThemeContext';

const ThemeSwitcher: React.FC = () => {
  const { currentTheme, changeTheme, themeColors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // テーマ名の表示用マッピング
  const themeDisplayNames: Record<ThemeName, string> = {
    tealPurpleTheme: 'ティール×パープル',
    blueAmberTheme: 'ブルー×アンバー',
    greenMagentaTheme: '緑×マゼンタ',
  };

  // テーマのアイコン表示用の色
  const getThemePreviewColors = (themeName: ThemeName) => {
    const colors = themeColors[themeName];
    return {
      primary: colors.primary,
      accent: colors.accent,
    };
  };

  // ドロップダウン以外をクリックした時に閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // テーマを変更する
  const handleThemeChange = (theme: ThemeName) => {
    changeTheme(theme);
    setIsOpen(false);
  };

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-md bg-base-100 border border-base-300 hover:bg-base-200 transition-colors"
        aria-label="テーマ切り替え"
        data-testid="theme-switcher-button"
      >
        <div className="flex">
          <span 
            className="block w-4 h-4 rounded-full mr-1" 
            style={{ backgroundColor: getThemePreviewColors(currentTheme).primary }}
          />
          <span 
            className="block w-4 h-4 rounded-full" 
            style={{ backgroundColor: getThemePreviewColors(currentTheme).accent }}
          />
        </div>
        <span className="text-neutral text-sm hidden md:inline">
          {themeDisplayNames[currentTheme]}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div 
          className="absolute mt-2 right-0 w-52 bg-base-100 border border-base-300 rounded-md shadow-lg py-1 transition-all duration-200 ease-in-out transform origin-top-right"
          data-testid="theme-switcher-dropdown"
        >
          {Object.entries(themeDisplayNames).map(([themeName, displayName]) => (
            <button
              key={themeName}
              onClick={() => handleThemeChange(themeName as ThemeName)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-base-200 flex items-center space-x-2 transition-colors ${
                currentTheme === themeName ? 'bg-base-200 text-primary' : 'text-neutral'
              }`}
              data-testid={`theme-option-${themeName}`}
            >
              <div className="flex">
                <span 
                  className="block w-4 h-4 rounded-full mr-1" 
                  style={{ backgroundColor: getThemePreviewColors(themeName as ThemeName).primary }}
                />
                <span 
                  className="block w-4 h-4 rounded-full" 
                  style={{ backgroundColor: getThemePreviewColors(themeName as ThemeName).accent }}
                />
              </div>
              <span>{displayName}</span>
              {currentTheme === themeName && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher; 