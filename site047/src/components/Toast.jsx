import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function Toast({ toasts, onRemove }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 size={18} color="#10b981" />,
          error: <AlertCircle size={18} color="#ef4444" />,
          info: <Info size={18} color="#0284c7" />
        };

        return (
          <div 
            key={toast.id} 
            className="toast"
            id={`toast-${toast.id}`}
            style={{
              borderLeft: toast.type === 'error' ? '4px solid #ef4444' : (toast.type === 'success' ? '4px solid #10b981' : '4px solid #0284c7')
            }}
          >
            {icons[toast.type] || icons.info}
            <span>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}
