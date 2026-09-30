import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Mail, Shield, Send } from 'lucide-react';
import Modal from '../components/Modal';

export default function Team({ showToast }) {
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [inviteModal, setInviteModal] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Editor');
  const [message, setMessage] = useState('CreatorFlow 프로젝트에 초대합니다.');
  const [inviting, setInviting] = useState(false);

  const loadTeamData = () => {
    fetch('/api/team')
      .then(res => res.json())
      .then(d => setMembers(d))
      .catch(err => console.error(err));

    fetch('/api/team/invitations')
      .then(res => res.json())
      .then(d => setInvites(d))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadTeamData();
  }, []);

  // Send invitation handler (SEC-352 / site038-bug02)
  const handleSendInvite = (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setInviting(true);
    const idempotency_key = `INVITE-${Date.now()}-${Math.floor(Math.random()*1000)}`;

    fetch('/api/team/invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        role,
        message: message.trim(),
        idempotency_key
      })
    })
    .then(res => res.json())
    .then(data => {
      setInviting(false);
      setInviteModal(false);
      setEmail('');
      loadTeamData();
      showToast('초대장 발송 완료', `[${data.invitation?.email}] 님에게 팀원 초대장이 전송되었습니다.`, 'success', data.transaction_id, data.bugId, data.secId);
    })
    .catch(err => {
      console.error(err);
      setInviting(false);
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--navy-900)' }}>크리에이터 팀 및 협업 멤버 관리</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)' }}>영상 편집자, 썸네일 디자이너, 오디오 엔지니어 협업 초대</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setInviteModal(true)}>
          <UserPlus size={16} /> 팀원 초대하기
        </button>
      </div>

      <div className="card" style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '16px' }}>현재 참여 중인 팀원</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>멤버</th>
                <th>이메일</th>
                <th>직무 및 역할</th>
                <th>접근 권한</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={m.avatar} alt={m.name} style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }} />
                      <strong style={{ color: 'var(--navy-900)' }}>{m.name}</strong>
                    </div>
                  </td>
                  <td style={{ color: 'var(--gray-500)' }}>{m.email}</td>
                  <td><span className="badge badge-published">{m.role}</span></td>
                  <td>{m.permissions}</td>
                  <td><span className="badge badge-success">{m.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invitations List */}
      <div className="card">
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '16px' }}>발송된 초대 대기 목록</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>초대 대상 이메일</th>
                <th>역할</th>
                <th>초대 메시지</th>
                <th>발송일</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {invites.map(inv => (
                <tr key={inv.id}>
                  <td style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{inv.email}</td>
                  <td><span className="badge badge-editing">{inv.role}</span></td>
                  <td style={{ color: 'var(--gray-600)' }}>{inv.message}</td>
                  <td style={{ fontSize: '0.84rem', color: 'var(--gray-400)' }}>{inv.sentAt}</td>
                  <td><span className="badge badge-warning">{inv.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal (SEC-352) */}
      <Modal
        isOpen={inviteModal}
        onClose={() => setInviteModal(false)}
        title="새 팀원 초대장 발송"
      >
        <form onSubmit={handleSendInvite}>
          <div className="form-group">
            <label className="form-label">초대할 이메일 주소</label>
            <input
              type="email"
              className="form-control"
              placeholder="collaborator@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">부여할 역할 (Role)</label>
            <select 
              className="form-control"
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              <option value="Editor">Video Editor (영상 편집)</option>
              <option value="Designer">Thumbnail Designer (썸네일 디자인)</option>
              <option value="Audio Specialist">Audio Specialist (음향 엔지니어)</option>
              <option value="Manager">Channel Manager (채널 매니저)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">초대 메시지</label>
            <textarea
              className="form-control"
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows="3"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setInviteModal(false)}>
              취소
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={inviting || !email.trim()}>
              <Send size={14} /> {inviting ? '발송 중...' : '초대장 전송'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
