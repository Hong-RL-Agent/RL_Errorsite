import React from 'react';

export default function InstructorSection() {
  const instructors = [
    { name: '김데브', role: '프론트엔드 수석 엔지니어', company: '테크 코퍼레이션', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop' },
    { name: '이디자인', role: 'UI/UX 리드 디자이너', company: '크리에이티브 스튜디오', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop' },
    { name: '최데이터', role: '시니어 데이터 사이언티스트', company: '데이터 랩스', img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop' }
  ];

  return (
    <section style={{marginTop: '4rem'}}>
      <h2 style={{fontSize: '1.5rem', marginBottom: '1.5rem'}}>최고의 강사진</h2>
      <div style={{display: 'flex', gap: '2rem', flexWrap: 'wrap'}}>
        {instructors.map(inst => (
          <div key={inst.name} style={{display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--white)', padding: '1rem', borderRadius: '12px', flex: '1 1 300px', boxShadow: 'var(--shadow-sm)'}}>
            <img src={inst.img} alt={inst.name} style={{width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover'}} />
            <div>
              <h4 style={{fontSize: '1.1rem', marginBottom: '0.25rem'}}>{inst.name}</h4>
              <p className="text-muted" style={{fontSize: '0.875rem'}}>{inst.role}</p>
              <p className="text-muted" style={{fontSize: '0.75rem'}}>{inst.company}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
