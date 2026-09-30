import React, { useState, useEffect } from 'react';
import { HelpCircle, Send, CheckCircle2, MessageSquare, Clock } from 'lucide-react';

export default function Support({ showToast }) {
  const [inquiries, setInquiries] = useState([]);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Billing');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const loadInquiries = () => {
    fetch('/api/support/inquiries')
      .then(res => res.json())
      .then(data => setInquiries(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const handleSubmitInquiry = (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setLoading(true);
    const idempotency_key = `INQUIRY-${Date.now()}-${Math.floor(Math.random()*1000)}`;

    fetch('/api/support/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject,
        category,
        message,
        idempotency_key
      })
    })
    .then(res => res.json())
    .then(data => {
      setLoading(false);
      if (data.inquiry) {
        setSubject('');
        setMessage('');
        loadInquiries();
        showToast('문의 접수 완료', '고객지원팀에 문의가 정상적으로 접수되었습니다.', 'success', data.transaction_id);
      }
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
      {/* Inquiry Form */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title"><HelpCircle size={18} color="#4f46e5" /> 1:1 고객 기술/결제 지원 문의</h3>
            <p className="card-subtitle">플랫폼 이용 중 발생한 불편사항이나 기능 문의를 남겨주세요.</p>
          </div>
        </div>

        <form onSubmit={handleSubmitInquiry}>
          <div className="form-group">
            <label className="form-label">문의 카테고리</label>
            <select 
              className="form-control"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              <option value="Billing">결제 및 요금제 (Billing)</option>
              <option value="Technical">기술 및 SSO 연동 (Technical)</option>
              <option value="Account">계정 및 워크스페이스 권한 (Account)</option>
              <option value="Feature">신규 기능 제안 (Feature Request)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">문의 제목</label>
            <input
              type="text"
              className="form-control"
              placeholder="예: 연간 결제 할인 적용 및 청구서 발행 문의"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">상세 내용</label>
            <textarea
              className="form-control"
              placeholder="궁금하신 내용이나 지원이 필요한 상황을 자세히 적어주세요."
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows="5"
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Send size={16} /> {loading ? '접수 중...' : '문의 제출하기'}
            </button>
          </div>
        </form>
      </div>

      {/* Inquiry History */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">내 문의 내역</h3>
            <p className="card-subtitle">접수된 문의 처리 상태 및 답변 현황</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '550px', overflowY: 'auto' }}>
          {inquiries.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '30px 0' }}>등록된 문의 내역이 없습니다.</div>
          ) : (
            inquiries.map(inq => (
              <div key={inq.id} style={{ padding: '16px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className={`badge badge-${inq.status}`}>
                    {inq.status === 'answered' ? '답변완료' : '검토중'}
                  </span>
                  <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>{new Date(inq.createdAt).toLocaleDateString()}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--navy-900)', marginBottom: '4px' }}>
                  {inq.subject}
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--gray-500)', marginBottom: '10px' }}>
                  {inq.message}
                </div>
                {inq.answer && (
                  <div style={{ marginTop: '8px', padding: '10px 12px', backgroundColor: '#eef2ff', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--primary)', fontSize: '0.82rem', color: 'var(--navy-800)' }}>
                    <strong>지원팀 답변:</strong> {inq.answer}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
