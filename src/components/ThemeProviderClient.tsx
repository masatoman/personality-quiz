'use client';

import React from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';

const ThemeProviderClient: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
};

export default ThemeProviderClient; 