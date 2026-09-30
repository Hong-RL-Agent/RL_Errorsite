import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, User, CheckCircle2, Sparkles } from 'lucide-react';

export default function Chat({ onShowToast }) {
  const [rooms, setRooms] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState('chat-601');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    fetchChat();
  }, []);

  const fetchChat = async () => {
    try {
      const res = await fetch('/api/chat');
      const data = await res.json();
      setRooms(data.rooms || []);
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  const activeRoom = rooms.find(r => r.id === activeRoomId) || rooms[0];
  const roomMessages = messages.filter(m => m.roomId === activeRoomId);

  // SEC-378: Chat Message Sending
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: activeRoomId,
          text: inputText.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessages([...messages, data.message]);
        setInputText('');
        onShowToast({
          title: '질문 메시지 전송 완료',
          message: '강사님께 실시간 학습 질문이 전송되었습니다.',
          type: 'success',
          bugId: data.bugId,
          secId: data.secId,
          reqId: data.request_id
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">강사 1:1 학습 질문 & 상담</h1>
          <p className="page-subtitle">수강 중 막히는 코드나 아키텍처 궁금증을 담당 튜터에게 1:1로 질문하세요.</p>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: '560px' }}>
        {/* Room List */}
        <div style={{ borderRight: '1px solid var(--border)', background: '#f8fafc', padding: '16px 0' }}>
          <div style={{ padding: '0 18px 12px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
            대화 중인 튜터 & 상담
          </div>
          {rooms.map((r) => (
            <div
              key={r.id}
              onClick={() => setActiveRoomId(r.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 18px',
                background: activeRoomId === r.id ? '#ffffff' : 'transparent',
                borderLeft: activeRoomId === r.id ? '3px solid var(--primary)' : '3px solid transparent',
                cursor: 'pointer'
              }}
            >
              <img
                src={r.avatar}
                alt=""
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{r.partnerName}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 400 }}>{r.lastTime}</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>{r.partnerRole}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                  {r.lastMessage}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Conversation Area */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Partner Header */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', background: '#ffffff' }}>
            <img
              src={activeRoom?.avatar}
              alt=""
              style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-main)' }}>{activeRoom?.partnerName}</div>
              <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600 }}>● 실시간 응답 가능 (평균 15분 내 답변)</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: '#fcfdfe' }}>
            {roomMessages.map((m) => {
              const isMe = m.sender === 'user-001';
              return (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMe ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    {m.senderName} ({m.time})
                  </div>
                  <div
                    style={{
                      maxWidth: '70%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: isMe ? 'var(--primary)' : '#ffffff',
                      color: isMe ? '#ffffff' : 'var(--text-main)',
                      border: isMe ? 'none' : '1px solid var(--border)',
                      fontSize: '13px',
                      lineHeight: 1.5,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* SEC-378: Input Bar */}
          <form onSubmit={handleSendMessage} style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', background: '#ffffff', display: 'flex', gap: '10px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="질문하실 내용을 입력하세요..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
              <Send size={15} /> 전송
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
