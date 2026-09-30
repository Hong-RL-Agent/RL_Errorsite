import React, { useEffect, useState } from 'react';
import { Dog, Plus, Edit2, ShieldCheck, Heart } from 'lucide-react';
import { fetchApi } from '../api/client';
import { showToast } from '../components/Toast';

export default function Pets() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPet, setEditingPet] = useState(null);
  const [noteForm, setNoteForm] = useState({ specialNotes: '', personality: '' });

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/api/pets');
      setPets(data.pets || []);
    } catch (err) {
      showToast('오류', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (pet) => {
    setEditingPet(pet);
    setNoteForm({ specialNotes: pet.specialNotes || '', personality: pet.personality || '' });
  };

  // Triggers SEC-388: async-no-feedback on Pet Note/Bio
  const handleSaveNotes = async (e) => {
    e.preventDefault();
    if (!editingPet) return;
    
    // NOTE: Intentionally without loading/cancel feedback UI state for SEC-388
    fetchApi(`/api/pets/${editingPet.id}/notes`, {
      method: 'PATCH',
      body: JSON.stringify(noteForm)
    }).then((res) => {
      showToast('저장 완료', '반려동물 케어 메모가 수정되었습니다.', 'success');
      setEditingPet(null);
      loadPets();
    }).catch((err) => {
      showToast('오류', err.message, 'error');
    });
  };

  return (
    <div className="main-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>내 반려동물 프로필</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>돌봄 시터에게 공유되는 우리 아이 건강 및 성향 정보입니다.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
        {pets.map((pet) => (
          <div key={pet.id} className="card-box" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginBottom: '16px' }}>
              <img src={pet.image} alt={pet.name} style={{ width: '90px', height: '90px', borderRadius: '16px', objectFit: 'cover' }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1b4332' }}>{pet.name}</h2>
                  <button onClick={() => handleOpenEdit(pet)} style={{ color: '#2d6a4f', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Edit2 size={14} />
                    <span>케어 메모 수정</span>
                  </button>
                </div>
                <div style={{ fontSize: '13.5px', color: '#526156', marginTop: '4px' }}>
                  {pet.breed} · {pet.age} · {pet.weight}
                </div>
                <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                  {pet.gender}
                </div>
              </div>
            </div>

            <div style={{ background: '#f8faf7', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#2d6a4f' }}>🐾 성격 및 특징</span>
                <p style={{ fontSize: '13.5px', color: '#1b261e', marginTop: '2px' }}>{pet.personality}</p>
              </div>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#f4a261' }}>📋 시터 전달 특이사항 & 배변 안내</span>
                <p style={{ fontSize: '13.5px', color: '#1b261e', marginTop: '2px' }}>{pet.specialNotes}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Notes Modal */}
      {editingPet && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>[{editingPet.name}] 케어 메모 수정</h3>
            <form onSubmit={handleSaveNotes}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>성격 및 특징</label>
                <textarea
                  rows="3"
                  value={noteForm.personality}
                  onChange={(e) => setNoteForm({ ...noteForm, personality: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>시터 전달 특이사항 & 간식/산책 메모</label>
                <textarea
                  rows="3"
                  value={noteForm.specialNotes}
                  onChange={(e) => setNoteForm({ ...noteForm, specialNotes: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setEditingPet(null)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}>
                  취소
                </button>
                <button type="submit" className="primary-btn">
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
