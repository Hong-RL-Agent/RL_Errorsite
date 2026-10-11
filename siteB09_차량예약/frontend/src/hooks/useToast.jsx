import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [item, setItem] = useState(null);

  const toast = useCallback((message, tone = 'ok') => setItem({ message, tone, id: Date.now() }), []);

  useEffect(() => {
    if (!item) return undefined;
    const t = setTimeout(() => setItem(null), 3600);
    return () => clearTimeout(t);
  }, [item]);

  const value = useMemo(() => ({ toast }), [toast]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      {item && <div className={`toast ${item.tone}`} role="status" aria-live="polite">{item.message}</div>}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext).toast;
