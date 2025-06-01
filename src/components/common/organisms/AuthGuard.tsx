'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission, hasAnyPermission } from '@/lib/permissions';
import { Spinner } from '@/components/ui/Spinner';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredPermissions?: string | string[];
  redirectUrl?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requiredPermissions,
  redirectUrl = '/login',
}) => {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (isLoading) return;

      if (!user) {
        setHasAccess(false);
        return;
      }

      if (!requiredPermissions) {
        setHasAccess(true);
        return;
      }

      try {
        if (Array.isArray(requiredPermissions)) {
          // いずれかの権限を持っているか確認
          const hasAccess = await hasAnyPermission(user.id, requiredPermissions);
          setHasAccess(hasAccess);
        } else {
          // 単一の権限を持っているか確認
          const hasAccess = await hasPermission(user.id, requiredPermissions);
          setHasAccess(hasAccess);
        }
      } catch (error) {
        console.error('Error checking permissions:', error);
        setHasAccess(false);
      }
    };

    checkAccess();
  }, [user, isLoading, requiredPermissions]);

  useEffect(() => {
    if (!isLoading && hasAccess === false) {
      router.push(redirectUrl);
    }
  }, [isLoading, hasAccess, redirectUrl, router]);

  if (isLoading || hasAccess === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}; 