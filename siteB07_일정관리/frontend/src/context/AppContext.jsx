import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, logAction } from '../api';
import { viewSnapshots } from '../utils/viewSnapshots';

const AppContext = createContext(null);
const OFFLINE_KEY = 'daynest.offline';

const readOffline = () => { try { return localStorage.getItem(OFFLINE_KEY) === '1'; } catch (e) { return false; } };

function clearAppStorage() {
  [sessionStorage, localStorage].forEach((store) => {
    try {
      Object.keys(store).filter((k) => k.startsWith('daynest.')).forEach((k) => store.removeItem(k));
    } catch (e) { /* ignore */ }
  });
}

export function AppProvider({ children, onResetDone }) {
  const navigate = useNavigate();
  const [today, setToday] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [offline, setOfflineState] = useState(readOffline);
  const [toastMsg, setToast] = useState('');
  const [dataVersion, setDataVersion] = useState(0);
  const [createDate, setCreateDate] = useState(null);

  useEffect(() => {
    let alive = true;
    Promise.all([api.health(), api.categories()])
      .then(([h, c]) => { if (alive) { setToday(h.data.today); setCategories(c.data); } })
      .catch(() => alive && setLoadError('서버에 연결할 수 없어요. 백엔드(9721)가 실행 중인지 확인해 주세요.'));
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!toastMsg) return undefined;
    const t = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(t);
  }, [toastMsg]);

  const setOffline = useCallback((value) => {
    try { if (value) localStorage.setItem(OFFLINE_KEY, '1'); else localStorage.removeItem(OFFLINE_KEY); } catch (e) { /* ignore */ }
    setOfflineState(value);
    logAction('offline_mode', value ? 'on' : 'off');
  }, []);

  const guardOnline = useCallback(() => {
    if (offline) {
      setToast('오프라인 모드에서는 서버에 저장하지 않아요. 온라인으로 전환한 뒤 저장해 주세요.');
      return false;
    }
    return true;
  }, [offline]);

  const bumpData = useCallback(() => setDataVersion((v) => v + 1), []);

  const resetAll = useCallback(async () => {
    await api.reset();
    viewSnapshots.clear();
    clearAppStorage();
    window.__dayNestActions = [];
    navigate('/calendar/month', { replace: true });
    onResetDone();
  }, [navigate, onResetDone]);

  useEffect(() => {
    window.__dayNestReset = resetAll;
    window.__dayNestState = Object.assign(window.__dayNestState || {}, { offline, dataVersion });
  }, [resetAll, offline, dataVersion]);

  const value = useMemo(() => ({
    today, categories, offline, setOffline, guardOnline, toast: setToast, dataVersion, bumpData,
    createDate, openCreate: setCreateDate, resetAll,
  }), [today, categories, offline, setOffline, guardOnline, dataVersion, bumpData, createDate, resetAll]);

  if (loadError) return <div className="boot-msg">{loadError}</div>;
  if (!today) return <div className="boot-msg">DayNest 를 불러오는 중…</div>;

  return (
    <AppContext.Provider value={value}>
      {children}
      {toastMsg && <div className="toast" role="status">{toastMsg}</div>}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
