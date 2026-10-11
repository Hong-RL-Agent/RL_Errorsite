import { useCallback, useEffect, useState } from 'react';
import { listNotifications, markNotificationRead } from '../api';

export function useNotifications(patientId) {
  const [items, setItems] = useState([]);

  const refresh = useCallback(async () => {
    try {
      setItems(await listNotifications({ patientId }));
    } catch {
      /* 알림 조회 실패는 화면 동작에 영향을 주지 않음 */
    }
  }, [patientId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const markRead = useCallback(async (id) => {
    const updated = await markNotificationRead(id);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, ...updated } : n)));
  }, []);

  const unread = items.filter((n) => !n.is_read).length;
  return { items, unread, refresh, markRead };
}
