import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Heart, Eye, Calendar, Plus, Edit, Trash2, User, CheckCircle2, Bookmark } from 'lucide-react';
import { api } from '../api/client';

export default function RecipeDetail({ id, user, navigate }) {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);

  // Meal plan modal state
  const [mealDay, setMealDay] = useState('월');
  const [mealSlot, setMealSlot] = useState('저녁');
  const [addedMealSuccess, setAddedMealSuccess] = useState(false);

  useEffect(() => {
    loadRecipeAndFav();
  }, [id]);

  const loadRecipeAndFav = async () => {
    setLoading(true);
    try {
      const data = await api.getRecipe(id);
      setRecipe(data);

      const favs = await api.getFavorites();
      setIsFavorite(favs.some(f => f.id === parseInt(id, 10)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      if (isFavorite) {
        await api.removeFavorite(id);
        setIsFavorite(false);
        setRecipe(prev => ({ ...prev, likes: Math.max(0, prev.likes - 1) }));
      } else {
        await api.addFavorite(id);
        setIsFavorite(true);
        setRecipe(prev => ({ ...prev, likes: prev.likes + 1 }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddToMealPlan = async (e) => {
    e.preventDefault();
    try {
      await api.addMealPlan({
        day: mealDay,
        slot: mealSlot,
        recipeId: recipe.id
      });
      setAddedMealSuccess(true);
      setTimeout(() => {
        setAddedMealSuccess(false);
        setShowMealModal(false);
      }, 1200);
    } catch (err) {
      alert(err.message || '식단 추가에 실패했습니다.');
    }
  };

  const handleDeleteRecipe = async () => {
    if (!window.confirm('정말 이 레시피를 삭제하시겠습니까? (식단에 등록되어 있을 경우 주의)')) return;
    try {
      // INTENTIONAL BACKEND BUG: site050-SEC-429
      // Deleting recipe does NOT remove it from mealPlans, creating dangling reference
      await api.deleteRecipe(id);
      navigate('/recipes');
    } catch (err) {
      alert(err.message || '삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-light)' }}>
        레시피를 불러오는 중입니다...
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '100px 0' }}>
        <h2>레시피를 찾을 수 없습니다.</h2>
        <button className="btn-primary" style={{ marginTop: '16px' }} onClick={() => navigate('/recipes')}>
          레시피 목록으로
        </button>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      {/* Back Button */}
      <button 
        style={{ display: 'flex', alignItems: 'center', gap: '6px', border: 'none', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', marginBottom: '20px' }}
        onClick={() => navigate('/recipes')}
      >
        <ArrowLeft size={18} />
        <span>목록으로 돌아가기</span>
      </button>

      <div className="detail-container">
        {/* Main Info */}
        <div className="detail-main">
          <img src={recipe.image} alt={recipe.title} className="detail-banner-img" />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span className={`card-category-badge ${recipe.category}`} style={{ position: 'static' }}>
              {recipe.category}
            </span>
            <span style={{ 
              fontSize: '0.8rem', 
              fontWeight: '700', 
              padding: '4px 10px', 
              borderRadius: 'var(--radius-full)', 
              background: 'var(--warm-beige)', 
              color: 'var(--text-muted)' 
            }}>
              난이도: {recipe.difficulty}
            </span>
          </div>

          <h1 className="detail-title">{recipe.title}</h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '28px' }}>
            {recipe.description}
          </p>

          {/* Author info row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'var(--warm-beige)', borderRadius: 'var(--radius-md)', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <User size={18} color="var(--primary)" />
              <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>작성자: {recipe.authorName}</span>
              <span style={{ color: 'var(--text-light)', fontSize: '0.82rem' }}>• {recipe.createdAt}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Heart size={14} color="#ea580c" /> {recipe.likes}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={14} /> {recipe.views}</span>
            </div>
          </div>

          {/* Ingredients List */}
          <div className="ingredients-box">
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text-main)' }}>
              🥣 재료 준비
            </h3>
            <div>
              {recipe.ingredients && recipe.ingredients.map((ing, idx) => (
                <div key={idx} className="ingredient-item">
                  <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{ing}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cooking Steps */}
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '20px', color: 'var(--text-main)' }}>
              👩‍🍳 조리 순서
            </h3>
            {recipe.steps && recipe.steps.map((step, idx) => (
              <div key={idx} className="step-card">
                <div className="step-number">{idx + 1}</div>
                <div className="step-content">{step}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Actions */}
        <div style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
          <div style={{ background: 'var(--cream-card)', borderRadius: 'var(--radius-xl)', padding: '28px', border: '1px solid var(--beige-border)', boxShadow: 'var(--shadow-md)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '20px', color: 'var(--text-main)' }}>
              레시피 요약 정보
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>조리 시간</span>
                <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{recipe.cookingTime}분</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>난이도</span>
                <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{recipe.difficulty}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>카테고리</span>
                <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{recipe.category}</span>
              </div>
            </div>

            {/* Actions Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                className="btn-primary"
                onClick={() => setShowMealModal(true)}
              >
                <Calendar size={18} />
                <span>식단에 추가하기</span>
              </button>

              <button 
                className="btn-secondary"
                onClick={handleToggleFavorite}
                style={{
                  color: isFavorite ? '#ea580c' : 'var(--text-main)',
                  borderColor: isFavorite ? '#fed7aa' : 'var(--beige-border)',
                  background: isFavorite ? '#fff7ed' : 'var(--warm-beige)'
                }}
              >
                <Bookmark size={18} fill={isFavorite ? '#ea580c' : 'none'} />
                <span>{isFavorite ? '즐겨찾기 완료' : '즐겨찾기 저장'}</span>
              </button>

              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button 
                  className="btn-secondary"
                  style={{ flex: 1, padding: '10px', fontSize: '0.88rem' }}
                  onClick={() => navigate(`/recipes/edit/${recipe.id}`)}
                >
                  <Edit size={15} />
                  <span>수정</span>
                </button>
                <button 
                  className="btn-danger-outline delete-recipe-btn"
                  style={{ flex: 1, padding: '10px', fontSize: '0.88rem', justifyContent: 'center' }}
                  onClick={handleDeleteRecipe}
                >
                  <Trash2 size={15} />
                  <span>삭제</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add to Meal Plan Modal */}
      {showMealModal && (
        <div className="modal-overlay" onClick={() => setShowMealModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-title">주간 식단에 추가</h3>
              <button className="icon-button" onClick={() => setShowMealModal(false)}>✕</button>
            </div>

            {addedMealSuccess ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <CheckCircle2 size={40} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: '700' }}>식단에 추가되었습니다!</h4>
              </div>
            ) : (
              <form onSubmit={handleAddToMealPlan}>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
                  <strong>[{recipe.title}]</strong> 메뉴를 어느 요일과 식사에 배치할까요?
                </p>

                <div className="form-group">
                  <label className="form-label">요일 선택</label>
                  <select className="form-select" value={mealDay} onChange={e => setMealDay(e.target.value)}>
                    {['월', '화', '수', '목', '금', '토', '일'].map(d => (
                      <option key={d} value={d}>{d}요일</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">식사 시간 선택</label>
                  <select className="form-select" value={mealSlot} onChange={e => setMealSlot(e.target.value)}>
                    <option value="아침">아침</option>
                    <option value="점심">점심</option>
                    <option value="저녁">저녁</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                  <button type="button" className="btn-secondary" onClick={() => setShowMealModal(false)}>취소</button>
                  <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '12px 24px' }}>추가하기</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
