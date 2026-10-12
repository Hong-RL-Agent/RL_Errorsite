import React, { useState } from 'react';
import { 
  Search, 
  BookMarked, 
  MapPin, 
  Edit, 
  Trash2, 
  BookOpenCheck,
  Tag
} from 'lucide-react';

export default function BookCatalog({ 
  books, 
  onOpenBorrowModal, 
  onOpenEditModal, 
  onDeleteBook 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = [
    'ALL', 'IT/컴퓨터', '인문/역사', '과학/교양', '문학/고전', '문학/소설', '경제/경영', '자기계발'
  ];

  const filtered = books.filter((b) => {
    if (selectedCategory !== 'ALL' && b.category !== selectedCategory) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match = b.title.toLowerCase().includes(q) ||
                    b.author.toLowerCase().includes(q) ||
                    b.publisher.toLowerCase().includes(q) ||
                    b.isbn.includes(q) ||
                    b.location.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="card-box">
      {/* Top Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brown-900)' }}>
            도서 소장 장서 목록 ({filtered.length}권)
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            서가 위치 확인, 도서 정보 수정 및 대출 신청을 진행할 수 있습니다.
          </p>
        </div>

        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-input)', padding: '8px 14px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="도서명, 저자, 출판사, ISBN 검색..."
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.88rem', width: '220px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '20px' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`btn btn-sm ${selectedCategory === cat ? 'btn-brown' : 'btn-outline'}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat === 'ALL' ? '전체 분야' : cat}
          </button>
        ))}
      </div>

      {/* Book Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>
          검색 조건에 일치하는 도서가 없습니다.
        </div>
      ) : (
        <div className="book-grid">
          {filtered.map((book) => {
            const isAvailable = book.available_copies > 0;

            return (
              <div key={book.id} className="book-item-card">
                {/* Book Spine Mockup */}
                <div className="book-spine-mock">
                  <BookMarked size={22} />
                </div>

                {/* Book Details */}
                <div className="book-info-col">
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px', marginBottom: '4px' }}>
                      <span className="badge" style={{ background: 'var(--brown-100)', color: 'var(--brown-700)' }}>
                        {book.category}
                      </span>
                      <span className={`badge ${isAvailable ? 'badge-available' : 'badge-out'}`}>
                        {isAvailable ? `대출 가능 (${book.available_copies}/${book.total_copies})` : '전권 대출 중'}
                      </span>
                    </div>

                    <h4 className="book-title">{book.title}</h4>
                    <div className="book-author">
                      {book.author} · {book.publisher}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <MapPin size={12} />
                      <span>서가 위치: <strong>{book.location}</strong></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                    {/* Borrow Button */}
                    <button
                      className={`btn btn-sm ${isAvailable ? 'btn-amber' : 'btn-outline'}`}
                      disabled={!isAvailable}
                      style={{ opacity: isAvailable ? 1 : 0.6 }}
                      onClick={() => onOpenBorrowModal(book)}
                    >
                      <BookOpenCheck size={13} />
                      <span>대출 신청</span>
                    </button>

                    {/* Edit & Delete */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ padding: '4px 8px' }}
                        onClick={() => onOpenEditModal(book)}
                        title="도서 정보 수정"
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        style={{ padding: '4px 8px' }}
                        onClick={() => onDeleteBook(book.id)}
                        title="도서 삭제"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
