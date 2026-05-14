import React from 'react';

export default function DoctorList({ doctors, selectedDoctor, onSelect }) {
  // INTENTIONAL GUI BUG: site007-bug02
  // Type: component-rendering
  // Description: 특정 의사 카드가 중복 출력된다.
  // Explanation: id가 3인 박의사 데이터를 배열에 의도적으로 한 번 더 push하여 리스트에 중복 렌더링되도록 만듦.
  
  const renderDoctors = [...doctors];
  const duplicatedDoctor = renderDoctors.find(d => d.id === 3);
  if (duplicatedDoctor) {
    // add duplicate for bug, changing id slightly to avoid React key warning if we want,
    // but even with same key or different key, it's a visual duplicate.
    renderDoctors.push({ ...duplicatedDoctor, id: '3-dup', bugTarget: true });
  }

  return (
    <div className="doctor-grid">
      {renderDoctors.map(doc => (
        <div 
          key={doc.id}
          className={`doctor-card ${selectedDoctor?.id === doc.id ? 'selected' : ''}`}
          onClick={() => onSelect(doc)}
          data-bug-id={doc.bugTarget ? "site007-bug02" : undefined}
        >
          <div className="doc-img">{doc.image}</div>
          <div className="doc-name">{doc.name}</div>
          <div className="doc-dept">{doc.dept}</div>
          <div className="doc-spec">{doc.specialty}</div>
        </div>
      ))}
      {renderDoctors.length === 0 && (
        <div style={{ color: 'var(--text-muted)' }}>해당 진료과의 의료진이 없습니다.</div>
      )}
    </div>
  );
}
