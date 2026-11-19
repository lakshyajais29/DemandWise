import React, { useCallback } from 'react';

// Custom hook for toast notifications
export function useToast() {
  const [toasts, setToasts] = React.useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

export const ToastContext = React.createContext({ addToast: () => {} });

export function useToastContext() {
  return React.useContext(ToastContext);
}
