import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Search, 
  MapPin, 
  ArrowRight, 
  Users, 
  Calendar, 
  Flame, 
  Award,
  BookOpen,
  CheckCircle2
} from 'lucide-react';
import ClassCard from '../components/ClassCard';
import { fetchApi } from '../api/client';

export default function Home({ onSelectClass, onNavigateSearch }) {
  const [popularClasses, setPopularClasses] = useState([]);
  const [newClasses, setNewClasses] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchApi('/api/classes')
      .then(data => {
        setPopularClasses(data.slice(0, 4));
        setNewClasses(data.slice(4, 8));
      })
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onNavigateSearch) {
      onNavigateSearch({ keyword, category: selectedCategory });
    }
  };

  const categories = [
    { id: '도예', label: '도예 공방', icon: '🏺', desc: '손으로 빚는 힐링 머그' },
    { id: '베이킹', label: '디저트 베이킹', icon: '🥐', desc: '구움과자 & 마들렌' },
    { id: '드로잉', label: '취미 미술', icon: '🎨', desc: '유화 & 아크릴 페인팅' },
    { id: '사진', label: '필름 출사', icon: '📷', desc: '골목 감성 사진 워크숍' },
    { id: '공예', label: '가죽 & 목공', icon: '🪵', desc: '핸드메이드 소품 제작' },
    { id: '운동', label: '요가 & 명상', icon: '🧘‍♀️', desc: '주말 아침 힐링 빈야사' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
      {/* Hero Banner Section */}
      <section style={{
        position: 'relative',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #2563eb 100%)',
        color: '#ffffff',
        padding: '60px 40px',
        boxShadow: 'var(--shadow-xl)'
      }}>
        <div style={{ maxWidth: 620 }}>
          <span className="badge badge-beige" style={{ marginBottom: 16 }}>
            <Sparkles size={12} /> 커뮤니티 기반 원데이 클래스 & 워크숍
          </span>
          <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.3, letterSpacing: '-0.5px', marginBottom: 16 }}>
            나에게 딱 맞는 새로운 취미와<br />
            <span style={{ color: '#60a5fa' }}>영감을 주는 워크숍</span>을 찾아보세요
          </h1>
          <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 32 }}>
            도예, 가죽공예, 베이킹부터 감성 필름 출사까지 로컬 전문 강사와 함께하는 다채로운 배움의 순간
          </p>

          {/* Search Box */}
          <form 
            onSubmit={handleSearch}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ flex: 1, minWidth: 180, display: 'flex', alignItems: 'center', padding: '6px 12px', gap: 8 }}>
              <Search size={18} color="var(--soft-blue)" />
              <input
                id="hero-input-class-keyword"
                type="text"
                placeholder="어떤 취미를 배우고 싶으신가요?"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                style={{ width: '100%', border: 'none', fontSize: 14, color: 'var(--text-main)', background: 'none' }}
              />
            </div>

            <div style={{ width: 1, height: 28, backgroundColor: 'var(--border-color)' }} />

            <div style={{ minWidth: 120, display: 'flex', alignItems: 'center', padding: '6px 12px' }}>
              <select
                id="hero-select-category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ border: 'none', fontSize: 14, color: 'var(--text-main)', background: 'none', cursor: 'pointer', width: '100%' }}
              >
                <option value="all">전체 카테고리</option>
                <option value="도예">도예</option>
                <option value="베이킹">베이킹</option>
                <option value="드로잉">드로잉</option>
                <option value="사진">사진</option>
                <option value="공예">공예</option>
                <option value="운동">운동</option>
              </select>
            </div>

            <button
              id="hero-btn-submit"
              type="submit"
              className="btn btn-primary"
              style={{ borderRadius: 'var(--radius-md)', padding: '12px 24px' }}
            >
              <span>클래스 찾기</span>
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </section>

      {/* Category Grid */}
      <section>
        <div className="section-header">
          <div>
            <h2 className="section-title">인기 취미 카테고리</h2>
            <p className="section-subtitle">배우고 싶은 테마를 선택하고 진행 중인 워크숍을 확인하세요</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          {categories.map((cat) => (
            <div
              key={cat.id}
              id={`cat-card-${cat.id}`}
              onClick={() => onNavigateSearch && onNavigateSearch({ category: cat.id })}
              className="card"
              style={{
                padding: '20px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                border: '1px solid var(--border-color)',
                textAlign: 'left'
              }}
            >
              <div style={{ fontSize: 28 }}>{cat.icon}</div>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary-navy)' }}>{cat.label}</h4>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cat.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Classes */}
      <section>
        <div className="section-header">
          <div>
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Flame size={22} color="#ef4444" /> 이번 주 인기 마감임박 클래스
            </h2>
            <p className="section-subtitle">수강생 만족도가 높고 정원이 빠르게 차고 있는 추천 워크숍</p>
          </div>
          <button 
            onClick={() => onNavigateSearch && onNavigateSearch({})}
            className="btn btn-outline btn-sm"
          >
            <span>전체 보기</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid-cards">
          {popularClasses.map(cls => (
            <ClassCard
              key={cls.id}
              cls={cls}
              onSelect={onSelectClass}
            />
          ))}
        </div>
      </section>

      {/* New Classes */}
      <section>
        <div className="section-header">
          <div>
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award size={22} color="var(--soft-blue)" /> 새로 오픈한 신규 워크숍
            </h2>
            <p className="section-subtitle">실력 있는 전문 강사님들이 새롭게 개설한 원데이 클래스</p>
          </div>
          <button 
            onClick={() => onNavigateSearch && onNavigateSearch({})}
            className="btn btn-outline btn-sm"
          >
            <span>더 알아보기</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid-cards">
          {newClasses.map(cls => (
            <ClassCard
              key={cls.id}
              cls={cls}
              onSelect={onSelectClass}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
