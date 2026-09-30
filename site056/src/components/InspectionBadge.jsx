import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function InspectionBadge({ grade = 'A', score = null, size = 'md' }) {
  const getGradeClass = (g) => {
    switch (g) {
      case 'S':
        return 'grade-S';
      case 'A+':
        return 'grade-A-plus';
      case 'A':
        return 'grade-A';
      case 'B+':
        return 'grade-B-plus';
      case 'B':
        return 'grade-B';
      default:
        return 'grade-A';
    }
  };

  const isSmall = size === 'sm';

  return (
    <span
      className={`badge-grade ${getGradeClass(grade)}`}
      style={{
        padding: isSmall ? '2px 6px' : '4px 10px',
        fontSize: isSmall ? '0.75rem' : '0.85rem',
        borderRadius: '6px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}
    >
      <ShieldCheck size={isSmall ? 13 : 15} />
      <span>등급 {grade}</span>
      {score !== null && <span style={{ opacity: 0.85 }}>({score}점)</span>}
    </span>
  );
}
