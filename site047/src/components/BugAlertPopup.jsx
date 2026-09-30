import React from 'react';
import { AlertTriangle, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function BugAlertPopup({ bugAlerts, onDismiss }) {
  if (!bugAlerts || bugAlerts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 24,
      right: 24,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      maxWidth: 440,
      width: 'calc(100% - 48px)'
    }}>
      {bugAlerts.map(bug => (
        <div
          key={bug.id}
          id={`bug-alert-${bug.secId}`}
          style={{
            backgroundColor: '#0f172a',
            color: '#ffffff',
            borderRadius: 16,
            padding: '16px 20px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.35)',
            border: '2px solid #38bdf8',
            animation: 'slideInRight 0.3s ease',
            position: 'relative'
          }}
        >
          {/* Top Banner */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                backgroundColor: '#38bdf8',
                color: '#0f172a',
                padding: '3px 10px',
                borderRadius: 9999,
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '0.5px'
              }}>
                {bug.secId || 'BUG DETECTED'}
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc' }}>
                {bug.name}
              </span>
            </div>

            <button
              onClick={() => onDismiss(bug.id)}
              style={{
                color: '#94a3b8',
                padding: 4,
                borderRadius: 6,
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Description */}
          <p style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5, marginBottom: 8 }}>
            {bug.description}
          </p>

          {/* Metadata Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', borderTop: '1px solid #334155', paddingTop: 6 }}>
            <span>Category: <strong style={{ color: '#38bdf8' }}>{bug.category}</strong></span>
            <span>Family: <strong style={{ color: '#fbbf24' }}>{bug.family}</strong></span>
          </div>
        </div>
      ))}
    </div>
  );
}
