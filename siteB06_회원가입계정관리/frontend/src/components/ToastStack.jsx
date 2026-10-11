"use client";

export default function ToastStack({ toasts }) {
  return (
    <div className="toastStack" aria-live="polite">
      {toasts.map((toast) => <div className={`toast ${toast.type}`} key={toast.id}>{toast.message}</div>)}
    </div>
  );
}
