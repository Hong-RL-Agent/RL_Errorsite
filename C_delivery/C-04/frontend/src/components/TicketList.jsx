import React from 'react';
import { Search, User, Filter, AlertCircle, Clock } from 'lucide-react';

const CATEGORIES = [
  { id: 'ALL', label: '전체' },
  { id: 'REFUND', label: '환불 문의' },
  { id: 'ACCOUNT', label: '계정 문의' },
  { id: 'DELIVERY', label: '배송 문의' },
  { id: 'PAYMENT', label: '결제 문의' },
  { id: 'OTHER', label: '기타' }
];

const STATUS_FILTERS = [
  { id: 'ALL', label: '전체 상태' },
  { id: 'RECEIVED', label: '접수' },
  { id: 'IN_PROGRESS', label: '처리중' },
  { id: 'ANSWERED', label: '답변완료' }
];

export default function TicketList({
  tickets,
  selectedTicketId,
  onSelectTicket,
  searchTerm,
  setSearchTerm,
  activeCategory,
  onCategoryTabClick,
  statusFilter,
  setStatusFilter,
  totalCount
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'RECEIVED':
        return <span className="badge badge-received">접수</span>;
      case 'IN_PROGRESS':
        return <span className="badge badge-in_progress">처리중</span>;
      case 'ANSWERED':
        return <span className="badge badge-answered">답변완료</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'URGENT':
        return <span className="badge badge-priority-urgent">긴급</span>;
      case 'HIGH':
        return <span className="badge badge-priority-high">높음</span>;
      case 'NORMAL':
        return <span className="badge badge-priority-normal">보통</span>;
      case 'LOW':
        return <span className="badge badge-priority-low">낮음</span>;
      default:
        return null;
    }
  };

  const getCategoryLabel = (cat) => {
    const item = CATEGORIES.find(c => c.id === cat);
    return item ? item.label : cat;
  };

  return (
    <div className="tickets-pane">
      {/* Pane Header */}
      <div className="tickets-header">
        <div className="tickets-title-row">
          <h2>고객 문의 목록</h2>
          <span className="nav-badge">{totalCount}건</span>
        </div>

        {/* Search */}
        <div className="search-box">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            placeholder="문의 제목, 내용, 고객명 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Tabs (BUG-891: Category Tab Filter Ignored) */}
        <div className="category-tabs">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                className={`category-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => onCategoryTabClick(cat.id)}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Bar Filter */}
      <div className="status-bar">
        <span>상태 필터</span>
        <div className="status-pills">
          {STATUS_FILTERS.map((st) => (
            <span
              key={st.id}
              className={`status-pill ${statusFilter === st.id ? 'active' : ''}`}
              onClick={() => setStatusFilter(st.id)}
            >
              {st.label}
            </span>
          ))}
        </div>
      </div>

      {/* Ticket Cards List */}
      <div className="tickets-list">
        {tickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            조회된 문의 내역이 없습니다.
          </div>
        ) : (
          tickets.map((ticket) => {
            const isSelected = selectedTicketId === ticket.id;
            return (
              <div
                key={ticket.id}
                className={`ticket-card ${isSelected ? 'selected' : ''}`}
                data-ticket-id={ticket.id}
                onClick={() => onSelectTicket(ticket.id)}
              >
                <div className="ticket-card-top">
                  <span className="ticket-id">#{ticket.id}</span>
                  <div className="ticket-meta-right">
                    {getPriorityBadge(ticket.priority)}
                    {getStatusBadge(ticket.status)}
                  </div>
                </div>

                <div className="ticket-subject">{ticket.subject}</div>
                <div className="ticket-snippet">{ticket.content}</div>

                <div className="ticket-card-footer">
                  <div className="customer-info">
                    <User size={13} />
                    <span>{ticket.customer_name}</span>
                  </div>
                  <span className="badge badge-category">
                    {getCategoryLabel(ticket.category)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
