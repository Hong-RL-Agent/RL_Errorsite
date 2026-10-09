import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import TicketList from './components/TicketList';
import TicketWorkspace from './components/TicketWorkspace';
import TemplateModal from './components/TemplateModal';
import ServerErrorModal from './components/ServerErrorModal';

export default function App() {
  const [currentNav, setCurrentNav] = useState('inbox');
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(1042);
  const [currentTicketDetail, setCurrentTicketDetail] = useState(null);
  const [replies, setReplies] = useState([]);
  const [draft, setDraft] = useState('');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Modals & Feedback
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [onSelectTemplateCallback, setOnSelectTemplateCallback] = useState(null);
  const [serverErrorModalOpen, setServerErrorModalOpen] = useState(false);
  const [serverErrorMessage, setServerErrorMessage] = useState('');
  const [toasts, setToasts] = useState([]);
  const [isResetting, setIsResetting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Fetch Tickets
  // BUG-891: Category Tab Filter Ignored
  // When activeCategory is changed, UI updates active tab, but fetch omits category parameter!
  const fetchTickets = useCallback(async (customCategory = null) => {
    try {
      const params = new URLSearchParams();

      // Bug 891: If category was set via tab (activeCategory), we intentionally do not append it to params!
      // This causes category tab filter to be ignored by the backend request while UI shows tab as active.
      if (statusFilter && statusFilter !== 'ALL') {
        params.append('status', statusFilter);
      }
      if (searchTerm && searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      // Note: category param is intentionally omitted to reproduce BUG-891
      const res = await fetch(`/api/tickets?${params.toString()}`);
      const data = await res.json();
      if (data.tickets) {
        setTickets(data.tickets);
      }
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    }
  }, [statusFilter, searchTerm]);

  // Fetch Ticket Detail
  const fetchTicketDetail = useCallback(async (id) => {
    if (!id) return;
    try {
      const res = await fetch(`/api/tickets/${id}`);
      if (!res.ok) throw new Error('Ticket not found');
      const data = await res.json();
      setCurrentTicketDetail(data.ticket);
      setReplies(data.replies || []);
      setDraft(data.draft || '');
    } catch (err) {
      console.error('Failed to fetch ticket detail:', err);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    if (selectedTicketId) {
      fetchTicketDetail(selectedTicketId);
    }
  }, [selectedTicketId, fetchTicketDetail]);

  // Handler for category tab click (BUG-891)
  const handleCategoryTabClick = (catId) => {
    setActiveCategory(catId);
    // Fetch tickets immediately (the fetch function omits the category param)
    fetchTickets();
  };

  // Update Status (BUG-1431 Premature Resolve endpoint)
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/tickets/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success && data.ticket) {
        setCurrentTicketDetail(data.ticket);
        setTickets((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status: data.ticket.status, updated_at: data.ticket.updated_at } : t))
        );
      }
      return data;
    } catch (err) {
      console.error('Failed to update status:', err);
      throw err;
    }
  };

  // Update Category
  const handleUpdateCategory = async (id, newCategory) => {
    try {
      const res = await fetch(`/api/tickets/${id}/category`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newCategory })
      });
      const data = await res.json();
      if (data.success && data.ticket) {
        setCurrentTicketDetail(data.ticket);
        setTickets((prev) =>
          prev.map((t) => (t.id === id ? { ...t, category: data.ticket.category } : t))
        );
        showToast('카테고리가 변경되었습니다.', 'success');
      }
    } catch (err) {
      console.error('Failed to update category:', err);
      showToast('카테고리 변경 실패', 'error');
    }
  };

  // Save Draft
  const handleSaveDraft = async (id, content) => {
    try {
      await fetch(`/api/tickets/${id}/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      setDraft(content);
    } catch (err) {
      console.error('Failed to save draft:', err);
    }
  };

  // Submit Reply (BUG-1686 & BUG-896)
  const handleSubmitReply = async (id, content, onSuccessClear) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/tickets/${id}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, author: '상담원 김지원' })
      });

      // BUG-896: Generic 500 Error on Long Reply (>1000 chars)
      if (res.status === 500) {
        const errorData = await res.json().catch(() => ({}));
        setServerErrorMessage(errorData.message || '500 Internal Server Error 발생');
        setServerErrorModalOpen(true);
        // Bug requirement: clears typed textarea
        if (onSuccessClear) onSuccessClear();
        setIsSubmitting(false);
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to submit reply');
      }

      const data = await res.json();
      if (data.success && data.reply) {
        // Appends the created reply (which may have duplicated ending if BUG-1686 on 1041)
        setReplies((prev) => [...prev, data.reply]);
        if (onSuccessClear) onSuccessClear();
        showToast('답변이 성공적으로 등록되었습니다.', 'success');
        
        // Refresh ticket
        fetchTicketDetail(id);
        fetchTickets();
      }
    } catch (err) {
      console.error('Submit reply error:', err);
      showToast('답변 등록 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Template Modal (BUG-1856)
  const handleOpenTemplates = (onSelect) => {
    setOnSelectTemplateCallback(() => onSelect);
    setIsTemplateModalOpen(true);
  };

  // Reset Environment (POST /api/test/reset)
  const handleResetDb = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/test/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('SupportHub 환경이 초기 데이터로 완벽하게 리셋되었습니다.', 'success');
        setSelectedTicketId(1042);
        setActiveCategory('ALL');
        setStatusFilter('ALL');
        setSearchTerm('');
        setIsTemplateModalOpen(false);
        setServerErrorModalOpen(false);
        // Remove any lingering overlay element from DOM
        document.querySelectorAll('.modal-backdrop-overlay').forEach((el) => el.remove());
        await fetchTickets();
        await fetchTicketDetail(1042);
      }
    } catch (err) {
      console.error('Reset DB error:', err);
      showToast('초기화 실패', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const ticketCounts = {
    total: tickets.length,
    received: tickets.filter((t) => t.status === 'RECEIVED').length,
    inProgress: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
    answered: tickets.filter((t) => t.status === 'ANSWERED').length
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <Sidebar
        currentNav={currentNav}
        setCurrentNav={setCurrentNav}
        ticketCounts={ticketCounts}
        onResetDb={handleResetDb}
        isResetting={isResetting}
      />

      {/* Main Support Workspace */}
      <main className="main-content">
        <TicketList
          tickets={tickets}
          selectedTicketId={selectedTicketId}
          onSelectTicket={(id) => setSelectedTicketId(id)}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          activeCategory={activeCategory}
          onCategoryTabClick={handleCategoryTabClick}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          totalCount={tickets.length}
        />

        <TicketWorkspace
          ticket={currentTicketDetail}
          replies={replies}
          draft={draft}
          onUpdateStatus={handleUpdateStatus}
          onUpdateCategory={handleUpdateCategory}
          onSubmitReply={handleSubmitReply}
          onSaveDraft={handleSaveDraft}
          onOpenTemplates={handleOpenTemplates}
          isSubmitting={isSubmitting}
          showToast={showToast}
        />
      </main>

      {/* Template Modal (BUG-1856: Modal Freeze on Close) */}
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={(tplText) => {
          if (onSelectTemplateCallback) onSelectTemplateCallback(tplText);
          setIsTemplateModalOpen(false);
        }}
      />

      {/* Generic 500 Server Error Modal (BUG-896) */}
      <ServerErrorModal
        isOpen={serverErrorModalOpen}
        onClose={() => setServerErrorModalOpen(false)}
        errorMessage={serverErrorMessage}
      />

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
