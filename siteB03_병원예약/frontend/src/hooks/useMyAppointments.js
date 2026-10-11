import { useCallback, useEffect, useState } from 'react';
import { listAppointments } from '../api';

export const STATUS_LIST = ['예약확정', '진료대기', '진료완료', '예약취소'];

export const summarize = (items) =>
  items.reduce(
    (acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    },
    { 예약확정: 0, 진료대기: 0, 진료완료: 0, 예약취소: 0 },
  );

// 예약 목록 캐시(list)와 예약 현황 요약 캐시(summary)를 별도로 보관한다.
export function useMyAppointments(patientId) {
  const [list, setList] = useState([]);
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState('loading');

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setStatus('loading');
      try {
        const items = await listAppointments({ patientId });
        setList(items);
        setSummary(summarize(items));
        setStatus('ready');
      } catch {
        setStatus('error');
      }
    },
    [patientId],
  );

  useEffect(() => {
    load();
  }, [load]);

  const patchList = useCallback((updated) => {
    setList((prev) => prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)));
  }, []);

  const syncSummary = useCallback(async () => {
    try {
      const items = await listAppointments({ patientId });
      setSummary(summarize(items));
    } catch {
      /* 요약 갱신 실패는 다음 조회 때 복구 */
    }
  }, [patientId]);

  return { list, summary, status, load, patchList, syncSummary };
}
