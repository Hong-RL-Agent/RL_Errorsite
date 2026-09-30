import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function IngredientEditor({ ingredients = [], setIngredients, steps = [], setSteps }) {
  // Ingredient handlers
  const handleIngredientChange = (idx, value) => {
    const updated = [...ingredients];
    updated[idx] = value;
    setIngredients(updated);
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const handleRemoveIngredient = (idx) => {
    if (ingredients.length <= 1) {
      setIngredients(['']);
      return;
    }
    setIngredients(ingredients.filter((_, i) => i !== idx));
  };

  // Step handlers
  const handleStepChange = (idx, value) => {
    const updated = [...steps];
    updated[idx] = value;
    setSteps(updated);
  };

  const handleAddStep = () => {
    setSteps([...steps, '']);
  };

  const handleRemoveStep = (idx) => {
    if (steps.length <= 1) {
      setSteps(['']);
      return;
    }
    setSteps(steps.filter((_, i) => i !== idx));
  };

  return (
    <div>
      {/* Ingredients Section */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <label className="form-label" style={{ marginBottom: 0 }}>필요 재료</label>
          <button 
            type="button" 
            className="btn-secondary" 
            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
            onClick={handleAddIngredient}
          >
            <Plus size={14} />
            <span>재료 추가</span>
          </button>
        </div>

        {ingredients.map((ing, idx) => (
          <div key={idx} className="dynamic-item-row">
            <input 
              type="text"
              className="form-input"
              placeholder={`예: 스파게티 면 160g, 토마토 2개 (${idx + 1})`}
              value={ing}
              onChange={(e) => handleIngredientChange(idx, e.target.value)}
            />
            <button 
              type="button" 
              className="icon-button"
              style={{ width: '42px', height: '42px', flexShrink: 0 }}
              onClick={() => handleRemoveIngredient(idx)}
              title="삭제"
            >
              <Trash2 size={16} color="#ef4444" />
            </button>
          </div>
        ))}
      </div>

      {/* Cooking Steps Section */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <label className="form-label" style={{ marginBottom: 0 }}>조리 순서</label>
          <button 
            type="button" 
            className="btn-secondary" 
            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
            onClick={handleAddStep}
          >
            <Plus size={14} />
            <span>조리 순서 추가</span>
          </button>
        </div>

        {steps.map((step, idx) => (
          <div key={idx} className="dynamic-item-row" style={{ alignItems: 'flex-start' }}>
            <span style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              background: 'var(--primary)', 
              color: '#fff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '0.85rem',
              flexShrink: 0,
              marginTop: '6px'
            }}>
              {idx + 1}
            </span>
            <textarea 
              className="form-textarea"
              placeholder={`조리 과정 ${idx + 1}을 설명해주세요`}
              rows={2}
              value={step}
              onChange={(e) => handleStepChange(idx, e.target.value)}
              style={{ minHeight: '60px' }}
            />
            <button 
              type="button" 
              className="icon-button"
              style={{ width: '42px', height: '42px', flexShrink: 0, marginTop: '4px' }}
              onClick={() => handleRemoveStep(idx)}
              title="삭제"
            >
              <Trash2 size={16} color="#ef4444" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
