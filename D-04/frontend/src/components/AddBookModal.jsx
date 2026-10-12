import React, { useState } from 'react';
import { X, BookPlus } from 'lucide-react';

export default function AddBookModal({ isOpen, onClose, onSubmit }) {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [category, setCategory] = useState('문학/소설');
  const [location, setLocation] = useState('LIT-D-15');
  const [totalCopies, setTotalCopies] = useState(3);
  const [isbn, setIsbn] = useState('97911' + Math.floor(10000000 + Math.random() * 90000000));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !author) return;

    onSubmit({
      title,
      author,
      publisher,
      category,
      location,
      total_copies: Number(totalCopies),
      isbn
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookPlus size={20} color="var(--brown-800)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brown-900)' }}>
              신규 도서 등록
            </h3>
          </div>
          <button className="btn btn-outline btn-sm" style={{ padding: '4px', borderRadius: '50%' }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">도서 제목 *</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="도서명을 정확히 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">저자 *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="저자명"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">출판사</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="출판사명"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">분류 카테고리</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="IT/컴퓨터">IT/컴퓨터</option>
                  <option value="인문/역사">인문/역사</option>
                  <option value="과학/교양">과학/교양</option>
                  <option value="문학/고전">문학/고전</option>
                  <option value="문학/소설">문학/소설</option>
                  <option value="경제/경영">경제/경영</option>
                  <option value="자기계발">자기계발</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">서가 소장 위치</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="예: IT-A-01"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">입고 권수 (총 재고)</label>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  required
                  value={totalCopies}
                  onChange={(e) => setTotalCopies(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">ISBN 번호</label>
                <input
                  type="text"
                  className="form-input"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-brown">
              도서 등록 완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
