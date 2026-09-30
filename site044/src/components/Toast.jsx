import React from 'react';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export default function Toast({ toasts, onClose }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast-item">
          {toast.type === 'error' ? (
            <AlertTriangle size={18} color="#ef4444" />
          ) : toast.type === 'info' ? (
            <Info size={18} color="#f59e0b" />
          ) : (
            <CheckCircle2 size={18} color="#16a34a" />
          )}
          <span>{toast.message}</span>
          {toast.bugId && (
            <span className="toast-badge-tag">
              {toast.secId || toast.bugId}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
