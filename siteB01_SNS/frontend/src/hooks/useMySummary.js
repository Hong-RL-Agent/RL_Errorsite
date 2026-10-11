import { useEffect, useState } from 'react';
import { getMe } from '../api';

// 우측 프로필 요약은 모듈 단위 캐시를 사용한다. (새로고침 시 캐시가 비워진다)
let cachedSummary = null;
const subscribers = new Set();

function publish(value) {
  cachedSummary = value;
  subscribers.forEach((fn) => fn(value));
}

export async function refreshMySummary() {
  const me = await getMe();
  publish(me);
  return me;
}

export function clearSummaryCache() {
  publish(null);
}

export function useMySummary() {
  const [summary, setSummary] = useState(cachedSummary);
  useEffect(() => {
    subscribers.add(setSummary);
    if (!cachedSummary) refreshMySummary().catch(() => {});
    return () => {
      subscribers.delete(setSummary);
    };
  }, []);
  return summary;
}
