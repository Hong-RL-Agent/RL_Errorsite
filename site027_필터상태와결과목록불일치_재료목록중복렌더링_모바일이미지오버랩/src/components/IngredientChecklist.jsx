import React, { useState } from 'react';

export default function IngredientChecklist({ ingredients }) {
  const [checked, setChecked] = useState({});

  const toggle = (ing) => {
    setChecked({ ...checked, [ing]: !checked[ing] });
  };

  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      {ingredients.map((ing, idx) => (
        <label key={idx} className="checklist-item">
          <input 
            type="checkbox" 
            checked={!!checked[ing]} 
            onChange={() => toggle(ing)} 
            style={{ width: '18px', height: '18px', accentColor: 'var(--accent)' }}
          />
          <span style={{ fontSize: '15px', color: checked[ing] ? '#999' : 'inherit', textDecoration: checked[ing] ? 'line-through' : 'none' }}>
            {ing}
          </span>
        </label>
      ))}
    </div>
  );
}
