import { ReactNode } from 'react';
import Link from 'next/link';
import { HomeIcon, BookOpenIcon, AcademicCapIcon, ChartBarIcon, CogIcon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* サイドバー */}
      <aside className="bg-indigo-600 text-white w-full md:w-64 md:min-h-screen p-4">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">ShiftWith</h2>
        </div>
        <nav>
          <ul className="space-y-2">
            {[
              { name: 'ホーム', href: '/dashboard', icon: HomeIcon },
              { name: '教材', href: '/dashboard/materials', icon: BookOpenIcon },
              { name: '学習', href: '/dashboard/learning', icon: AcademicCapIcon },
              { name: 'ギバースコア', href: '/dashboard/giver-score', icon: ChartBarIcon },
              { name: '設定', href: '/dashboard/settings', icon: CogIcon },
            ].map((item) => (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  className="flex items-center p-2 rounded-lg text-indigo-100 hover:bg-indigo-700"
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* メインコンテンツ */}
      <div className="flex-1">
        {/* ヘッダー */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">ダッシュボード</h1>
          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-gray-700">
              <BellIcon className="h-6 w-6" />
            </button>
            <button className="text-gray-500 hover:text-gray-700">
              <UserCircleIcon className="h-6 w-6" />
            </button>
          </div>
        </header>

        {/* メインコンテンツエリア */}
        <main className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 