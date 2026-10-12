import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { updatePet } from '../lib/api';

export default function PetEditModal({
  pet,
  isOpen,
  onClose,
  onPetUpdated,
  onNotify
}) {
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState(1);
  const [gender, setGender] = useState('남아');
  const [weight, setWeight] = useState(0);
  const [allergies, setAllergies] = useState('없음');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (pet) {
      setName(pet.name);
      setBreed(pet.breed);
      setAge(pet.age);
      setGender(pet.gender);
      setWeight(pet.weight);
      setAllergies(pet.allergies || '없음');
    }
  }, [pet]);

  if (!isOpen || !pet) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await updatePet(pet.id, {
        name,
        breed,
        age: parseInt(age, 10),
        gender,
        weight: parseFloat(weight),
        allergies
      });

      if (res.success) {
        onNotify && onNotify(`${pet.name}의 프로필 정보가 수정되었습니다.`, 'success');
        onPetUpdated && onPetUpdated();
        onClose();
      }
    } catch (err) {
      onNotify && onNotify(err.message || '수정에 실패했습니다.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>{pet.avatar || '🐾'}</span>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#2D3748' }}>
              [{pet.name}] 프로필 정보 수정
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
            <div className="form-group">
              <label className="form-label">반려동물 이름</label>
              <input
                type="text"
                required
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">품종</label>
                <input
                  type="text"
                  required
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
                <label className="form-label">현재 체중 (kg)</label>
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
                placeholder="예: 닭고기, 유제품, 없음"
                className="form-input"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              취소
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? '저장 중...' : '변경사항 저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
