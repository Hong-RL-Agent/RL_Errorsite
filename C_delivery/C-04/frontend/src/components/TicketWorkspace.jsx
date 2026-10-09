import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Clock, 
  Tag, 
  Send, 
  Bookmark, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  Sparkles,
  Edit3
} from 'lucide-react';

export default function TicketWorkspace({
  ticket,
  replies,
  draft,
  onUpdateStatus,
  onUpdateCategory,
  onSubmitReply,
  onSaveDraft,
  onOpenTemplates,
  isSubmitting,
  showToast
}) {
  const [replyText, setReplyText] = useState('');
  const [activeTab, setActiveTab] = useState('reply'); // 'reply' | 'note'
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  useEffect(() => {
    if (draft) {
      setReplyText(draft);
    } else {
      setReplyText('');
    }
    setIsComposerOpen(false);
  }, [ticket?.id, draft]);

  if (!ticket) {
    return (
      <div className="workspace-pane" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <div style={{ textAlign: 'center' }}>
          <FileText size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
          <h3>선택된 문의가 없습니다.</h3>
          <p style={{ fontSize: 13, marginTop: 6 }}>좌측 목록에서 고객 문의를 선택해 주세요.</p>
        </div>
      </div>
    );
  }

  // BUG-1431: Premature Ticket Resolve Trigger
  // Triggered when opening reply composer or saving draft on ticket 1042 / in-progress tickets
  const handleOpenComposer = async () => {
    setIsComposerOpen(true);
    // Bug 1431: Automatically resolves ticket to ANSWERED without reply submission
    if (ticket.status !== 'ANSWERED') {
      try {
        await onUpdateStatus(ticket.id, 'ANSWERED');
        showToast('답변 작성 상태로 전환 중 티켓 상태가 변경되었습니다.', 'info');
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDraftSave = async () => {
    // Bug 1431: Saving draft also triggers premature resolve to ANSWERED
    if (ticket.status !== 'ANSWERED') {
      try {
        await onUpdateStatus(ticket.id, 'ANSWERED');
      } catch (err) {
        console.error(err);
      }
    }
    await onSaveDraft(ticket.id, replyText);
    showToast('임시저장이 완료되었습니다.', 'success');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) {
      showToast('답변 내용을 입력해 주세요.', 'error');
      return;
    }
    await onSubmitReply(ticket.id, replyText, () => {
      setReplyText('');
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RECEIVED':
        return <span className="badge badge-received">접수 (RECEIVED)</span>;
      case 'IN_PROGRESS':
        return <span className="badge badge-in_progress">처리중 (IN_PROGRESS)</span>;
      case 'ANSWERED':
        return <span className="badge badge-answered">답변완료 (ANSWERED)</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="workspace-pane" data-ticket-workspace-id={ticket.id}>
      {/* Workspace Header */}
      <div className="workspace-header">
        <div className="workspace-header-top">
          <div className="ticket-header-title">
            <span className="ticket-id" style={{ fontSize: 14 }}>#{ticket.id}</span>
            <h2>{ticket.subject}</h2>
          </div>

          <div className="ticket-header-actions">
            <select
              className="status-select"
              value={ticket.status}
              onChange={(e) => onUpdateStatus(ticket.id, e.target.value)}
            >
              <option value="RECEIVED">접수 (RECEIVED)</option>
              <option value="IN_PROGRESS">처리중 (IN_PROGRESS)</option>
              <option value="ANSWERED">답변완료 (ANSWERED)</option>
            </select>
          </div>
        </div>

        {/* Metadata Bar */}
        <div className="workspace-header-meta">
          <div className="meta-item">
            <User size={14} color="var(--amber-primary)" />
            <span><strong>{ticket.customer_name}</strong> ({ticket.customer_email})</span>
          </div>
          <div className="meta-item">
            <Tag size={14} />
            <span>카테고리: <strong>{ticket.category}</strong></span>
          </div>
          <div className="meta-item">
            <Clock size={14} />
            <span>접수일시: {ticket.created_at}</span>
          </div>
          <div className="meta-item">
            {getStatusBadge(ticket.status)}
          </div>
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="conversation-thread">
        {/* Customer Initial Inquiry */}
        <div className="message-bubble customer">
          <div className="avatar-bubble avatar-customer">
            {ticket.customer_name.substring(0, 1)}
          </div>
          <div className="bubble-content-wrap">
            <div className="bubble-header">
              <span className="bubble-author">{ticket.customer_name} (고객)</span>
              <span className="bubble-time">{ticket.created_at}</span>
            </div>
            <div className="bubble-body">
              {ticket.content}
            </div>
          </div>
        </div>

        {replies.length > 0 && (
          <div className="thread-divider">
            <span>상담원 답변 내역 ({replies.length}건)</span>
          </div>
        )}

        {/* Agent Replies Timeline */}
        {replies.map((reply) => (
          <div key={reply.id} className="message-bubble agent">
            <div className="avatar-bubble avatar-agent-reply">
              상담
            </div>
            <div className="bubble-content-wrap">
              <div className="bubble-header" style={{ justifyContent: 'flex-end' }}>
                <span className="bubble-time">{reply.created_at}</span>
                <span className="bubble-author">{reply.author}</span>
              </div>
              <div className="bubble-body" data-reply-id={reply.id}>
                {reply.content}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reply Composer Area */}
      <div className="reply-composer-section">
        <div className="composer-header">
          <div className="composer-tabs">
            <button
              className={`composer-tab ${activeTab === 'reply' ? 'active' : ''}`}
              onClick={() => setActiveTab('reply')}
            >
              <Edit3 size={14} />
              답변 작성
            </button>
            <button
              className={`composer-tab ${activeTab === 'note' ? 'active' : ''}`}
              onClick={() => setActiveTab('note')}
            >
              <Bookmark size={14} />
              내부 메모
            </button>
          </div>

          <div className={`composer-char-count ${replyText.length > 1000 ? 'exceeded' : ''}`}>
            {replyText.length} / 1000자 {replyText.length > 1000 ? '(초과)' : ''}
          </div>
        </div>

        <textarea
          className="composer-textarea"
          placeholder="고객님께 전달할 정중하고 명확한 답변을 작성해 주세요. (답변 템플릿 사용 가능)"
          value={replyText}
          onFocus={handleOpenComposer}
          onChange={(e) => setReplyText(e.target.value)}
        />

        <div className="composer-toolbar">
          <div className="toolbar-left">
            <button
              type="button"
              className="toolbar-btn btn-template"
              onClick={() => onOpenTemplates((tplText) => setReplyText(tplText))}
            >
              <FileText size={14} />
              답변 템플릿
            </button>

            <button
              type="button"
              className="toolbar-btn"
              onClick={handleOpenComposer}
            >
              <Sparkles size={14} />
              답변 영역 열기
            </button>
          </div>

          <div className="toolbar-right">
            <button
              type="button"
              className="btn-draft"
              onClick={handleDraftSave}
            >
              임시저장
            </button>

            <button
              type="button"
              className="btn-submit-reply"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              <Send size={14} />
              답변 등록
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
