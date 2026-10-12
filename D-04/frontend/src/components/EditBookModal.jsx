import React, { useState, useEffect } from 'react';
import { X, Edit3 } from 'lucide-react';

export default function EditBookModal({ book, onClose, onSubmit }) {
  if (!book) return null;

  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [publisher, setPublisher] = useState(book.publisher);
  const [category, setCategory] = useState(book.category);
  const [location, setLocation] = useState(book.location);
  const [totalCopies, setTotalCopies] = useState(book.total_copies);

  useEffect(() => {
    setTitle(book.title);
    setAuthor(book.author);
    setPublisher(book.publisher);
    setCategory(book.category);
    setLocation(book.location);
    setTotalCopies(book.total_copies);
  }, [book]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(book.id, {
      title,
      author,
      publisher,
      category,
      location,
      total_copies: Number(totalCopies)
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Edit3 size={18} color="var(--brown-800)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brown-900)' }}>
              도서 정보 수정 (#{book.id})
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
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">저자</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">출판사</label>
                <input
                  type="text"
                  className="form-input"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">카테고리</label>
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
                <label className="form-label">서가 위치</label>
                <input
                  type="text"
                  className="form-input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">총 소장 권수 (재고)</label>
              <input
                type="number"
                className="form-input"
                min="1"
                required
                value={totalCopies}
                onChange={(e) => setTotalCopies(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-brown">
              수정사항 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
