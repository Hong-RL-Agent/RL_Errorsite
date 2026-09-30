import React from 'react';
import {
  Stethoscope,
  Activity,
  Sparkles,
  Volume2,
  Eye,
  Smile,
  Baby,
  Brain
} from 'lucide-react';

const iconMap = {
  Stethoscope,
  Activity,
  Sparkles,
  Volume2,
  Eye,
  Smile,
  Baby,
  Brain
};

export default function DepartmentBadge({ department, isActive = false, onClick }) {
  const IconComponent = iconMap[department.icon] || Stethoscope;

  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        background: isActive ? '#0284c7' : '#ffffff',
        color: isActive ? '#ffffff' : '#334155',
        border: isActive ? '1px solid #0284c7' : '1px solid #cbd5e1',
        borderRadius: '9999px',
        fontSize: '0.88rem',
        fontWeight: 700,
        cursor: 'pointer',
        boxShadow: isActive ? '0 2px 8px rgba(2, 132, 199, 0.25)' : 'none',
        transition: 'all 0.15s ease'
      }}
    >
      <IconComponent size={16} />
      <span>{department.name}</span>
    </button>
  );
}
