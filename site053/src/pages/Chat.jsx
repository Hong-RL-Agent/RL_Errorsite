import React, { useState, useEffect } from 'react';
import ChatPanel from '../components/ChatPanel';
import { api } from '../api/client';

export default function Chat({ activeChatId, onSelectProduct, showToast }) {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadChats() {
      setLoading(true);
      try {
        const res = await api.getChats();
        if (res && res.chats) {
          setChats(res.chats);
          if (activeChatId) {
            const found = res.chats.find(c => c.id === activeChatId || c.productId === activeChatId);
            if (found) setSelectedChat(found);
            else setSelectedChat(res.chats[0]);
          } else if (res.chats.length > 0) {
            setSelectedChat(res.chats[0]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadChats();
  }, [activeChatId]);

  const handleSendMessage = async (chatId, text) => {
    try {
      const res = await api.sendMessage(chatId, text);
      if (res && res.message) {
        setChats(prev => prev.map(c => {
          if (c.id === chatId) {
            return {
              ...c,
              lastMessage: text,
              lastTime: res.message.time,
              messages: [...c.messages, res.message]
            };
          }
          return c;
        }));

        setSelectedChat(prev => {
          if (prev && prev.id === chatId) {
            return {
              ...prev,
              lastMessage: text,
              lastTime: res.message.time,
              messages: [...prev.messages, res.message]
            };
          }
          return prev;
        });
      }
    } catch (err) {
      if (showToast) showToast('메시지 전송 실패', 'error');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '4px' }}>
          실시간 이웃 채팅
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          상품 거래 문의 및 약속 일정을 실시간으로 조율하세요.
        </p>
      </div>

      <div className="chat-window-shell">
        {/* Left Chat Room List */}
        <div className="chat-room-sidebar">
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-light)', fontSize: '1.05rem', fontWeight: '900', color: 'var(--text-main)' }}>
            전체 대화 ({chats.length})
          </div>

          <div className="chat-room-list-scroll">
            {loading ? (
              <div style={{ padding: '24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                대화 목록 불러오는 중...
              </div>
            ) : chats.length === 0 ? (
              <div style={{ padding: '24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                진행 중인 채팅방이 없습니다.
              </div>
            ) : (
              chats.map(chat => (
                <div
                  key={chat.id}
                  className={`chat-room-tile ${selectedChat?.id === chat.id ? 'active' : ''}`}
                  onClick={() => setSelectedChat(chat)}
                >
                  <img
                    src={chat.partnerAvatar}
                    alt={chat.partnerName}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-light)' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-main)' }}>
                        {chat.partnerName}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                        {chat.lastTime}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {chat.lastMessage}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Active Chat Panel */}
        <ChatPanel
          chat={selectedChat}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}
