import React, { useState, useEffect } from 'react';
import { Users, Mail, Shield, UserPlus, MoreVertical } from 'lucide-react';

export default function Members({ showToast }) {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setMembers(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy-900)' }}>팀 멤버 및 권한 관리</h2>
          <p className="card-subtitle">현재 워크스페이스에 참여 중인 팀원들의 직무와 권한을 확인합니다.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => showToast('초대 링크 생성', '팀원 초대 링크가 클립보드에 복사되었습니다.', 'success')}>
          <UserPlus size={16} /> 멤버 초대
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>이름 / 프로필</th>
              <th>이메일</th>
              <th>직책 및 역할</th>
              <th>소속 부서</th>
              <th>상태</th>
              <th>가입일</th>
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={m.avatar} alt={m.name} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
                    <span style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{m.name}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--gray-500)' }}>{m.email}</td>
                <td>
                  <span className="badge badge-info">{m.role}</span>
                </td>
                <td>{m.department}</td>
                <td>
                  <span className={`badge badge-${m.status === 'online' ? 'active' : 'medium'}`}>
                    {m.status}
                  </span>
                </td>
                <td style={{ fontSize: '0.84rem', color: 'var(--gray-500)' }}>{m.joinedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
