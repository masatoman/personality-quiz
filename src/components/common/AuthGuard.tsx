'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LoadingState from './LoadingState';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectUrl?: string;
  fallback?: React.ReactNode;
  requiredRole?: string | string[];
  message?: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  redirectUrl = '/auth/login',
  fallback,
  requiredRole,
  message = '認証が必要なページです。ログインしてください。'
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  
  // 認証状態が変更されたときにアクセス権をチェック
  useEffect(() => {
    if (!loading) {
      // ユーザーが存在するかチェック
      if (!user) {
        setHasAccess(false);
        
        // リダイレクト先URLに現在のパスを含める
        const encodedRedirect = encodeURIComponent(pathname);
        const redirectPath = `${redirectUrl}?redirect=${encodedRedirect}`;
        
        // 非同期でリダイレクト
        setTimeout(() => {
          router.push(redirectPath);
        }, 100);
        
        return;
      }
      
      // ロールが必要な場合はロールをチェック
      if (requiredRole) {
        const userRole = user.profile?.role || 'user';
        
        // 複数のロールが許可されている場合
        if (Array.isArray(requiredRole)) {
          setHasAccess(requiredRole.includes(userRole));
          return;
        }
        
        // 単一ロールの場合
        setHasAccess(userRole === requiredRole);
        return;
      }
      
      // ユーザーが存在し、ロール条件もない場合はアクセス許可
      setHasAccess(true);
    }
  }, [user, loading, pathname, redirectUrl, requiredRole, router]);
  
  // ロード中
  if (loading || hasAccess === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState text="認証状態を確認中..." />
      </div>
    );
  }
  
  // アクセス権がない場合
  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">アクセス制限</h2>
          <p className="text-gray-600 mb-6 max-w-md">
            {message}
          </p>
          <button
            onClick={() => router.push(redirectUrl)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            ログインページへ
          </button>
        </div>
      </div>
    );
  }
  
  // アクセス権がある場合は子コンポーネントを表示
  return <>{children}</>;
};

export default AuthGuard; 