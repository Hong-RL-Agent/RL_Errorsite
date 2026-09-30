import React, { useEffect, useState } from 'react';
import { Send, User, MessageSquare } from 'lucide-react';
import { fetchApi } from '../api/client';
import { showToast } from '../components/Toast';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const data = await fetchApi('/api/messages');
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Triggers SEC-390: async-no-feedback on Message Sending
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const currentText = inputText;
    setInputText('');

    // Intentionally without progress/loading feedback UI state for SEC-390
    fetchApi('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ text: currentText })
    }).then((data) => {
      showToast('메시지 전송', '메시지가 전송되었습니다.', 'info');
      loadMessages();
    }).catch((err) => {
      showToast('전송 실패', err.message, 'error');
    });
  };

  return (
    <div className="main-wrapper">
      <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px' }}>1:1 펫시터 안심 대화</h1>

      <div className="card-box" style={{ maxWidth: '720px', margin: '0 auto', height: '600px', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        {/* Chat Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8faf7', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2d6a4f' }}>
            <User size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '15px' }}>김민지 펫시터</div>
            <div style={{ fontSize: '12px', color: '#2d6a4f', fontWeight: 700 }}>● 실시간 상담 가능</div>
          </div>
        </div>

        {/* Message Thread */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                alignSelf: m.isMe ? 'flex-end' : 'flex-start',
                maxWidth: '70%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: m.isMe ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{ fontSize: '11.5px', color: '#8d99ae', marginBottom: '2px' }}>{m.sender}</div>
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '14px',
                  background: m.isMe ? '#2d6a4f' : '#f1f5f9',
                  color: m.isMe ? 'white' : '#1b261e',
                  fontSize: '14px',
                  lineHeight: 1.5
                }}
              >
                {m.text}
              </div>
              <div style={{ fontSize: '10.5px', color: '#8d99ae', marginTop: '2px' }}>{m.time}</div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} style={{ padding: '16px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px', background: 'white' }}>
          <input
            type="text"
            placeholder="시터에게 궁금한 점이나 전달사항을 입력하세요..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #cbd5e1', outline: 'none', fontSize: '14px' }}
          />
          <button type="submit" className="primary-btn" style={{ padding: '0 20px' }}>
            <Send size={16} />
            <span>전송</span>
          </button>
        </form>
      </div>
    </div>
  );
}
