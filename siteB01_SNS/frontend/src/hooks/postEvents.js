import { useEffect, useRef } from 'react';

// 게시물 상태 변경(좋아요/저장/삭제 등)을 화면 간에 전달하는 간단한 이벤트 버스
const listeners = new Set();

export function emitPostEvent(event) {
  listeners.forEach((fn) => fn(event));
}

export function usePostEvents(handler) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    const fn = (event) => ref.current(event);
    listeners.add(fn);
    return () => listeners.delete(fn);
  }, []);
}
