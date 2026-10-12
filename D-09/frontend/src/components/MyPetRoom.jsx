import React, { useState } from 'react';
import { Plus, Edit3, AlertCircle, Heart, Calendar } from 'lucide-react';

export default function MyPetRoom({
  pets = [],
  currentUser,
  onOpenNewPet,
  onEditPet,
  onEditCareNotes,
  onBookPet
}) {
  const [filterOwnerOnly, setFilterOwnerOnly] = useState(true);

  const displayedPets = filterOwnerOnly && currentUser
    ? pets.filter((p) => p.user_id === currentUser.id)
    : pets;

  return (
    <div>
      {/* Section Banner */}
      <div className="section-banner">
        <div>
          <h2 className="section-title">
            <Heart size={22} color="#FF6B6B" />
            <span>{filterOwnerOnly ? `${currentUser?.name} 보호자님의 펫룸` : 'PawCare 등록 반려동물 전체 목록'}</span>
          </h2>
          <p className="section-subtitle">
            {filterOwnerOnly
              ? `등록된 아이들의 건강 정보와 미용/돌봄 주의사항을 관리하고 바로 예약할 수 있습니다. (${displayedPets.length}마리)`
              : `센터에 등록된 모든 반려동물 프로필입니다. (${displayedPets.length}마리)`}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Owner Filter Toggle */}
          <div style={{ display: 'flex', background: '#FAF5ED', padding: '4px', borderRadius: '10px', border: '1px solid #EDE8DF' }}>
            <button
              onClick={() => setFilterOwnerOnly(true)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: filterOwnerOnly ? '#FFFFFF' : 'transparent',
                fontWeight: '700',
                fontSize: '12px',
                color: filterOwnerOnly ? '#3B82A6' : '#718096',
                cursor: 'pointer'
              }}
            >
              내 아이들만 보기
            </button>
            <button
              onClick={() => setFilterOwnerOnly(false)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: !filterOwnerOnly ? '#FFFFFF' : 'transparent',
                fontWeight: '700',
                fontSize: '12px',
                color: !filterOwnerOnly ? '#3B82A6' : '#718096',
                cursor: 'pointer'
              }}
            >
              전체 둘러보기
            </button>
          </div>

          {/* New Pet Registration Button */}
          <button className="btn btn-primary" onClick={onOpenNewPet}>
            <Plus size={16} />
            <span>반려동물 등록</span>
          </button>
        </div>
      </div>

      {/* Pets Grid */}
      {displayedPets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', borderRadius: '20px', border: '1.5px dashed #EDE8DF' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🐶</div>
          <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '6px' }}>등록된 반려동물이 없습니다</h3>
          <p style={{ fontSize: '13px', color: '#718096', marginBottom: '18px' }}>
            우측 상단의 [반려동물 등록] 버튼을 눌러 소중한 반려동물을 등록해보세요!
          </p>
          <button className="btn btn-primary btn-sm" onClick={onOpenNewPet}>
            <Plus size={14} />
            <span>첫 반려동물 등록하기</span>
          </button>
        </div>
      ) : (
        <div className="pets-grid">
          {displayedPets.map((pet) => (
            <div key={pet.id} className="paw-card pet-card" data-pet-id={pet.id}>
              <div>
                {/* Top Avatar & Name */}
                <div className="pet-card-top">
                  <div className="pet-avatar-large">
                    {pet.avatar || '🐾'}
                  </div>
                  <div>
                    <span className="pet-badge-species">
                      {pet.species} • {pet.breed}
                    </span>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#2D3748' }}>
                      {pet.name}
                    </h3>
                    <p style={{ fontSize: '11px', color: '#8C9BAE' }}>
                      보호자: {pet.owner_name || currentUser?.name}
                    </p>
                  </div>
                </div>

                {/* Details List */}
                <div className="pet-details-list">
                  <div className="pet-detail-row">
                    <span className="pet-detail-label">나이 / 성별</span>
                    <span className="pet-detail-val">{pet.age}살 ({pet.gender})</span>
                  </div>
                  <div className="pet-detail-row">
                    <span className="pet-detail-label">체중</span>
                    <span className="pet-detail-val" style={{ color: '#3B82A6' }}>{pet.weight} kg</span>
                  </div>
                  <div className="pet-detail-row">
                    <span className="pet-detail-label">식이 알러지</span>
                    <span className="pet-detail-val" style={{ color: pet.allergies && pet.allergies !== '없음' ? '#E53E3E' : '#718096' }}>
                      {pet.allergies || '없음'}
                    </span>
                  </div>
                </div>

                {/* Care Notes Box */}
                {pet.care_notes && (
                  <div className="care-notes-box">
                    <div style={{ fontWeight: '700', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={12} />
                      <span>돌봄 주의사항</span>
                    </div>
                    <div>{pet.care_notes}</div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ borderTop: '1px solid #EDE8DF', paddingTop: '14px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onEditPet(pet)}
                    title="기본 프로필(이름, 체중 등) 수정"
                  >
                    <Edit3 size={13} />
                    <span>프로필 수정</span>
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onEditCareNotes(pet)}
                    title="돌봄 주의사항 변경"
                    style={{ borderColor: '#FFC9C9', color: '#C92A2A' }}
                  >
                    <span>주의사항 변경</span>
                  </button>
                </div>

                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => onBookPet(pet)}
                >
                  <Calendar size={13} />
                  <span>이 아이로 케어 예약하기</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
