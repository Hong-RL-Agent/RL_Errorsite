import React from 'react';
import { Shield, Clock, User, CheckCircle2 } from 'lucide-react';

export default function AuditLogView({ logs }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>IAM Security Audit Log</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
            Real-time immutable ledger of administrative user interventions
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {logs.length === 0 ? (
          <p style={{ color: 'var(--text-subtle)', textAlign: 'center', padding: '36px' }}>
            No audit records found
          </p>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: '#0f172a',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle2 size={16} color="#10b981" />
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.86rem', color: '#6ee7b7' }}>
                    {log.action}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                    Target: {log.targetUserName || `User #${log.targetUserId}`}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                <span>Actor: {log.adminUser}</span>
                <span>{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
