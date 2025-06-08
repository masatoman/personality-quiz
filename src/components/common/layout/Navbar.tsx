'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaHome, FaSearch, FaEdit, FaUser, FaBell, FaBars, FaSignOutAlt, FaCog, FaUserCircle, FaChartBar } from 'react-icons/fa';
import { getClient } from '@/lib/supabase/client';

const Navbar: React.FC = () => {
  // 初期値を明示的にfalseに設定
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  // クライアントサイドでログイン状態を確認（Supabaseの認証状態を確認）
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        console.log('認証状態の確認を開始します');
        const supabase = getClient();
        const { data: { session } } = await supabase.auth.getSession();
        console.log('セッション状態:', session ? 'ログイン中' : 'ログインなし', session);
        
        // コンポーネントがまだマウントされている場合のみ状態を更新
        if (isMounted) {
          setIsLoggedIn(!!session);
          setAuthChecked(true);
        }
      } catch (error) {
        console.error('認証状態の確認に失敗しました', error);
        if (isMounted) {
          setIsLoggedIn(false);
          setAuthChecked(true);
        }
      }
    };

    checkAuth();

    // 認証状態の変化を監視
    const supabase = getClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('認証状態の変化:', event, session ? 'ログイン中' : 'ログインなし');
      if (isMounted) {
        setIsLoggedIn(!!session);
        setAuthChecked(true);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // isLoggedInの変更を監視
  useEffect(() => {
    console.log('ログイン状態の変更:', isLoggedIn ? 'ログイン中' : 'ログインなし', '認証チェック済み:', authChecked);
  }, [isLoggedIn, authChecked]);

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

  const handleLogout = async () => {
    try {
      const supabase = getClient();
      await supabase.auth.signOut();
      setIsLoggedIn(false);
      setShowProfileMenu(false);
      router.push('/');
    } catch (error) {
      console.error('ログアウトに失敗しました', error);
    }
  };

  // 全てのユーザーに表示するメニュー項目
  const publicMenuItems = [
    { label: 'ホーム', href: '/', icon: <FaHome className="inline mr-2" /> },
    { label: '教材探索', href: '/explore', icon: <FaSearch className="inline mr-2" /> },
  ];

  // ログインユーザーのみに表示するメニュー項目
  const privateMenuItems = [
    { label: 'ダッシュボード', href: '/dashboard', icon: <FaChartBar className="inline mr-2" /> },
    { label: '教材作成', href: '/create', icon: <FaEdit className="inline mr-2" /> },
    { label: 'マイページ', href: '/profile', icon: <FaUser className="inline mr-2" /> },
    { label: '通知', href: '/notifications', icon: <FaBell className="inline mr-2" /> },
  ];

  // 認証チェックが完了しており、ログイン状態の場合のみプライベートメニューを表示
  const visibleMenuItems = [
    ...publicMenuItems, 
    ...(authChecked && isLoggedIn ? privateMenuItems : [])
  ];

  return (
    <nav className="bg-slate-900 border-b border-slate-700 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* ロゴ */}
          <Link href="/" className="text-xl font-bold flex items-center text-white hover:text-blue-300 transition-colors">
            ShiftWith
          </Link>

          {/* PC向けナビゲーション */}
          <div className="hidden md:flex space-x-8 items-center">
            {visibleMenuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center hover:text-blue-300 transition-colors ${
                  pathname === item.href ? 'text-blue-400 font-bold' : 'text-gray-300'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}

            {/* ログイン/新規登録ボタン または プロフィールメニュー */}
            {!isLoggedIn ? (
              <div className="flex space-x-3">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 border border-blue-400 text-blue-400 rounded hover:bg-blue-400 hover:text-white transition-colors"
                >
                  ログイン
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  新規登録
                </Link>
              </div>
            ) : (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center text-white hover:text-blue-300 transition-colors focus:outline-none"
                >
                  <FaUserCircle size={24} className="mr-1" />
                  <span className="hidden lg:inline">マイアカウント</span>
                </button>
                
                {/* プロフィールドロップダウンメニュー */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
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
                )}
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
            {visibleMenuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block py-2 hover:bg-slate-800 rounded px-3 ${
                  pathname === item.href ? 'bg-slate-800 text-blue-400' : 'text-gray-300'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}

            {/* ログイン/新規登録ボタン（モバイル用）またはログアウト */}
            {!isLoggedIn ? (
              <div className="flex flex-col space-y-2 mt-4">
                <Link
                  href="/auth/login"
                  className="block text-center py-2 border border-blue-400 text-blue-400 rounded hover:bg-blue-400 hover:text-white transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  ログイン
                </Link>
                <Link
                  href="/auth/signup"
                  className="block text-center py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  新規登録
                </Link>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 mt-4 border-t border-slate-700 pt-4">
                <Link
                  href="/profile"
                  className="block py-2 hover:bg-slate-800 rounded px-3 text-gray-300"
                  onClick={() => setIsOpen(false)}
                >
                  <FaUser className="inline mr-2" />
                  プロフィール
                </Link>
                <Link
                  href="/profile/settings"
                  className="block py-2 hover:bg-slate-800 rounded px-3 text-gray-300"
                  onClick={() => setIsOpen(false)}
                >
                  <FaCog className="inline mr-2" />
                  設定
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="block text-left py-2 hover:bg-slate-800 rounded px-3 w-full text-gray-300"
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