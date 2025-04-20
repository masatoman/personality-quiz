'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission, hasAnyPermission } from '@/lib/permissions';
import { Spinner } from '@/components/ui/Spinner';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  message?: string;
  fallback?: React.ReactNode;
  redirectUrl?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requiredRole,
  message = '認証が必要なページです。ログインしてください。',
  fallback,
  redirectUrl = '/auth/login',
}) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [hasAccess, setHasAccess] = useState<boolean>(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (isLoading) return;

      if (!user) {
        setHasAccess(false);
        if (!fallback) {
          const encodedRedirect = encodeURIComponent(pathname);
          const redirectPath = `${redirectUrl}?redirect=${encodedRedirect}`;
          setTimeout(() => {
            router.push(redirectPath);
          }, 100);
        }
        return;
      }

      if (requiredRole) {
        const hasRole = await (Array.isArray(requiredRole)
          ? hasAnyPermission(user.id, requiredRole)
          : hasPermission(user.id, requiredRole));

        setHasAccess(hasRole);
        return;
      }

      setHasAccess(true);
    };

    checkAccess();
  }, [user, isLoading, requiredRole, pathname, router, redirectUrl, fallback]);

  if (isLoading) {
    return <Spinner data-testid="spinner" />;
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="text-center p-4">
        <h2 className="text-xl font-bold mb-2">アクセス制限</h2>
        <p>{message}</p>
      </div>
    );
  }

  return <>{children}</>;
}; 