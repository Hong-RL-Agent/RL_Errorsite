import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useDraftState } from '../hooks/useDraftState';
import { REMINDER_LABEL, REPEAT_LABEL, STATUS_LABEL } from '../utils/date';

export function blankForm(date) {
  return {
    title: '', description: '', startDate: date, endDate: date, startTime: '09:00', endTime: '10:00', location: '',
    categoryId: 1, repeatRule: 'none', repeatCount: 4, reminder: '30m', status: 'scheduled',
  };
}

export function formFromEvent(ev) {
  return {
    title: ev.title, description: ev.description, startDate: ev.startDate, endDate: ev.endDate, startTime: ev.startTime, endTime: ev.endTime,
    location: ev.location, categoryId: ev.categoryId, repeatRule: ev.repeatRule, repeatCount: 4, reminder: ev.reminder, status: ev.status,
  };
}

// 일정 작성/수정 폼 (모달 · 전체 화면 공용)
export default function EventEditor({
  initial, mode = 'create', variant = 'page', draftKey = null, bugId, onSubmit, onCancel, onPreview, isSeries = false,
}) {
  const { categories, guardOnline } = useApp();
  const [form, setForm, clearFormDraft] = useDraftState(draftKey, initial);
  const [applyToSeries, setApplyToSeries] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setStart = (e) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, startDate: v, endDate: f.endDate < v ? v : f.endDate }));
  };

  const validate = () => {
    if (!form.title.trim()) return '제목을 입력해 주세요.';
    if (!form.startDate || !form.endDate) return '날짜를 선택해 주세요.';
    if (form.endDate < form.startDate) return '종료일은 시작일보다 빠를 수 없어요.';
    if (form.endDate === form.startDate && form.endTime <= form.startTime) return '종료 시간은 시작 시간보다 늦어야 해요.';
    return '';
  };

  const submit = async (e) => {
    e.preventDefault();
    const msg = validate();
    setError(msg);
    if (msg || !guardOnline()) return;
    setBusy(true);
    try {
      await onSubmit({ ...form, categoryId: Number(form.categoryId), repeatCount: Number(form.repeatCount) }, { applyToSeries });
      clearFormDraft();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const cancel = () => { clearFormDraft(); onCancel(); };

  return (
    <form className={`editor ${variant}`} onSubmit={submit} data-bug-id={bugId}>
      <label className="field full">
        <span>제목</span>
        <input type="text" name="title" value={form.title} maxLength={100} onChange={set('title')} placeholder="일정 제목" autoFocus={variant === 'modal'} />
      </label>
      <div className="field-row">
        <label className="field"><span>시작 날짜</span><input type="date" name="startDate" value={form.startDate} onChange={setStart} /></label>
        <label className="field"><span>시작 시간</span><input type="time" name="startTime" value={form.startTime} onChange={set('startTime')} /></label>
        <label className="field"><span>종료 날짜</span><input type="date" name="endDate" value={form.endDate} min={form.startDate} onChange={set('endDate')} /></label>
        <label className="field"><span>종료 시간</span><input type="time" name="endTime" value={form.endTime} onChange={set('endTime')} /></label>
      </div>
      <div className="field-row">
        <label className="field">
          <span>카테고리</span>
          <select name="categoryId" value={form.categoryId} onChange={set('categoryId')}>
            {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
        </label>
        <label className="field"><span>장소</span><input type="text" name="location" value={form.location} maxLength={100} onChange={set('location')} placeholder="장소" /></label>
        <label className="field">
          <span>알림</span>
          <select name="reminder" value={form.reminder} onChange={set('reminder')}>
            {Object.entries(REMINDER_LABEL).map(([v, l]) => (<option key={v} value={v}>{l}</option>))}
          </select>
        </label>
        {mode === 'edit' && (
          <label className="field">
            <span>상태</span>
            <select name="status" value={form.status} onChange={set('status')}>
              {Object.entries(STATUS_LABEL).map(([v, l]) => (<option key={v} value={v}>{l}</option>))}
            </select>
          </label>
        )}
      </div>
      {mode === 'create' && (
        <div className="field-row">
          <label className="field">
            <span>반복</span>
            <select name="repeatRule" value={form.repeatRule} onChange={set('repeatRule')}>
              {Object.entries(REPEAT_LABEL).map(([v, l]) => (<option key={v} value={v}>{l}</option>))}
            </select>
          </label>
          {form.repeatRule !== 'none' && (
            <label className="field"><span>반복 횟수</span><input type="number" name="repeatCount" min={1} max={26} value={form.repeatCount} onChange={set('repeatCount')} /></label>
          )}
        </div>
      )}
      {mode === 'edit' && isSeries && (
        <label className="check-line"><input type="checkbox" checked={applyToSeries} onChange={(e) => setApplyToSeries(e.target.checked)} /> 이후 반복 일정에도 같은 제목·시간·장소 적용</label>
      )}
      <label className="field full">
        <span>상세 메모</span>
        <textarea name="description" rows={variant === 'modal' ? 3 : 5} value={form.description} onChange={set('description')} placeholder="상세 메모" />
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="editor-actions">
        {onPreview && <button type="button" className="btn ghost" onClick={() => onPreview(form)}>임시 미리보기</button>}
        <button type="button" className="btn ghost" onClick={cancel}>취소</button>
        <button type="submit" className="btn primary" disabled={busy}>{mode === 'create' ? '일정 저장' : '수정 저장'}</button>
      </div>
    </form>
  );
}
