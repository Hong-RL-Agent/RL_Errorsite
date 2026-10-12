'use client';

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import StatCards from '../components/StatCards';
import BookCatalog from '../components/BookCatalog';
import LoanManagement from '../components/LoanManagement';
import UserManagementModal from '../components/UserManagementModal';
import AddBookModal from '../components/AddBookModal';
import EditBookModal from '../components/EditBookModal';
import BorrowBookModal from '../components/BorrowBookModal';
import { api } from '../lib/api';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('catalog');

  // Data States
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [stats, setStats] = useState(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [borrowingBook, setBorrowingBook] = useState(null);
  const [editingBook, setEditingBook] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Toast Helper
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Load All Data
  const loadData = async () => {
    try {
      const [bList, uList, lList, sData] = await Promise.all([
        api.getBooks(),
        api.getUsers(),
        api.getLoans(),
        api.getStats()
      ]);
      setBooks(bList || []);
      setUsers(uList || []);
      setLoans(lList || []);
      setStats(sData || null);
    } catch (err) {
      console.error('Failed to load BookNest data:', err);
      showToast('데이터 불러오기 실패: ' + err.message, 'danger');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 1. Reset Data
  const handleResetData = async () => {
    try {
      await api.resetData();
      await loadData();
      showToast('초기 42권 장서 및 22건 대출 상태로 완전 복원되었습니다.', 'info');
    } catch (err) {
      showToast('초기화 실패: ' + err.message, 'danger');
    }
  };

  // 2. Add Book
  const handleCreateBook = async (payload) => {
    try {
      const res = await api.createBook(payload);
      if (res.success) {
        showToast('신규 도서가 성공적으로 등록되었습니다.', 'success');
        setIsAddModalOpen(false);
        await loadData();
      }
    } catch (err) {
      showToast('도서 등록 실패: ' + err.message, 'danger');
    }
  };

  // 3. Edit Book
  const handleUpdateBook = async (id, payload) => {
    try {
      const res = await api.updateBook(id, payload);
      if (res.success) {
        showToast('도서 정보가 성공적으로 수정되었습니다.', 'success');
        setEditingBook(null);
        await loadData();
      }
    } catch (err) {
      showToast('도서 수정 실패: ' + err.message, 'danger');
    }
  };

  // 4. Delete Book
  const handleDeleteBook = async (id) => {
    try {
      const res = await api.deleteBook(id);
      if (res.success) {
        showToast('도서가 성공적으로 삭제되었습니다.', 'info');
        await loadData();
      }
    } catch (err) {
      showToast('도서 삭제 실패: ' + err.message, 'danger');
    }
  };

  // 5. Borrow Book
  const handleBorrowBook = async (bookId, userId) => {
    try {
      const res = await api.borrowBook({ book_id: bookId, user_id: userId });
      if (res.success) {
        showToast('도서 대출이 성공적으로 완료되었습니다!', 'success');
        setBorrowingBook(null);
        await loadData();
      }
    } catch (err) {
      showToast('대출 신청 오류: ' + err.message, 'danger');
    }
  };

  // 6. Return Book
  const handleReturnBook = async (loanId) => {
    try {
      const res = await api.returnBook(loanId);
      if (res.success) {
        showToast('도서 반납 처리가 완료되었습니다.', 'info');
        await loadData();
      }
    } catch (err) {
      showToast('반납 처리 오류: ' + err.message, 'danger');
    }
  };

  return (
    <div className="library-wrapper">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenUserModal={() => setIsUserModalOpen(true)}
        onResetData={handleResetData}
      />

      {/* Statistics Cards */}
      <StatCards stats={stats} />

      {/* Main Tab Content */}
      {activeTab === 'catalog' && (
        <BookCatalog
          books={books}
          onOpenBorrowModal={(b) => setBorrowingBook(b)}
          onOpenEditModal={(b) => setEditingBook(b)}
          onDeleteBook={handleDeleteBook}
        />
      )}

      {activeTab === 'loans' && (
        <LoanManagement
          loans={loans}
          onReturnBook={handleReturnBook}
        />
      )}

      {/* Add Book Modal */}
      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateBook}
      />

      {/* Edit Book Modal */}
      {editingBook && (
        <EditBookModal
          book={editingBook}
          onClose={() => setEditingBook(null)}
          onSubmit={handleUpdateBook}
        />
      )}

      {/* Borrow Book Modal */}
      {borrowingBook && (
        <BorrowBookModal
          book={borrowingBook}
          users={users}
          onClose={() => setBorrowingBook(null)}
          onSubmit={handleBorrowBook}
        />
      )}

      {/* User Management Modal */}
      <UserManagementModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        users={users}
      />

      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.type === 'success' && <CheckCircle2 size={16} color="var(--emerald-600)" />}
            {t.type === 'info' && <Info size={16} color="var(--amber-700)" />}
            {t.type === 'danger' && <AlertCircle size={16} color="var(--rose-600)" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
