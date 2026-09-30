import React from 'react';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export default function Toast({ toasts, onClose }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast">
          {toast.type === 'error' ? (
            <AlertTriangle size={18} color="#ef4444" />
          ) : toast.type === 'info' ? (
            <Info size={18} color="#38bdf8" />
          ) : (
            <CheckCircle2 size={18} color="#84cc16" />
          )}
          <span>{toast.message}</span>
          {toast.bugId && (
            <span className="toast-bug-badge">
              {toast.secId || toast.bugId}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
