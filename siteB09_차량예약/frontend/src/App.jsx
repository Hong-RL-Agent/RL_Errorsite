import React, { useCallback, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { api } from './api';
import { ToastProvider } from './hooks/useToast';
import { FlowProvider, clearFlowStorage } from './flows/BookingFlow';
import { routeMemory } from './flows/routeMemory';
import Header from './components/Header';
import SearchScreen from './screens/SearchScreen';
import VehicleScreen from './screens/VehicleScreen';
import CompareScreen from './screens/CompareScreen';
import ProtectionScreen from './screens/ProtectionScreen';
import ExtrasScreen from './screens/ExtrasScreen';
import DriverScreen from './screens/DriverScreen';
import ReviewScreen from './screens/ReviewScreen';
import VoucherScreen from './screens/VoucherScreen';
import TripsScreen from './screens/TripsScreen';
import TripDetailScreen from './screens/TripDetailScreen';
import TripEditScreen from './screens/TripEditScreen';
import ArchiveScreen from './screens/ArchiveScreen';
import LogScreen from './screens/LogScreen';

function Shell({ onReset }) {
  const navigate = useNavigate();
  const reset = useCallback(async () => {
    await api.reset();
    routeMemory.clear();
    clearFlowStorage();
    window.__roamActions = [];
    navigate('/', { replace: true });
    onReset();
  }, [navigate, onReset]);

  useEffect(() => { window.__roamReset = reset; }, [reset]);

  return (
    <div className="app">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<SearchScreen />} />
          <Route path="/cars/:id" element={<VehicleScreen />} />
          <Route path="/compare" element={<CompareScreen />} />
          <Route path="/book/protection" element={<ProtectionScreen />} />
          <Route path="/book/extras" element={<ExtrasScreen />} />
          <Route path="/book/driver" element={<DriverScreen />} />
          <Route path="/book/review" element={<ReviewScreen />} />
          <Route path="/book/voucher/:id" element={<VoucherScreen />} />
          <Route path="/trips" element={<TripsScreen />} />
          <Route path="/trips/archive" element={<ArchiveScreen />} />
          <Route path="/trips/:id" element={<TripDetailScreen />} />
          <Route path="/trips/:id/edit" element={<TripEditScreen />} />
          <Route path="/log" element={<LogScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="site-footer">
        <span>RoamDrive · 가상의 테스트 데이터로 구성된 서비스입니다.</span>
        <button type="button" className="link" onClick={reset}>테스트 데이터 초기화</button>
      </footer>
    </div>
  );
}

export default function App() {
  const [epoch, setEpoch] = useState(0);
  const [today, setToday] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.health().then((r) => setToday(r.data.today)).catch(() => setError('서버에 연결할 수 없어요. 백엔드(9723)가 실행 중인지 확인해 주세요.'));
  }, []);

  if (error) return <div className="boot">{error}</div>;
  if (!today) return <div className="boot">RoamDrive 를 불러오는 중…</div>;

  return (
    <ToastProvider>
      <FlowProvider key={epoch} today={today}>
        <Shell onReset={() => setEpoch((e) => e + 1)} />
      </FlowProvider>
    </ToastProvider>
  );
}
