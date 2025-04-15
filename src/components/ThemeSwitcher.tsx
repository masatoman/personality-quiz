'use client';

import React from 'react';
import { useTheme, type ThemeName } from '@/contexts/ThemeContext';

const ThemeSwitcher: React.FC = () => {
  const { currentTheme, changeTheme } = useTheme();

  const handleThemeChange = (theme: ThemeName) => {
    changeTheme(theme);
  };

  return (
    <div className="relative inline-block text-left">
      <select
        value={currentTheme}
        onChange={(e) => handleThemeChange(e.target.value as ThemeName)}
        className="block w-full px-4 py-2 text-sm rounded-md bg-base-100 border border-base-300 
                 text-neutral hover:border-primary focus:outline-none focus:ring-2 
                 focus:ring-primary focus:border-primary transition-colors"
        aria-label="テーマを選択"
      >
        <option value="tealPurpleTheme">Teal & Purple</option>
        <option value="blueAmberTheme">Blue & Amber</option>
        <option value="greenMagentaTheme">Green & Magenta</option>
      </select>
    </div>
  );
};

export default ThemeSwitcher; 