import React from 'react';
import { X, Clock, BarChart3, Users } from 'lucide-react';
import IngredientChecklist from './IngredientChecklist';

export default function RecipeModal({ recipe, isOpen, onClose }) {
  if (!isOpen || !recipe) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', width: '100%', maxWidth: '800px', maxHeight: '90vh', borderRadius: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'relative' }}>
          <img src={recipe.image} alt={recipe.title} style={{ width: '100%', height: '350px', objectFit: 'cover' }} />
          <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', padding: '10px', borderRadius: '50%', cursor: 'pointer' }}><X /></button>
        </div>

        <div style={{ padding: '40px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <span style={{ background: 'var(--light)', color: 'var(--accent)', padding: '5px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 700 }}>{recipe.difficulty}</span>
            <span style={{ background: 'var(--light)', color: 'var(--accent)', padding: '5px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 700 }}>{recipe.time}</span>
          </div>
          
          <h2 style={{ fontSize: '32px', margin: '0 0 30px 0' }}>{recipe.title}</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            <div>
              <h3 style={{ fontSize: '20px', borderBottom: '2px solid var(--border)', paddingBottom: '10px', marginBottom: '20px' }}>필수 재료</h3>
              
              {/* INTENTIONAL GUI BUG: site027-bug02
                 Type: duplicate-ingredient-render
                 Description: 재료 목록 렌더링 시 특정 재료를 추가로 append하여 중복 표시함.
              */}
              <div data-bug-id="site027-bug02">
                <IngredientChecklist ingredients={recipe.ingredients} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.8, marginTop: '-10px' }}>
                  <input type="checkbox" readOnly checked={false} />
                  <span style={{ fontSize: '15px' }}>{recipe.ingredients[0]} (중복)</span>
                </div>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '20px', borderBottom: '2px solid var(--border)', paddingBottom: '10px', marginBottom: '20px' }}>조리 단계</h3>
              <div style={{ display: 'grid', gap: '20px' }}>
                {recipe.steps.map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ width: '24px', height: '24px', background: 'var(--wood)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0 }}>
                      {idx + 1}
                    </div>
                    <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.5 }}>{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '20px 40px', background: '#fcfcfc', borderTop: '1px solid #eee', textAlign: 'center' }}>
          <button className="btn btn-primary" style={{ padding: '12px 40px' }} onClick={() => alert('레시피 저장 준비중입니다.')}>레시피 저장하기</button>
        </div>
      </div>
    </div>
  );
}
