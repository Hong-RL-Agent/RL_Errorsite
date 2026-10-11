import { useCallback, useRef, useState } from 'react';

export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const seq = useRef(0);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const notify = useCallback(
    (type, message) => {
      const id = ++seq.current;
      setToasts((t) => [...t, { id, type, message }]);
      setTimeout(() => dismiss(id), 4200);
    },
    [dismiss],
  );
  const clear = useCallback(() => setToasts([]), []);

  return { toasts, notify, dismiss, clear };
}
