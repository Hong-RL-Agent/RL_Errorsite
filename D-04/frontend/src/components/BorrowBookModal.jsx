import React, { useState } from 'react';
import { X, BookOpenCheck, User } from 'lucide-react';

export default function BorrowBookModal({ 
  book, 
  users, 
  onClose, 
  onSubmit 
}) {
  if (!book) return null;

  const [userId, setUserId] = useState(users[0]?.id || 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(book.id, Number(userId));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpenCheck size={20} color="var(--amber-700)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brown-900)' }}>
              도서 대출 신청
            </h3>
          </div>
          <button className="btn btn-outline btn-sm" style={{ padding: '4px', borderRadius: '50%' }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Book Info Summary */}
            <div style={{ padding: '14px', background: 'var(--bg-surface-warm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>대출 대상 도서</div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--brown-900)', margin: '4px 0' }}>
                {book.title}
              </h4>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                {book.author} · {book.publisher}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--emerald-600)', fontWeight: 600, marginTop: '6px' }}>
                현재 대출 가능 잔여: {book.available_copies}권
              </div>
            </div>

            {/* Select User */}
            <div className="form-group">
              <label className="form-label">대출 이용자 (회원 선택) *</label>
              <select
                className="form-select"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.department}) - 현재 대출 {u.borrowed_count}권
                  </option>
                ))}
              </select>
            </div>

            {/* Policy notice */}
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              * 대출 기간은 오늘로부터 14일(2주일)이며, 반납 기한 내에 서가에 반납해야 합니다.
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-amber">
              대출 확인 및 접수
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
