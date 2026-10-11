import { useEffect } from 'react';
import { go } from '../hooks/useHashRoute.js';

const BADGE_CLASS = {
  예약확정: 'badge-confirmed',
  진료대기: 'badge-waiting',
  진료완료: 'badge-done',
  예약취소: 'badge-canceled',
};

export function StatusBadge({ status }) {
  return (
    <span className={`badge ${BADGE_CLASS[status] || ''}`} data-status={status}>
      {status}
    </span>
  );
}

export function Spinner({ label = '불러오는 중...' }) {
  return (
    <div className="spinner-wrap" role="status">
      <span className="spinner" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorBox({ error, onRetry }) {
  return (
    <div className="error-box" role="alert">
      <p>{error?.message || '데이터를 불러오지 못했습니다.'}</p>
      {onRetry && (
        <button className="btn btn-outline" onClick={onRetry}>
          다시 시도
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, desc, action }) {
  return (
    <div className="empty">
      <div className="empty-icon">🗂️</div>
      <h4>{title}</h4>
      {desc && <p>{desc}</p>}
      {action}
    </div>
  );
}

export function Modal({ title, onClose, children, footer, size = 'md', name, bugId }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal modal-${size}`} role="dialog" aria-modal="true" aria-label={title} data-modal={name} data-bug-id={bugId}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" aria-label="닫기" onClick={onClose} data-role="modal-close" data-bug-id={bugId}>
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function Toasts({ toasts, onDismiss }) {
  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`} data-toast={t.type}>
          <span>{t.type === 'success' ? '✔' : t.type === 'error' ? '⚠' : 'ℹ'}</span>
          <p>{t.message}</p>
          <button className="icon-btn" aria-label="알림 닫기" onClick={() => onDismiss(t.id)}>
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

const NAV = [
  ['home', '#/', '병원 찾기'],
  ['appointments', '#/appointments', '내 예약'],
  ['notifications', '#/notifications', '알림'],
  ['activity', '#/activity', '활동 로그'],
  ['help', '#/help', '도움말'],
];

export function Header({ route, unread, patient, onReset, resetting }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href="#/" onClick={() => go('/')}>
          <span className="brand-mark">✚</span>
          <span className="brand-name">
            Medi<b>Slot</b>
          </span>
        </a>
        <nav className="main-nav" aria-label="주 메뉴">
          {NAV.map(([key, href, label]) => (
            <a key={key} href={href} className={route.name === key ? 'active' : ''} data-nav={key}>
              {label}
              {key === 'notifications' && unread > 0 && <span className="nav-count">{unread}</span>}
            </a>
          ))}
        </nav>
        <div className="header-right">
          <span className="user-chip" data-role="current-patient">
            {patient ? `${patient.name} 님` : '...'}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={onReset} disabled={resetting} data-action="reset">
            {resetting ? '초기화 중...' : '데이터 초기화'}
          </button>
        </div>
      </div>
    </header>
  );
}
