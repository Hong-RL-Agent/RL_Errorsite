import React, { useState } from 'react';

export default function ChatPanel({ chat, onSendMessage }) {
  const [inputText, setInputText] = useState('');

  if (!chat) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>💬</div>
        <div>왼쪽 대화 목록에서 채팅방을 선택해주세요.</div>
      </div>
    );
  }

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(chat.id, inputText);
    setInputText('');
  };

  return (
    <div className="chat-conversation-pane">
      {/* Product Summary Header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid var(--border-light)',
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img
            src={chat.partnerAvatar}
            alt={chat.partnerName}
            style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <div style={{ fontSize: '1rem', fontWeight: '900', color: 'var(--text-main)' }}>
              {chat.partnerName}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {chat.productTitle} · <strong style={{ color: 'var(--text-main)' }}>{Number(chat.productPrice).toLocaleString('ko-KR')}원</strong>
            </div>
          </div>
        </div>

        <button className="btn-solid-secondary" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
          🤝 거래약속 잡기
        </button>
      </div>

      {/* Message Feed */}
      <div className="chat-message-feed">
        {chat.messages.map((m, idx) => (
          <div key={idx} className={`chat-bubble-node ${m.sender}`}>
            <div>{m.text}</div>
            <div style={{ fontSize: '0.72rem', opacity: 0.75, textAlign: m.sender === 'me' ? 'right' : 'left', marginTop: '4px' }}>
              {m.time}
            </div>
          </div>
        ))}
      </div>

      {/* Input Message Area */}
      <form onSubmit={handleSend} style={{ padding: '16px 24px', borderTop: '1px solid var(--border-light)', background: 'white', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          className="form-text-input"
          placeholder="이웃에게 보낼 메시지를 입력하세요..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button type="submit" className="btn-solid-primary" style={{ padding: '0 24px', flexShrink: 0 }}>
          전송
        </button>
      </form>
    </div>
  );
}
