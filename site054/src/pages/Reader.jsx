import React, { useState, useEffect } from 'react';
import ReaderPanel from '../components/ReaderPanel';
import { api, notifyBugDetected } from '../api/client';

export default function Reader({ bookId, onClose, showToast }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(80);
  const [bookTitle, setBookTitle] = useState('전자책');
  const [chapter, setChapter] = useState('');
  const [content, setContent] = useState('');
  const [isOutOfBounds, setIsOutOfBounds] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPage = async (targetPage) => {
    setLoading(true);
    try {
      // INTENTIONAL BACKEND BUG: site054-SEC-448 observation
      if (targetPage > totalPages) {
        notifyBugDetected({
          id: 'SEC-448',
          category: 'Boundary Handling',
          family: 'index-boundary',
          severity: 'medium',
          endpoint: `/api/ebooks/${bookId}/pages/${targetPage}`,
          method: 'GET',
          description: '전자책 뷰어에서 마지막 페이지를 초과하는 페이지 번호(81/80) 요청 시 상한선 범위 검증 실패 오류'
        });
      }

      const res = await api.getEbookPage(bookId, targetPage);
      if (res && res.success) {
        setCurrentPage(res.currentPage);
        setTotalPages(res.totalPages || totalPages);
        setBookTitle(res.title || bookTitle);
        setChapter(res.chapter || '');
        setContent(res.content || '');
        setIsOutOfBounds(!!res.isOutOfBounds);
      }
    } catch (err) {
      if (showToast) showToast('페이지 조회 실패', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(currentPage);
  }, [bookId]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      fetchPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    // INTENTIONAL BACKEND BUG: site054-SEC-448
    // On the last page (e.g. 80 / 80), clicking next will request page 81 without client restriction!
    fetchPage(currentPage + 1);
  };

  return (
    <div style={{ padding: '20px 0' }}>
      <ReaderPanel
        bookTitle={bookTitle}
        currentPage={currentPage}
        totalPages={totalPages}
        chapter={chapter}
        content={loading ? '페이지 본문을 불러오는 중...' : content}
        isOutOfBounds={isOutOfBounds}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        onClose={onClose}
      />
    </div>
  );
}
