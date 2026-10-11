"use client";

import { useCallback, useState } from "react";

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const pushToast = useCallback((message, type = "success") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 2800);
  }, []);

  return { toasts, pushToast };
}
