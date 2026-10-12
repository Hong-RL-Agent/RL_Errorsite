import React, { useState } from 'react';
import { X } from 'lucide-react';
import { createPet } from '../lib/api';

const AVATARS = ['🐶', '🐕', '🐩', '🦮', '🐱', '🐈', '🐾'];

export default function NewPetModal({
  userId,
  userName,
  isOpen,
  onClose,
  onPetCreated,
  onNotify
}) {
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('강아지');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState(1);
  const [gender, setGender] = useState('남아');
  const [weight, setWeight] = useState(4.0);
  const [careNotes, setCareNotes] = useState('');
  const [allergies, setAllergies] = useState('없음');
  const [avatar, setAvatar] = useState('🐶');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !breed.trim()) {
      onNotify && onNotify('이름과 품종을 입력해주세요.', 'error');
      return;
    }

    try {
      setSaving(true);
      const res = await createPet({
        userId,
        name: name.trim(),
        species,
        breed: breed.trim(),
        age: parseInt(age, 10),
        gender,
        weight: parseFloat(weight),
        careNotes: careNotes.trim(),
        allergies: allergies.trim(),
        avatar
      });

      if (res.success) {
        onNotify && onNotify(`새 반려동물 [${name}]이(가) 등록되었습니다.`, 'success');
        setName('');
        setBreed('');
        setCareNotes('');
        onPetCreated && onPetCreated();
        onClose();
      }
    } catch (err) {
      onNotify && onNotify(err.message || '등록 실패', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🐾</span>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#2D3748' }}>
              새 반려동물 가족 등록 ({userName} 보호자님)
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#8C9BAE' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Avatar Picker */}
            <div className="form-group">
              <label className="form-label">프로필 아이콘 선택</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {AVATARS.map((av) => (
                  <button
                    type="button"
                    key={av}
                    onClick={() => setAvatar(av)}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      border: avatar === av ? '2px solid #3B82A6' : '1px solid #EDE8DF',
                      background: avatar === av ? '#EBF4F6' : '#FFFFFF',
                      fontSize: '20px',
                      cursor: 'pointer'
                    }}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">이름 *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 뽀삐"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">종류</label>
                <select
                  className="form-select"
                  value={species}
                  onChange={(e) => {
                    setSpecies(e.target.value);
                    if (e.target.value === '고양이' && avatar === '🐶') setAvatar('🐱');
                    if (e.target.value === '강아지' && avatar === '🐱') setAvatar('🐶');
                  }}
                >
                  <option value="강아지">강아지 (Dog)</option>
                  <option value="고양이">고양이 (Cat)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">품종 *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 말티즈, 푸들, 코숏"
                  className="form-input"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">성별</label>
                <select
                  className="form-select"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="남아">남아</option>
                  <option value="여아">여아</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">나이 (살)</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  required
                  className="form-input"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">체중 (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  className="form-input"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">식이 알러지 정보</label>
              <input
                type="text"
                placeholder="예: 닭고기, 연어, 없음"
                className="form-input"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">돌봄 주의사항</label>
              <textarea
                rows={2}
                placeholder="미용사 및 돌봄 매니저에게 전달할 특이사항..."
                className="form-textarea"
                value={careNotes}
                onChange={(e) => setCareNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              취소
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? '등록 중...' : '등록 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
