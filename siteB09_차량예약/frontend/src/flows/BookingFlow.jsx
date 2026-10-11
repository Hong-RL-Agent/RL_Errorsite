import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { shiftDate } from '../api';

const STORAGE_KEY = 'roamdrive.flow';
const FlowContext = createContext(null);

const EMPTY_RENTER = { name: '', phone: '', email: '', licenseNo: '' };

const initialState = () => ({
  criteria: { pickup: null, ret: null, sameReturn: true, startDate: '', startTime: '10:00', endDate: '', endTime: '10:00', category: '', seats: '', fuel: '', sort: 'price_asc' },
  vehicle: null,
  protectionPlanId: 0,
  suggestedPlanId: 0,
  addOns: {},
  renter: EMPTY_RENTER,
  compare: [],
});

function load() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return { ...initialState(), ...JSON.parse(raw) };
  } catch (e) { /* ignore */ }
  return initialState();
}

export function clearFlowStorage() {
  try { sessionStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
}

// 검색 조건 → 예약 단계(보험 → 옵션 → 운전자 → 확인)에서 공유하는 상태
export function FlowProvider({ today, children }) {
  const [state, setState] = useState(load);

  useEffect(() => {
    if (state.criteria.startDate) return;
    setState((s) => ({ ...s, criteria: { ...s.criteria, startDate: shiftDate(today, 6), endDate: shiftDate(today, 9) } }));
  }, [today, state.criteria.startDate]);

  useEffect(() => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
    window.__roamState = state;
  }, [state]);

  const setCriteria = useCallback((patch) => setState((s) => ({ ...s, criteria: { ...s.criteria, ...patch } })), []);
  const patch = useCallback((p) => setState((s) => ({ ...s, ...(typeof p === 'function' ? p(s) : p) })), []);

  const toggleCompare = useCallback((vehicle) => {
    setState((s) => {
      const has = s.compare.some((v) => v.id === vehicle.id);
      if (has) return { ...s, compare: s.compare.filter((v) => v.id !== vehicle.id) };
      if (s.compare.length >= 3) return s;
      return { ...s, compare: [...s.compare, vehicle] };
    });
  }, []);

  const resetBooking = useCallback(() => {
    setState((s) => ({ ...s, vehicle: null, protectionPlanId: 0, suggestedPlanId: 0, addOns: {}, renter: EMPTY_RENTER }));
  }, []);

  const startAt = state.criteria.startDate ? `${state.criteria.startDate}T${state.criteria.startTime}` : '';
  const endAt = state.criteria.endDate ? `${state.criteria.endDate}T${state.criteria.endTime}` : '';
  const returnDepot = state.criteria.sameReturn ? state.criteria.pickup : state.criteria.ret;

  // 현재 선택 내용을 서버 요청 형태로 변환
  const toRequest = useCallback((s = state) => ({
    vehicleId: s.vehicle ? s.vehicle.id : null,
    pickupDepotId: s.criteria.pickup ? s.criteria.pickup.id : null,
    returnDepotId: (s.criteria.sameReturn ? s.criteria.pickup : s.criteria.ret) ? (s.criteria.sameReturn ? s.criteria.pickup : s.criteria.ret).id : null,
    startAt: s.criteria.startDate ? `${s.criteria.startDate}T${s.criteria.startTime}` : '',
    endAt: s.criteria.endDate ? `${s.criteria.endDate}T${s.criteria.endTime}` : '',
    protectionPlanId: s.protectionPlanId,
    addOns: Object.entries(s.addOns).filter(([, q]) => q > 0).map(([id, qty]) => ({ id: Number(id), qty })),
  }), [state]);

  const value = useMemo(() => ({
    ...state, startAt, endAt, returnDepot, today, setCriteria, patch, toggleCompare, resetBooking, toRequest,
  }), [state, startAt, endAt, returnDepot, today, setCriteria, patch, toggleCompare, resetBooking, toRequest]);

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

export const useFlow = () => useContext(FlowContext);
