import React, { useState, useEffect } from 'react';
import { X, Shield, Save, UserCheck } from 'lucide-react';
import { updateUser } from '../lib/api';

export default function UserDetailDrawer({ user, filterContext, onClose, onUpdated, onShowToast }) {
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    position: '',
    role: '',
    phone: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        department: user.department || '',
        position: user.position || '',
        role: user.role || 'VIEWER',
        phone: user.phone || ''
      });
    }
  }, [user]);

  if (!user) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await updateUser(user.emp_no, formData, filterContext);
      if (res.success) {
        onShowToast(`사용자 [${user.name}] 정보가 성공적으로 저장되었습니다.`);
        onUpdated();
        onClose();
      }
    } catch (err) {
      console.error(err);
      onShowToast('사용자 정보 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer-panel" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
              임직원 상세 정보 및 권한 설정
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b' }}>사번: {user.emp_no}</p>
          </div>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={onClose}
            style={{ borderRadius: '50%', padding: '6px' }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="drawer-body">
            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="admin-avatar" style={{ width: 44, height: 44, fontSize: '16px' }}>
                  {user.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>{user.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{user.email}</div>
                  <div style={{ marginTop: '4px', display: 'flex', gap: '6px' }}>
                    <span className={`badge ${user.status.toLowerCase()}`}>
                      {user.status === 'ACTIVE' ? '활성 계정' : '비활성 계정'}
                    </span>
                    <span className={`badge role-${user.role.toLowerCase()}`} data-field="user-role">
                      <Shield size={10} style={{ marginRight: '2px' }} />
                      현재 권한: {user.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>성명</label>
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>소속 부서</label>
              <select
                className="form-control"
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
              >
                <option value="플랫폼개발팀">플랫폼개발팀</option>
                <option value="서비스개발팀">서비스개발팀</option>
                <option value="기획운영팀">기획운영팀</option>
                <option value="디자인팀">디자인팀</option>
                <option value="마케팅팀">마케팅팀</option>
                <option value="인사총무팀">인사총무팀</option>
                <option value="재무회계팀">재무회계팀</option>
              </select>
            </div>

            <div className="form-group">
              <label>직급 / 직책</label>
              <input
                type="text"
                className="form-control"
                value={formData.position}
                onChange={e => setFormData({ ...formData, position: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>시스템 접근 권한 (Role)</label>
              <select
                className="form-control"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                data-input="user-role"
              >
                <option value="VIEWER">VIEWER (조회 전용 일반 권한)</option>
                <option value="OPERATOR">OPERATOR (운영 및 실행 권한)</option>
                <option value="MANAGER">MANAGER (부서 관리자 권한)</option>
                <option value="ADMIN">ADMIN (최고 관리자 전결 권한)</option>
              </select>
            </div>

            <div className="form-group">
              <label>사내 연락처</label>
              <input
                type="text"
                className="form-control"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>계정 생성 일자</label>
              <input
                type="text"
                className="form-control"
                value={user.created_at}
                disabled
                style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}
              />
            </div>
          </div>

          <div className="drawer-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={14} />
              <span>{saving ? '저장 중...' : '변경사항 저장'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
