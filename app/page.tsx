'use client';

import { useTheme } from '@/contexts/ThemeContext';

export default function Home() {
  const { currentTheme, changeTheme, themeColors } = useTheme();

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">テーマ切り替えテスト</h1>
      
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="font-medium">現在のテーマ:</span>
          <span className="px-3 py-1 rounded bg-primary text-white">
            {currentTheme}
          </span>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => changeTheme('tealPurpleTheme')}
            className="px-4 py-2 rounded bg-primary hover:bg-primary-dark text-white transition-colors"
            aria-label="Teal-Purpleテーマに切り替え"
          >
            Teal-Purple
          </button>
          <button
            onClick={() => changeTheme('blueAmberTheme')}
            className="px-4 py-2 rounded bg-primary hover:bg-primary-dark text-white transition-colors"
            aria-label="Blue-Amberテーマに切り替え"
          >
            Blue-Amber
          </button>
          <button
            onClick={() => changeTheme('greenMagentaTheme')}
            className="px-4 py-2 rounded bg-primary hover:bg-primary-dark text-white transition-colors"
            aria-label="Green-Magentaテーマに切り替え"
          >
            Green-Magenta
          </button>
        </div>
      </div>
    </main>
  );
} 