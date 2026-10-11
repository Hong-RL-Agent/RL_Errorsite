import { useCallback, useEffect, useMemo, useState } from 'react';
import { getHealth, getPatient, resetTestData } from './api';
import { ErrorBox, Header, Spinner, Toasts } from './components/common.jsx';
import { AppContext } from './hooks/AppContext.js';
import { go, useHashRoute } from './hooks/useHashRoute.js';
import { useMyAppointments } from './hooks/useMyAppointments.js';
import { useNotifications } from './hooks/useNotifications.js';
import { useToasts } from './hooks/useToasts.js';
import AppointmentsPage from './pages/AppointmentsPage.jsx';
import HomePage from './pages/HomePage.jsx';
import HospitalPage from './pages/HospitalPage.jsx';
import { ActivityPage, HelpPage, NotificationsPage } from './pages/InfoPages.jsx';

const PATIENT_ID = 1;

export default function App() {
  const route = useHashRoute();
  const { toasts, notify, dismiss, clear } = useToasts();
  const store = useMyAppointments(PATIENT_ID);
  const notifs = useNotifications(PATIENT_ID);
  const [patient, setPatient] = useState(null);
  const [boot, setBoot] = useState({ status: 'loading', error: null });
  const [resetting, setResetting] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const bootstrap = useCallback(async () => {
    setBoot({ status: 'loading', error: null });
    try {
      const [, p] = await Promise.all([getHealth(), getPatient(PATIENT_ID)]);
      setPatient(p);
      setBoot({ status: 'ready', error: null });
    } catch (e) {
      setBoot({ status: 'error', error: e });
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const handleReset = useCallback(async () => {
    setResetting(true);
    try {
      await resetTestData();
      clear();
      go('/');
      window.scrollTo(0, 0);
      setResetKey((k) => k + 1);
      await Promise.all([store.load(), notifs.refresh()]);
      notify('success', '테스트 데이터가 초기화되었습니다.');
    } catch (e) {
      notify('error', e.message);
    } finally {
      setResetting(false);
    }
  }, [clear, notify, store, notifs]);

  useEffect(() => {
    window.__medislotState = {
      route,
      summary: store.summary,
      appointments: store.list.map((a) => ({ id: a.id, status: a.status, date: a.date, time: a.time })),
      unreadNotifications: notifs.unread,
    };
  });

  const ctx = useMemo(
    () => ({ patient, patientId: PATIENT_ID, notify, store, notifs, handleReset, resetting }),
    [patient, notify, store, notifs, handleReset, resetting],
  );

  let page = null;
  if (boot.status === 'ready') {
    switch (route.name) {
      case 'hospital':
        page = <HospitalPage key={`h${route.id}-${resetKey}`} id={route.id} />;
        break;
      case 'appointments':
        page = <AppointmentsPage key={resetKey} selectedId={route.id} />;
        break;
      case 'notifications':
        page = <NotificationsPage key={resetKey} />;
        break;
      case 'activity':
        page = <ActivityPage key={resetKey} />;
        break;
      case 'help':
        page = <HelpPage key={resetKey} />;
        break;
      default:
        page = <HomePage key={resetKey} />;
    }
  }

  return (
    <AppContext.Provider value={ctx}>
      <Header route={route} unread={notifs.unread} patient={patient} onReset={handleReset} resetting={resetting} />
      {boot.status === 'loading' && (
        <main className="page container">
          <Spinner label="MediSlot에 연결하는 중..." />
        </main>
      )}
      {boot.status === 'error' && (
        <main className="page container">
          <ErrorBox error={{ message: '서버에 연결할 수 없습니다. Backend(9717)가 실행 중인지 확인해 주세요.' }} onRetry={bootstrap} />
        </main>
      )}
      {page}
      <footer className="site-footer">MediSlot · 가상 병원 예약 플랫폼 (학습용 데모, 실제 의료기관과 무관)</footer>
      <Toasts toasts={toasts} onDismiss={dismiss} />
    </AppContext.Provider>
  );
}
