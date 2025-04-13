'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FaHome, 
  FaChartBar, 
  FaBookOpen, 
  FaCog, 
  FaRegStar,
  FaPlus
} from 'react-icons/fa';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  
  const navItems = [
    { href: '/dashboard', icon: <FaHome />, label: 'ホーム' },
    { href: '/dashboard/stats', icon: <FaChartBar />, label: '統計' },
    { href: '/dashboard/materials', icon: <FaBookOpen />, label: '教材' },
    { href: '/dashboard/points', icon: <FaRegStar />, label: 'ポイント' },
    { href: '/dashboard/settings', icon: <FaCog />, label: '設定' },
  ];
  
  return (
    <div className="dashboard-layout min-h-screen bg-gray-50">
      <header className="bg-white shadow-md py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">ShiftWith ダッシュボード</h1>
            <Link href="/create" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
              <FaPlus className="mr-2" />
              教材作成
            </Link>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="md:w-64 flex-shrink-0">
            <nav className="bg-white shadow-md rounded-lg overflow-hidden">
              <ul>
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-4 py-3 hover:bg-gray-50 transition-colors ${
                        pathname === item.href ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' : 'text-gray-700'
                      }`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            
            <div className="bg-white shadow-md rounded-lg p-4 mt-6">
              <h2 className="text-lg font-medium mb-2">今日のTips</h2>
              <p className="text-sm text-gray-600">
                教材を作成することでギバースコアが10ポイント上昇します。自分の知識をシェアして成長しましょう！
              </p>
            </div>
          </aside>
          
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout; 