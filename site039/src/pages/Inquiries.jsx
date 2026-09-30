import React, { useState, useEffect } from 'react';
import { HelpCircle, Plus, CheckCircle2, Clock, MessageSquare, Send } from 'lucide-react';
import Modal from '../components/Modal';

export default function Inquiries({ onShowToast }) {
  const [inquiries, setInquiries] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('상품 문의');
  const [content, setContent] = useState('');

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const res = await fetch('/api/inquiries');
      const data = await res.json();
      setInquiries(data);
    } catch (err) {
      console.error(err);
    }
  };

  // SEC-363: Customer Inquiry Submission
  const handleSubmitInquiry = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          category,
          content: content.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setTitle('');
        setContent('');
        fetchInquiries();
        onShowToast({
          title: '1:1 문의 접수 완료',
          message: `[${title}] 문의가 고객센터에 정상 접수되었습니다.`,
          type: 'success',
          bugId: data.bugId,
          secId: data.secId,
          reqId: data.request_id
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">1:1 고객 문의 게시판</h1>
          <p className="page-subtitle">상품, 배송, 예약 등에 관한 궁금한 점을 남겨주시면 신속히 답변드립니다.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> 1:1 문의 작성하기
        </button>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>
          나의 문의 내역 ({inquiries.length}건)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {inquiries.map((inq) => (
            <div
              key={inq.id}
              style={{
                padding: '18px 20px',
                background: '#fbf9f6',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-terracotta">{inq.category}</span>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>{inq.title}</h4>
                </div>
                <span className={inq.status === '답변 완료' ? 'badge badge-emerald' : 'badge badge-amber'}>
                  {inq.status}
                </span>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.5 }}>
                {inq.content}
              </p>

              {inq.answer && (
                <div style={{
                  padding: '12px 14px',
                  background: '#ffffff',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  marginTop: '10px',
                  fontSize: '13px',
                  color: 'var(--text-main)'
                }}>
                  <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '4px' }}>[DailyPick 답변]</strong>
                  {inq.answer}
                </div>
              )}

              <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '8px' }}>
                접수일: {inq.createdAt}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SEC-363: Inquiry Submission Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="1:1 고객 문의 작성"
      >
        <form onSubmit={handleSubmitInquiry}>
          <div className="form-group">
            <label className="form-label">문의 유형</label>
            <select
              className="form-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="상품 문의">상품 문의</option>
              <option value="배송 문의">배송 문의</option>
              <option value="예약/클래스 문의">예약/클래스 문의</option>
              <option value="반품/교환 문의">반품/교환 문의</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">문의 제목 *</label>
            <input
              type="text"
              className="form-input"
              placeholder="문의하실 제목을 간략히 적어주세요."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">문의 내용 *</label>
            <textarea
              className="form-input"
              rows={5}
              placeholder="문의 내용을 상세하게 작성해주세요."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              취소
            </button>
            <button type="submit" className="btn btn-primary">
              <Send size={15} /> 문의 제출
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
