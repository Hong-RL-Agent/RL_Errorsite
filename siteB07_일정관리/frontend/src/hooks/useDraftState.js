import { useCallback, useEffect, useState } from 'react';

const PREFIX = 'daynest.draft.';

export function clearDraft(key) {
  if (!key) return;
  try { sessionStorage.removeItem(PREFIX + key); } catch (e) { /* ignore */ }
}

// key 가 있으면 입력 중인 폼 상태를 sessionStorage 에 보관/복원한다. key 가 없으면 일반 useState 와 같다.
export function useDraftState(key, initial) {
  const [state, setState] = useState(() => {
    if (key) {
      try {
        const raw = sessionStorage.getItem(PREFIX + key);
        if (raw) return { ...initial, ...JSON.parse(raw) };
      } catch (e) { /* ignore */ }
    }
    return initial;
  });

  useEffect(() => {
    if (!key) return;
    try {
      if (JSON.stringify(state) !== JSON.stringify(initial)) sessionStorage.setItem(PREFIX + key, JSON.stringify(state));
      else sessionStorage.removeItem(PREFIX + key);
    } catch (e) { /* ignore */ }
  }, [key, state]); // eslint-disable-line react-hooks/exhaustive-deps

  const clear = useCallback(() => clearDraft(key), [key]);
  return [state, setState, clear];
}

// 짧은 텍스트 입력용: localStorage 에 보관 (새로고침 후에도 복구)
export function usePersistedText(key) {
  const storeKey = `daynest.text.${key}`;
  const [text, setText] = useState(() => { try { return localStorage.getItem(storeKey) || ''; } catch (e) { return ''; } });
  useEffect(() => {
    try { if (text) localStorage.setItem(storeKey, text); else localStorage.removeItem(storeKey); } catch (e) { /* ignore */ }
  }, [storeKey, text]);
  return [text, setText];
}
