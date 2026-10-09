import React from 'react';
import { Edit, KeyRound, Eye, Shield, Power } from 'lucide-react';

export default function UserTable({
  users,
  onOpenDetail,
  onEditUser,
  onToggleStatus,
  onQuickRoleChange,
  onSendResetLink
}) {
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="table-card">
      <table className="admin-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Department</th>
            <th>Role</th>
            <th>Account Status</th>
            <th>Last Active</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-subtle)' }}>
                No users found matching query
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr
                key={user.id}
                onClick={() => onOpenDetail(user)}
                style={{ cursor: 'pointer' }}
                data-user-id={user.id}
              >
                <td>
                  <div className="user-profile-cell">
                    <div className="user-avatar">{getInitials(user.name)}</div>
                    <div>
                      <div className="user-name-text">{user.name}</div>
                      <div className="user-email-text">{user.email}</div>
                    </div>
                  </div>
                </td>

                <td style={{ fontWeight: 500 }}>{user.department || 'General'}</td>

                <td onClick={(e) => e.stopPropagation()}>
                  {/* BUG-936: Quick Role Selector (Brian Lee role update desync) */}
                  <select
                    className={`role-badge ${user.role}`}
                    value={user.role}
                    onChange={(e) => onQuickRoleChange(user.id, e.target.value)}
                    style={{ outline: 'none', cursor: 'pointer', border: 'none' }}
                    title="Change User Role"
                  >
                    <option value="USER">USER</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>

                <td onClick={(e) => e.stopPropagation()}>
                  {/* BUG-889: Active status toggle button (Inversion bug) */}
                  <button
                    className={`status-pill ${user.isActive ? 'ACTIVE' : 'INACTIVE'}`}
                    onClick={() => onToggleStatus(user.id, !user.isActive)}
                    title={user.isActive ? 'Click to Block user' : 'Click to Activate user'}
                  >
                    <span className="status-dot" />
                    <span>{user.isActive ? 'Active' : 'Blocked'}</span>
                  </button>
                </td>

                <td style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                  {user.lastLogin || 'Never'}
                </td>

                <td>
                  <div className="action-group" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="btn-action"
                      title="Edit User Profile"
                      onClick={() => onEditUser(user)}
                    >
                      <Edit size={13} />
                      <span>Edit</span>
                    </button>

                    {/* BUG-2088: Send Password Reset Link (No feedback) */}
                    <button
                      className="btn-action btn-reset-link"
                      title="Send Password Reset Link"
                      onClick={() => onSendResetLink(user.id)}
                    >
                      <KeyRound size={13} />
                      <span>Reset Link</span>
                    </button>

                    <button
                      className="btn-action"
                      title="View Details"
                      onClick={() => onOpenDetail(user)}
                    >
                      <Eye size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
