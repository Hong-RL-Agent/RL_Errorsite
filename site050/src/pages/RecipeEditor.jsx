import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import IngredientEditor from '../components/IngredientEditor';
import AutosaveStatus from '../components/AutosaveStatus';
import { api } from '../api/client';

export default function RecipeEditor({ editId, user, navigate }) {
  const isEditing = Boolean(editId);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('한식');
  const [difficulty, setDifficulty] = useState('쉬움');
  const [cookingTime, setCookingTime] = useState(20);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80');
  const [ingredients, setIngredients] = useState(['']);
  const [steps, setSteps] = useState(['']);

  const [autosaveState, setAutosaveState] = useState('idle'); // 'idle', 'saving', 'saved'
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    if (isEditing) {
      api.getRecipe(editId).then(data => {
        if (data) {
          setTitle(data.title || '');
          setCategory(data.category || '한식');
          setDifficulty(data.difficulty || '쉬움');
          setCookingTime(data.cookingTime || 20);
          setDescription(data.description || '');
          setImage(data.image || '');
          setIngredients(data.ingredients?.length ? data.ingredients : ['']);
          setSteps(data.steps?.length ? data.steps : ['']);
        }
      }).catch(console.error);
    }
  }, [editId]);

  // Debounced Autosave for SEC-428
  const triggerAutosave = (updatedTitle) => {
    if (!isEditing) return;

    setAutosaveState('saving');
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // INTENTIONAL BACKEND BUG: site050-SEC-428
    // Rapid edits can cancel save or drop final modified chunks
    debounceTimerRef.current = setTimeout(async () => {
      try {
        await api.updateRecipe(editId, {
          title: updatedTitle,
          category,
          difficulty,
          cookingTime,
          description,
          image,
          ingredients,
          steps
        }, true);
        setAutosaveState('saved');
      } catch (err) {
        setAutosaveState('idle');
      }
    }, 800);
  };

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    triggerAutosave(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // INTENTIONAL BACKEND BUG: site050-SEC-426
    // Frontend form allows submitting even if empty or partially filled,
    // and backend does NOT reject empty fields, creating an empty/incomplete recipe
    try {
      if (isEditing) {
        await api.updateRecipe(editId, {
          title,
          category,
          difficulty,
          cookingTime: parseInt(cookingTime, 10),
          description,
          image,
          ingredients: ingredients.filter(i => i.trim() !== ''),
          steps: steps.filter(s => s.trim() !== '')
        });
        alert('레시피가 수정되었습니다!');
        navigate(`/recipes/${editId}`);
      } else {
        const res = await api.createRecipe({
          title,
          category,
          difficulty,
          cookingTime: parseInt(cookingTime, 10),
          description,
          image,
          ingredients: ingredients.filter(i => i.trim() !== ''),
          steps: steps.filter(s => s.trim() !== '')
        });
        if (res.recipe) {
          navigate(`/recipes/${res.recipe.id}`);
        }
      }
    } catch (err) {
      alert(err.message || '저장에 실패했습니다.');
    }
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '800px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <button 
          style={{ display: 'flex', alignItems: 'center', gap: '6px', border: 'none', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer' }}
          onClick={() => navigate(isEditing ? `/recipes/${editId}` : '/recipes')}
        >
          <ArrowLeft size={18} />
          <span>뒤로가기</span>
        </button>

        {isEditing && <AutosaveStatus status={autosaveState} />}
      </div>

      <div style={{ background: 'var(--cream-card)', borderRadius: 'var(--radius-xl)', padding: '36px', border: '1px solid var(--beige-border)', boxShadow: 'var(--shadow-sm)' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
          {isEditing ? '레시피 수정하기' : '새 레시피 작성'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '28px' }}>
          나만의 조리 순서와 필요한 재료를 꼼꼼하게 정리해보세요.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label">레시피 제목</label>
            <input 
              type="text" 
              className="form-input recipe-title-input"
              placeholder="예: 토마토 바질 파스타"
              value={title}
              onChange={handleTitleChange}
            />
          </div>

          {/* Category & Difficulty & Cooking Time */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label className="form-label">카테고리</label>
              <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="한식">한식</option>
                <option value="양식">양식</option>
                <option value="일식">일식</option>
                <option value="베이킹">베이킹</option>
                <option value="샐러드">샐러드</option>
                <option value="간단요리">간단요리</option>
              </select>
            </div>

            <div>
              <label className="form-label">난이도</label>
              <select className="form-select" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                <option value="쉬움">쉬움</option>
                <option value="보통">보통</option>
                <option value="어려움">어려움</option>
              </select>
            </div>

            <div>
              <label className="form-label">조리 시간 (분)</label>
              <input 
                type="number" 
                className="form-input" 
                min="1" 
                value={cookingTime} 
                onChange={e => setCookingTime(e.target.value)} 
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">한 줄 소개</label>
            <textarea 
              className="form-textarea" 
              rows={2}
              placeholder="요리의 특징이나 맛있는 포인트를 짧게 소개해주세요"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Image URL */}
          <div className="form-group">
            <label className="form-label">대표 이미지 URL</label>
            <input 
              type="url" 
              className="form-input" 
              placeholder="https://images.unsplash.com/..." 
              value={image}
              onChange={e => setImage(e.target.value)}
            />
          </div>

          {/* Dynamic Ingredients & Steps */}
          <IngredientEditor 
            ingredients={ingredients} 
            setIngredients={setIngredients}
            steps={steps}
            setSteps={setSteps}
          />

          {/* Submit Action */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '36px', borderTop: '1px solid var(--border-light)', paddingTop: '24px' }}>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => navigate(isEditing ? `/recipes/${editId}` : '/recipes')}
            >
              취소
            </button>
            <button 
              type="submit" 
              className="btn-primary submit-recipe-btn"
              style={{ width: 'auto', padding: '12px 28px' }}
            >
              <Save size={18} />
              <span>{isEditing ? '수정 완료' : '레시피 등록'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
