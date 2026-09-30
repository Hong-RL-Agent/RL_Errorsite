import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, User } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { fetchApi, getCurrentUser } from '../api/client';

export default function Messages({ onShowToast }) {
  const [messages, setMessages] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);

  const currentUser = getCurrentUser();

  const loadMessages = () => {
    setLoading(true);
    fetchApi('/api/messages')
      .then(data => {
        setMessages(data);
        if (data.length > 0 && !activeConversation) {
          // Group by conversation
          const first = data[0];
          setActiveConversation(first.conversationId);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadMessages();
  }, []);

  // Group messages by conversation
  const conversationsMap = {};
  messages.forEach(msg => {
    const convId = msg.conversationId || 'default';
    if (!conversationsMap[convId]) {
      conversationsMap[convId] = [];
    }
    conversationsMap[convId].push(msg);
  });

  const conversationKeys = Object.keys(conversationsMap);
  const currentConvMessages = activeConversation ? (conversationsMap[activeConversation] || []) : [];

  // Determine other participant
  const otherParticipant = currentConvMessages.length > 0
    ? (currentConvMessages[0].senderId === currentUser.id ? currentConvMessages[0].receiverName : currentConvMessages[0].senderName)
    : '호스트';

  const otherParticipantId = currentConvMessages.length > 0
    ? (currentConvMessages[0].senderId === currentUser.id ? currentConvMessages[0].receiverId : currentConvMessages[0].senderId)
    : 'host-001';

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    fetchApi('/api/messages', {
      method: 'POST',
      body: JSON.stringify({
        receiverId: otherParticipantId,
        experienceId: currentConvMessages[0]?.experienceId || 'exp-001',
        content: replyText
      })
    })
      .then(newMsg => {
        setReplyText('');
        setMessages(prev => [...prev, newMsg]);
        if (onShowToast) onShowToast('메시지를 전송했습니다.', 'success');
      })
      .catch(err => {
        if (onShowToast) onShowToast(err.message, 'error');
      });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary-navy)', marginBottom: 6 }}>
          메시지 및 문의함
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          체험 호스트 및 게스트와 실시간으로 문의 및 안내 사항을 주고받으세요.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          메시지를 불러오는 중입니다...
        </div>
      ) : messages.length === 0 ? (
        <EmptyState
          icon={<MessageSquare size={32} />}
          title="메시지 내역이 없습니다"
          description="체험 상세 페이지에서 호스트에게 궁금한 점을 문의해보세요."
        />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: 20,
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
          minHeight: 480
        }}>
          {/* Conversation List */}
          <div style={{ borderRight: '1px solid var(--border-color)', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-light)', padding: '0 8px' }}>대화 목록</span>
            {conversationKeys.map(key => {
              const msgs = conversationsMap[key];
              const lastMsg = msgs[msgs.length - 1];
              const isSelected = activeConversation === key;
              const name = lastMsg.senderId === currentUser.id ? lastMsg.receiverName : lastMsg.senderName;

              return (
                <div
                  key={key}
                  onClick={() => setActiveConversation(key)}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'var(--sky-blue-light)' : 'transparent',
                    border: isSelected ? '1px solid var(--sky-blue)' : '1px solid transparent',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: 13, color: isSelected ? 'var(--sky-blue)' : 'var(--primary-navy)' }}>{name}</strong>
                    <span style={{ fontSize: 10, color: 'var(--text-light)' }}>
                      {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {lastMsg.content}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Active Conversation Chat View */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--sky-blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sky-blue)' }}>
                <User size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary-navy)' }}>{otherParticipant}</h4>
                {currentConvMessages[0]?.experienceTitle && (
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>체험: {currentConvMessages[0].experienceTitle}</span>
                )}
              </div>
            </div>

            {/* Chat Bubble List */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {currentConvMessages.map(msg => {
                const isMe = msg.senderId === currentUser.id;
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMe ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <span style={{ fontSize: 11, color: 'var(--text-light)', marginBottom: 2 }}>{msg.senderName}</span>
                    <div
                      style={{
                        maxWidth: '70%',
                        padding: '10px 14px',
                        borderRadius: 14,
                        fontSize: 13,
                        lineHeight: 1.5,
                        backgroundColor: isMe ? 'var(--sky-blue)' : 'var(--cream-bg)',
                        color: isMe ? '#ffffff' : 'var(--text-main)',
                        border: isMe ? 'none' : '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Input Form */}
            <form onSubmit={handleSendReply} style={{ padding: '16px 20px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: 10 }}>
              <input
                id="input-chat-reply"
                type="text"
                placeholder="답장 메시지를 입력하세요..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="form-input"
              />
              <button id="btn-submit-chat-reply" type="submit" className="btn btn-primary" style={{ padding: '0 18px' }}>
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
