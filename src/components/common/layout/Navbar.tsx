'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaHome, FaSearch, FaEdit, FaUser, FaBell, FaBars, FaSignOutAlt, FaCog, FaUserCircle } from 'react-icons/fa';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  // クライアントサイドでログイン状態を確認（実際はSupabaseなどの認証状態を確認）
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('supabase.auth.token');
        setIsLoggedIn(!!token);
      } catch (error) {
        console.error('認証状態の確認に失敗しました', error);
        setIsLoggedIn(false);
      }
    };

    checkAuth();
  }, []);

  // プロフィールメニュー外のクリックを検知してメニューを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuRef]);

  const handleLogout = () => {
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('is_new_user');
    setIsLoggedIn(false);
    setShowProfileMenu(false);
    router.push('/');
  };

  const menuItems = [
    { label: 'ホーム', href: '/', icon: <FaHome className="inline mr-2" /> },
    { label: '教材探索', href: '/explore', icon: <FaSearch className="inline mr-2" /> },
    { label: '教材作成', href: '/create', icon: <FaEdit className="inline mr-2" /> },
    { label: 'マイページ', href: '/profile', icon: <FaUser className="inline mr-2" /> },
    { label: '通知', href: '/notifications', icon: <FaBell className="inline mr-2" /> },
  ];

  const renderAuthButtons = (isMobile = false) => (
    <div className={`${isMobile ? 'flex flex-col space-y-2 mt-4' : 'flex space-x-3'}`}>
      <Link
        href="/auth/login"
        className={`${
          isMobile
            ? 'block text-center py-2 border border-white rounded hover:bg-white hover:text-blue-600'
            : 'px-4 py-2 border border-white rounded hover:bg-white hover:text-blue-600'
        } transition-colors`}
        onClick={() => setIsOpen(false)}
      >
        ログイン
      </Link>
      <Link
        href="/auth/signup"
        className={`${
          isMobile
            ? 'block text-center py-2 bg-white text-blue-600 rounded hover:bg-blue-100'
            : 'px-4 py-2 bg-white text-blue-600 rounded hover:bg-blue-100'
        } transition-colors`}
        onClick={() => setIsOpen(false)}
      >
        新規登録
      </Link>
    </div>
  );

  const renderProfileMenu = () => (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
      <Link
        href="/profile"
        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        onClick={() => setShowProfileMenu(false)}
      >
        <FaUser className="inline mr-2 text-blue-500" />
        プロフィール
      </Link>
      <Link
        href="/profile/settings"
        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        onClick={() => setShowProfileMenu(false)}
      >
        <FaCog className="inline mr-2 text-gray-500" />
        設定
      </Link>
      <button
        onClick={handleLogout}
        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <FaSignOutAlt className="inline mr-2 text-red-500" />
        ログアウト
      </button>
    </div>
  );

  return (
    <nav className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* ロゴ */}
          <Link href="/" className="text-xl font-bold flex items-center">
            英語学習タイプ診断
          </Link>

          {/* PC向けナビゲーション */}
          <div className="hidden md:flex space-x-8 items-center">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center hover:text-blue-200 transition-colors ${
                  pathname === item.href ? 'font-bold' : ''
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}

            {/* ログイン/新規登録ボタン または プロフィールメニュー */}
            {!isLoggedIn ? (
              renderAuthButtons()
            ) : (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center text-white hover:text-blue-200 transition-colors focus:outline-none"
                >
                  <FaUserCircle size={24} className="mr-1" />
                  <span className="hidden lg:inline">マイアカウント</span>
                </button>
                {showProfileMenu && renderProfileMenu()}
              </div>
            )}
          </div>

          {/* モバイル向けハンバーガーメニュー */}
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            <FaBars size={24} />
          </button>
        </div>

        {/* モバイル向けドロップダウンメニュー */}
        {isOpen && (
          <div className="md:hidden pb-4">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block py-2 hover:bg-blue-700 rounded px-3 ${
                  pathname === item.href ? 'bg-blue-700' : ''
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}

            {/* ログイン/新規登録ボタン（モバイル用）またはプロフィールメニュー */}
            {!isLoggedIn ? (
              renderAuthButtons(true)
            ) : (
              <div className="flex flex-col space-y-2 mt-4 border-t border-blue-400 pt-4">
                <Link
                  href="/profile"
                  className="block py-2 hover:bg-blue-700 rounded px-3"
                  onClick={() => setIsOpen(false)}
                >
                  <FaUser className="inline mr-2" />
                  プロフィール
                </Link>
                <Link
                  href="/profile/settings"
                  className="block py-2 hover:bg-blue-700 rounded px-3"
                  onClick={() => setIsOpen(false)}
                >
                  <FaCog className="inline mr-2" />
                  設定
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 hover:bg-blue-700 rounded px-3"
                >
                  <FaSignOutAlt className="inline mr-2" />
                  ログアウト
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 