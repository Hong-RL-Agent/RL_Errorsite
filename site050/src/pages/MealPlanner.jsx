import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, ArrowRight, Utensils, AlertTriangle } from 'lucide-react';
import MealCalendar from '../components/MealCalendar';
import { api } from '../api/client';

export default function MealPlanner({ navigate }) {
  const [mealPlans, setMealPlans] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState('월');
  const [selectedSlot, setSelectedSlot] = useState('저녁');
  const [selectedRecipeId, setSelectedRecipeId] = useState('');

  useEffect(() => {
    loadPlansAndRecipes();
  }, []);

  const loadPlansAndRecipes = async () => {
    setLoading(true);
    try {
      const [plans, recRes] = await Promise.all([
        api.getMealPlans(),
        api.getRecipes()
      ]);
      setMealPlans(plans || []);
      setRecipes(recRes.recipes || []);
      if (recRes.recipes?.length > 0) {
        setSelectedRecipeId(recRes.recipes[0].id.toString());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = (day, slot) => {
    setSelectedDay(day);
    setSelectedSlot(slot);
    setShowAddModal(true);
  };

  const handleAddMeal = async (e) => {
    e.preventDefault();
    try {
      await api.addMealPlan({
        day: selectedDay,
        slot: selectedSlot,
        recipeId: parseInt(selectedRecipeId, 10)
      });
      setShowAddModal(false);
      loadPlansAndRecipes();
    } catch (err) {
      alert('식단 추가 실패');
    }
  };

  const handleDeleteSlot = async (id) => {
    try {
      await api.deleteMealPlan(id);
      setMealPlans(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert('삭제 실패');
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>
            주간 식단 캘린더
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            이번 주 월요일부터 일요일까지의 식단을 계획하고 균형 잡힌 식사를 준비하세요.
          </p>
        </div>

        <button 
          className="btn-primary" 
          style={{ width: 'auto', padding: '12px 22px' }}
          onClick={() => handleOpenAdd('월', '저녁')}
        >
          <Plus size={18} />
          <span>식단 메뉴 추가</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-light)' }}>
          식단 캘린더를 불러오는 중입니다...
        </div>
      ) : (
        <MealCalendar 
          mealPlans={mealPlans} 
          onAddSlot={handleOpenAdd}
          onDeleteSlot={handleDeleteSlot}
          onRecipeClick={(recId) => navigate(`/recipes/${recId}`)}
        />
      )}

      {/* Add Slot Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-title">식단 슬롯 추가</h3>
              <button className="icon-button" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddMeal}>
              <div className="form-group">
                <label className="form-label">요일</label>
                <select className="form-select" value={selectedDay} onChange={e => setSelectedDay(e.target.value)}>
                  {['월', '화', '수', '목', '금', '토', '일'].map(d => (
                    <option key={d} value={d}>{d}요일</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">식사 시간</label>
                <select className="form-select" value={selectedSlot} onChange={e => setSelectedSlot(e.target.value)}>
                  <option value="아침">아침</option>
                  <option value="점심">점심</option>
                  <option value="저녁">저녁</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">등록할 레시피 선택</label>
                <select className="form-select" value={selectedRecipeId} onChange={e => setSelectedRecipeId(e.target.value)}>
                  {recipes.map(r => (
                    <option key={r.id} value={r.id}>[{r.category}] {r.title} ({r.cookingTime}분)</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>취소</button>
                <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '12px 24px' }}>식단에 등록</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
