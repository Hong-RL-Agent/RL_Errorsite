import React from 'react';
import { X, Shield, Mail, Building, Calendar, KeyRound, Power } from 'lucide-react';

export default function UserDetailDrawer({ user, onClose, onEdit, onToggleStatus, onSendResetLink }) {
  if (!user) return null;

  return (
    <div className="detail-drawer">
      <div className="drawer-header">
        <span className="drawer-title">User Inspector</span>
        <button className="action-btn" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div
          className="user-avatar"
          style={{ width: '56px', height: '56px', fontSize: '1.2rem', margin: '0 auto 12px', background: 'linear-gradient(135deg, #10b981, #047857)' }}
        >
          {user.name.slice(0, 2).toUpperCase()}
        </div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{user.name}</h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-subtle)', marginTop: '2px' }}>{user.email}</p>
      </div>

      <div style={{ flex: 1 }}>
        <div className="drawer-row">
          <span className="drawer-label">User ID</span>
          <span className="drawer-value">#{user.id}</span>
        </div>
        <div className="drawer-row">
          <span className="drawer-label">Role</span>
          <span className={`role-badge ${user.role}`}>{user.role}</span>
        </div>
        <div className="drawer-row">
          <span className="drawer-label">Status</span>
          <span className={`status-pill ${user.isActive ? 'ACTIVE' : 'INACTIVE'}`}>
            <span className="status-dot" />
            <span>{user.isActive ? 'Active' : 'Blocked'}</span>
          </span>
        </div>
        <div className="drawer-row">
          <span className="drawer-label">Department</span>
          <span className="drawer-value">{user.department || 'N/A'}</span>
        </div>
        <div className="drawer-row">
          <span className="drawer-label">Last Login</span>
          <span className="drawer-value">{user.lastLogin || 'Never'}</span>
        </div>
        <div className="drawer-row">
          <span className="drawer-label">Joined</span>
          <span className="drawer-value">
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
        <button
          className="btn-action"
          style={{ justifyContent: 'center', padding: '9px' }}
          onClick={() => {
            onClose();
            onEdit(user);
          }}
        >
          Edit Profile
        </button>

        <button
          className="btn-action btn-reset-link"
          style={{ justifyContent: 'center', padding: '9px' }}
          onClick={() => onSendResetLink(user.id)}
        >
          <KeyRound size={14} />
          <span>Issue Password Reset Link</span>
        </button>

        <button
          className="btn-action"
          style={{
            justifyContent: 'center',
            padding: '9px',
            color: user.isActive ? '#f43f5e' : '#10b981',
            borderColor: user.isActive ? 'rgba(244, 63, 94, 0.4)' : 'rgba(16, 185, 129, 0.4)'
          }}
          onClick={() => onToggleStatus(user.id, !user.isActive)}
        >
          <Power size={14} />
          <span>{user.isActive ? 'Block Account' : 'Unblock Account'}</span>
        </button>
      </div>
    </div>
  );
}
