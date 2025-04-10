'use client';

import { useState, useCallback } from 'react';

interface ErrorState {
  message: string;
  code?: string;
  details?: unknown;
}

export function useErrorHandler() {
  const [error, setError] = useState<ErrorState | null>(null);

  const handleError = useCallback((error: unknown) => {
    if (error instanceof Error) {
      setError({
        message: error.message,
        details: error
      });
    } else if (typeof error === 'string') {
      setError({
        message: error
      });
    } else {
      setError({
        message: '予期せぬエラーが発生しました。',
        details: error
      });
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError
  };
} 