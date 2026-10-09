import React, { useState } from 'react';
import { Users, UserPlus, Mail, Shield, CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function MemberDrawer({ projectId, members, onInviteMember, loading }) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('member@example.com');
  const [inviteRole, setInviteRole] = useState('DEVELOPER');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState(null);

  // Stale project ID reference for BUG-786
  // Intentionally refers to P-102 when in P-101
  const staleTargetProjectId = projectId === 'P-101' ? 'P-102' : 'P-101';

  const handleSendInvite = async () => {
    setInviteLoading(true);
    setInviteSuccessMsg(null);
    try {
      // BUG-786: Dispatches invitation to stale project ID P-102 instead of current P-101!
      const res = await fetch(`http://localhost:5009/workspace/projects/${staleTargetProjectId}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole
        })
      });

      const data = await res.json();
      if (res.ok) {
        setInviteSuccessMsg(`초대장이 성공적으로 발송되었습니다 (${inviteEmail})`);
        setTimeout(() => {
          setShowInviteModal(false);
          setInviteSuccessMsg(null);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInviteLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', marginBottom: '4px' }}>
            <Users size={18} />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              팀 & 프로젝트 멤버
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            프로젝트 멤버 관리
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            프로젝트에 참여 중인 구성원의 권한과 팀 배정을 관리합니다.
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="btn-primary"
        >
          <UserPlus size={16} />
          <span>새 멤버 초대</span>
        </button>
      </div>

      {/* Member Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {members.map(member => (
          <div
            key={member.id}
            data-member={member.id}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <img
              src={member.avatar}
              alt={member.name}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--border-subtle)'
              }}
            />
            <div>
              <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)' }}>
                {member.name}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {member.email}
              </div>
              <div style={{
                marginTop: '4px',
                display: 'inline-block',
                fontSize: '0.72rem',
                fontWeight: '700',
                color: 'var(--accent-cyan)',
                background: 'rgba(6, 182, 212, 0.1)',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                {member.role}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Member Invitation Modal (BUG 2: C-10-786) */}
      {showInviteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(6, 9, 17, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '480px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: '700' }}>멤버 초대</div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-main)' }}>
                  새 팀원 초대하기
                </h2>
              </div>
              <button onClick={() => setShowInviteModal(false)} style={{ color: 'var(--text-secondary)' }}>
                <X size={18} />
              </button>
            </div>

            {inviteSuccessMsg ? (
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34d399',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9rem',
                fontWeight: '700'
              }}>
                <CheckCircle2 size={20} />
                <span>{inviteSuccessMsg}</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    초대할 이메일 주소
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="user@example.com"
                    style={{
                      width: '100%',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-main)',
                      padding: '12px 16px',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    프로젝트 역할 (Role)
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-main)',
                      padding: '12px 16px',
                      fontSize: '0.95rem'
                    }}
                  >
                    <option value="TECH_LEAD">Tech Lead</option>
                    <option value="DEVELOPER">Developer</option>
                    <option value="DESIGNER">UI/UX Designer</option>
                    <option value="PRODUCT_MANAGER">Product Manager</option>
                  </select>
                </div>

                <button
                  onClick={handleSendInvite}
                  disabled={inviteLoading}
                  className="btn-primary"
                  style={{ width: '100%', padding: '12px', marginTop: '8px' }}
                >
                  <Mail size={16} />
                  <span>{inviteLoading ? '발송 중...' : '초대장 발송'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
