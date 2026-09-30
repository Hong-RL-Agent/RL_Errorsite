import React from 'react';
import { Plus, Trash2, AlertTriangle, Utensils } from 'lucide-react';

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
const SLOTS = ['아침', '점심', '저녁'];

export default function MealCalendar({ mealPlans = [], onAddSlot, onDeleteSlot, onRecipeClick }) {
  return (
    <div className="calendar-grid">
      {DAYS.map(day => (
        <div key={day} className="calendar-day-col">
          <div className="calendar-day-header">{day}요일</div>

          {SLOTS.map(slot => {
            const plan = mealPlans.find(p => p.day === day && p.slot === slot);
            return (
              <div key={slot} className="calendar-slot">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="slot-label">{slot}</span>
                    {plan && (
                      <button
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '2px', color: '#ef4444' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSlot(plan.id);
                        }}
                        title="식단에서 삭제"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  {plan ? (
                    <div 
                      style={{ cursor: 'pointer', marginTop: '4px' }}
                      onClick={() => onRecipeClick(plan.recipeId)}
                    >
                      {plan.isDangling && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#dc2626', fontSize: '0.75rem', fontWeight: '700', marginBottom: '2px' }}>
                          <AlertTriangle size={12} />
                          <span>참조 누락</span>
                        </div>
                      )}
                      <div className="slot-recipe-title" style={{ color: plan.isDangling ? '#991b1b' : 'var(--text-main)' }}>
                        {plan.recipeTitle}
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-subtle)', fontSize: '0.8rem', padding: '8px 0' }}>
                      식단 비어있음
                    </div>
                  )}
                </div>

                {!plan && (
                  <button 
                    className="btn-secondary" 
                    style={{ padding: '4px 8px', fontSize: '0.75rem', width: '100%', borderRadius: 'var(--radius-sm)' }}
                    onClick={() => onAddSlot(day, slot)}
                  >
                    <Plus size={12} />
                    <span>추가</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
