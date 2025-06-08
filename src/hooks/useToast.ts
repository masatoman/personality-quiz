import { useState, useCallback } from 'react';
import { ToastMessage } from '../components/ui/Toast';

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((
    toast: Omit<ToastMessage, 'id'>
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = {
      ...toast,
      id,
      duration: toast.duration || 5000
    };

    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((title: string, description?: string, duration?: number) => {
    return addToast({ type: 'success', title, description, duration });
  }, [addToast]);

  const showError = useCallback((title: string, description?: string, duration?: number) => {
    return addToast({ type: 'error', title, description, duration });
  }, [addToast]);

  const showWarning = useCallback((title: string, description?: string, duration?: number) => {
    return addToast({ type: 'warning', title, description, duration });
  }, [addToast]);

  const showInfo = useCallback((title: string, description?: string, duration?: number) => {
    return addToast({ type: 'info', title, description, duration });
  }, [addToast]);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAll
  };
}; 