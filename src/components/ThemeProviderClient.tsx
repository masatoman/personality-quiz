'use client';

import React, { ReactNode } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ThemeSwitcher from './ThemeSwitcher';

interface ThemeProviderClientProps {
  children: ReactNode;
}

const ThemeProviderClient: React.FC<ThemeProviderClientProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <div className="relative">
        {children}
        <div className="absolute right-4 top-4 md:right-8 md:top-5 z-50">
          <ThemeSwitcher />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default ThemeProviderClient; 