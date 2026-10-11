import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, logAction } from '../api';

const STORAGE_KEY = 'comparelab.comparisonId';
export const MAX_COMPARE = 4;

const CompareContext = createContext(null);

const readStored = () => { try { return sessionStorage.getItem(STORAGE_KEY); } catch (e) { return null; } };
const writeStored = (v) => { try { if (v) sessionStorage.setItem(STORAGE_KEY, v); else sessionStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ } };

export function CompareProvider({ children }) {
  const [comparisonId, setComparisonId] = useState(null);
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [notice, setNotice] = useState('');

  const refreshSummary = useCallback(async (id) => {
    const res = await api.comparisonStats(id);
    setSummary(res.data);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      let cmp = null;
      const stored = readStored();
      if (stored) {
        try { cmp = (await api.comparison(stored)).data; } catch (e) { cmp = null; }
      }
      if (!cmp) {
        cmp = (await api.createComparison({ name: '현재 비교', saved: false })).data;
        writeStored(String(cmp.id));
      }
      if (!alive) return;
      setComparisonId(cmp.id);
      setItems(cmp.products);
      refreshSummary(cmp.id).catch(() => {});
    })().catch(() => setNotice('비교 목록을 불러오지 못했습니다.'));
    return () => { alive = false; };
  }, [refreshSummary]);

  useEffect(() => {
    if (!notice) return undefined;
    const t = setTimeout(() => setNotice(''), 3500);
    return () => clearTimeout(t);
  }, [notice]);

  useEffect(() => {
    window.__compareLabState = Object.assign(window.__compareLabState || {}, {
      compare: { comparisonId, itemIds: items.map((i) => i.id), summary },
    });
  }, [comparisonId, items, summary]);

  const isSelected = useCallback((productId) => items.some((i) => i.id === productId), [items]);

  const addProduct = useCallback(async (product) => {
    if (!comparisonId) return;
    if (items.length >= MAX_COMPARE) { setNotice(`최대 ${MAX_COMPARE}개 상품까지 비교할 수 있어요.`); return; }
    if (items.length && items[0].category.slug !== product.category.slug) {
      setNotice('같은 카테고리의 상품만 함께 비교할 수 있어요.');
      return;
    }
    try {
      const res = await api.addToComparison(comparisonId, product.id);
      setItems(res.data.products);
      logAction('compare_add', `product=${product.id}`);
      await refreshSummary(comparisonId);
    } catch (e) {
      setNotice(e.message);
    }
  }, [comparisonId, items, refreshSummary]);

  const removeProduct = useCallback(async (productId) => {
    if (!comparisonId) return;
    try {
      const res = await api.removeFromComparison(comparisonId, productId);
      setItems(res.data.products);
      logAction('compare_remove', `product=${productId}`);
      // INTENTIONAL_ERROR: B05-ERR05
      // CSV Error: 캐시 상태 불일치
      // Strategy: ACTION_REPLAY
      // Description: 상품 제거 후 비교 요약(summary) 캐시를 다시 조회하지 않아 이전 개수/평균 가격이 유지됨.
    } catch (e) {
      setNotice(e.message);
    }
  }, [comparisonId]);

  const toggleProduct = useCallback((product) => {
    if (items.some((i) => i.id === product.id)) removeProduct(product.id);
    else addProduct(product);
  }, [items, addProduct, removeProduct]);

  const replaceWith = useCallback(async (productIds, name) => {
    if (!comparisonId) return false;
    try {
      const res = await api.updateComparison(comparisonId, { productIds });
      setItems(res.data.products);
      await refreshSummary(comparisonId);
      logAction('compare_load', name || '');
      return true;
    } catch (e) {
      setNotice(e.message);
      return false;
    }
  }, [comparisonId, refreshSummary]);

  const saveCurrent = useCallback(async (name) => {
    if (items.length < 2) { setNotice('2개 이상의 상품을 담아야 저장할 수 있어요.'); return null; }
    try {
      const res = await api.createComparison({ name, saved: true, productIds: items.map((i) => i.id) });
      setNotice('비교 결과를 저장했어요.');
      return res.data;
    } catch (e) {
      setNotice(e.message);
      return null;
    }
  }, [items]);

  const value = useMemo(() => ({
    comparisonId, items, summary, notice, setNotice, isSelected, addProduct, removeProduct, toggleProduct, replaceWith, saveCurrent,
  }), [comparisonId, items, summary, notice, isSelected, addProduct, removeProduct, toggleProduct, replaceWith, saveCurrent]);

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export const useCompare = () => useContext(CompareContext);
export const clearStoredComparison = () => writeStored(null);
