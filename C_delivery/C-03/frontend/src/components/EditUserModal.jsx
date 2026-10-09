import React, { useState, useEffect } from 'react';
import { X, UserCheck } from 'lucide-react';

export default function EditUserModal({ isOpen, onClose, user, onSaveUser }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('USER');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setDepartment(user.department || '');
      setRole(user.role || 'USER');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    let targetId = user.id;

    // BUG-182: Wrong Target User Mutation
    // When editing User B (id: 102), the target ID is mistakenly bound to User A (id: 101)
    if (Number(user.id) === 102) {
      targetId = 101; // Mutates Alice Kim instead of Brian Lee!
    }

    onSaveUser(targetId, {
      name: name.trim(),
      email: email.trim(),
      department: department.trim(),
      role
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={18} color="#10b981" />
            <span className="modal-title">Edit User Profile</span>
          </div>
          <button className="action-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                autoFocus
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <input
                type="text"
                className="form-input"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="USER">USER</option>
                <option value="MANAGER">MANAGER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ background: '#059669', borderColor: '#10b981' }}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
