import React from 'react';
import { ArrowUpDown } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'popular', label: '인기순' },
  { value: 'latest', label: '최신순' },
  { value: 'cookingTime', label: '조리시간순' },
  { value: 'title', label: '이름순' }
];

export default function SortSelect({ value = 'popular', onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <ArrowUpDown size={16} color="var(--text-light)" />
      <select
        className="form-select recipe-sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: '8px 14px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.9rem',
          cursor: 'pointer',
          width: 'auto'
        }}
      >
        {SORT_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
