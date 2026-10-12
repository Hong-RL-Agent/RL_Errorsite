import React from 'react';
import { X, Users, Mail, Phone } from 'lucide-react';

export default function UserManagementModal({ isOpen, onClose, users }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} color="var(--brown-800)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brown-900)' }}>
              도서관 등록 회원 및 이용자 목록 ({users.length}명)
            </h3>
          </div>
          <button className="btn btn-outline btn-sm" style={{ padding: '4px', borderRadius: '50%' }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>이용자명</th>
                  <th>소속 학과 / 부서</th>
                  <th>이메일</th>
                  <th>연락처</th>
                  <th style={{ textAlign: 'right' }}>대출 권수</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 700, color: 'var(--brown-900)' }}>{u.name}</td>
                    <td style={{ fontSize: '0.84rem' }}>{u.department}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{u.phone}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: u.borrowed_count > 0 ? 'var(--amber-700)' : 'var(--text-muted)' }}>
                      {u.borrowed_count}권
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-brown" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
