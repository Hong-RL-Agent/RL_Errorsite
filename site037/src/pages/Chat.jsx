import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Users, Theater } from 'lucide-react';

export default function Chat({ showToast, currentUser }) {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('room-701');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  const loadRooms = () => {
    fetch('/api/chats')
      .then(res => res.json())
      .then(d => {
        setRooms(d);
        if (d.length > 0 && !selectedRoom) {
          setSelectedRoom(d[0].id);
        }
      })
      .catch(err => console.error(err));
  };

  const loadMessages = (roomId) => {
    if (!roomId) return;
    fetch(`/api/chats/${roomId}/messages`)
      .then(res => res.json())
      .then(d => setMessages(d))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom);
    }
  }, [selectedRoom]);

  // Send message handler (SEC-348 / site037-bug08)
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedRoom) return;

    setSending(true);
    const idempotency_key = `CHAT-${Date.now()}-${Math.floor(Math.random()*1000)}`;

    fetch(`/api/chats/${selectedRoom}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: inputText.trim(),
        idempotency_key
      })
    })
    .then(res => res.json())
    .then(data => {
      setSending(false);
      setInputText('');
      loadMessages(selectedRoom);
      showToast('메시지 전송 완료', '관객 소통방에 메시지가 등록되었습니다.', 'success', data.transaction_id, data.bugId, data.secId);
    })
    .catch(err => {
      console.error(err);
      setSending(false);
    });
  };

  const currentRoomObj = rooms.find(r => r.id === selectedRoom);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--dark-900)' }}>공연별 관객 실시간 소통방</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)' }}>같은 공연을 관람하는 관객들과 감상과 기대평을 나누어보세요.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px', minHeight: '520px' }}>
        {/* Rooms Sidebar */}
        <div className="card" style={{ padding: '16px' }}>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--gray-600)', marginBottom: '12px' }}>
            채팅 라운지 목록
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {rooms.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRoom(r.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: selectedRoom === r.id ? '2px solid var(--primary)' : '1px solid var(--gray-200)',
                  backgroundColor: selectedRoom === r.id ? 'var(--primary-light)' : '#ffffff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'var(--transition-fast)'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--dark-900)' }}>{r.name}</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <Users size={12} /> {r.activeUsers}명 참여 중
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px' }}>
          {/* Room Header */}
          <div style={{ borderBottom: '1px solid var(--gray-200)', paddingBottom: '12px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--dark-900)' }}>
              {currentRoomObj?.name || '관객 소통방'}
            </h3>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px', maxHeight: '360px' }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0' }}>등록된 대화가 없습니다. 첫 메시지를 남겨보세요!</div>
            ) : (
              messages.map((m, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <img src={m.senderAvatar} alt={m.sender} style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--dark-900)' }}>{m.sender}</span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--gray-400)' }}>{m.time}</span>
                    </div>
                    <div style={{ background: '#faf7f2', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', fontSize: '0.9rem', color: 'var(--dark-900)' }}>
                      {m.text}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input Form (SEC-348) */}
          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="관객들과 나눌 메시지를 입력하세요..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary" disabled={sending || !inputText.trim()}>
              <Send size={16} /> 전송
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
