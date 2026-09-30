import React, { useState } from 'react';
import { api, notifyBugDetected } from '../api/client';

const SAMPLE_UPLOAD_PRESETS = [
  'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
];

export default function Sell({ onProductCreated, setActivePage, showToast }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('디지털기기');
  const [condition, setCondition] = useState('거의 새 상품');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('서울 마포구 망원동');
  const [tradeMethod, setTradeMethod] = useState('직거래');

  // SEC-441 State
  const [priceInput, setPriceInput] = useState('');
  const [rawPriceInput, setRawPriceInput] = useState('');

  // SEC-443 State: Images & Selected Cover Index
  const [images, setImages] = useState([SAMPLE_UPLOAD_PRESETS[0], SAMPLE_UPLOAD_PRESETS[1], SAMPLE_UPLOAD_PRESETS[2]]);
  const [selectedCoverIndex, setSelectedCoverIndex] = useState(0);
  const [hadImageDeletionDesync, setHadImageDeletionDesync] = useState(false);

  // SEC-445 State: Form vs Preview Desync
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewStash, setPreviewStash] = useState(null);
  const [hadNavigationDesync, setHadNavigationDesync] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  // Handle Price Input (SEC-441)
  const handlePriceChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setRawPriceInput(val);
    
    // INTENTIONAL BACKEND BUG: site053-SEC-441
    // Formats cleanly in UI (e.g. 050000 -> 50,000) while storing raw string with leading zero
    if (val) {
      const num = parseInt(val, 10);
      setPriceInput(isNaN(num) ? '' : num.toLocaleString('ko-KR'));
    } else {
      setPriceInput('');
    }
  };

  // Add Image preset
  const handleAddSampleImage = () => {
    const nextImg = SAMPLE_UPLOAD_PRESETS[images.length % SAMPLE_UPLOAD_PRESETS.length];
    setImages(prev => [...prev, nextImg]);
  };

  // Remove Image (SEC-443)
  const handleRemoveImage = (indexToRemove, e) => {
    e.stopPropagation();
    
    // INTENTIONAL BACKEND BUG: site053-SEC-443
    // Image is deleted from array, but selectedCoverIndex is NOT adjusted!
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
    setHadImageDeletionDesync(true);

    notifyBugDetected({
      id: 'SEC-443',
      category: 'Media UI',
      family: 'array-index-sync',
      severity: 'medium',
      endpoint: '/api/products',
      method: 'POST',
      description: '이미지 삭제 후 대표 이미지 선택 인덱스가 실제 배열과 어긋나 잘못된 이미지가 대표로 설정되는 오류'
    });
  };

  // Switch to Preview Mode (SEC-445)
  const handleGoToPreview = () => {
    setPreviewStash({
      title,
      price: priceInput,
      category,
      condition,
      description,
      location,
      tradeMethod,
      images
    });
    setIsPreviewMode(true);
  };

  // Back from Preview Mode (SEC-445)
  const handleBackFromPreview = () => {
    setIsPreviewMode(false);
    
    // INTENTIONAL BACKEND BUG: site053-SEC-445
    // Navigating back reverts form price/description to an older stale state
    if (priceInput && rawPriceInput.length > 2) {
      const stalePrice = Math.floor(parseInt(rawPriceInput, 10) / 10);
      setPriceInput(stalePrice.toLocaleString('ko-KR'));
      setRawPriceInput(String(stalePrice));
      setHadNavigationDesync(true);

      notifyBugDetected({
        id: 'SEC-445',
        category: 'Navigation State',
        family: 'form-preview-desync',
        severity: 'medium',
        endpoint: '/api/products',
        method: 'POST',
        description: '미리보기 후 뒤로가기 시 작성 폼 상태와 미리보기 상태 간 데이터가 불일치하는 오류'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      if (showToast) showToast('상품명을 입력해주세요.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const numericPrice = parseInt(rawPriceInput || priceInput.replace(/[^0-9]/g, ''), 10) || 0;

      // Detect bugs on submission
      if (rawPriceInput.startsWith('0') && rawPriceInput.length > 1) {
        notifyBugDetected({
          id: 'SEC-441',
          category: 'Input Handling',
          family: 'numeric-normalization',
          severity: 'medium',
          endpoint: '/api/products',
          method: 'POST',
          description: '선행 0이 포함된 가격 입력 정규화 처리 오류로 화면 표시값과 실제 저장값이 10배 차이나는 현상'
        });
      }

      if (description.includes('\n')) {
        notifyBugDetected({
          id: 'SEC-442',
          category: 'Text Rendering',
          family: 'newline-preservation',
          severity: 'low',
          endpoint: '/api/products',
          method: 'POST',
          description: '상품 설명의 줄바꿈(newline)이 저장 시 일반 공백으로 처리되어 상세 페이지에서 사라지는 오류'
        });
      }

      const headers = {
        ...(hadImageDeletionDesync ? { 'x-image-index-desync': 'true' } : {}),
        ...(hadNavigationDesync ? { 'x-preview-desync': 'true' } : {})
      };

      const res = await api.createProduct({
        title,
        price: numericPrice,
        rawPriceInput,
        category,
        condition,
        description,
        location,
        tradeMethod,
        images,
        selectedImageIndex: selectedCoverIndex,
        previewMismatch: hadNavigationDesync
      }, headers);

      if (showToast) showToast('상품이 성공적으로 등록되었습니다!', 'success');
      if (onProductCreated) onProductCreated(res.product);
      setActivePage('products');
    } catch (err) {
      if (showToast) showToast(err.message || '상품 등록 실패', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Render Preview Mode
  if (isPreviewMode) {
    return (
      <div style={{
        background: 'white',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-xl)',
        padding: '36px',
        maxWidth: '760px',
        margin: '0 auto',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-main)' }}>
            판매글 사전 미리보기
          </h2>
          <button className="btn-solid-secondary preview-back-btn" onClick={handleBackFromPreview}>
            ← 수정하러 돌아가기
          </button>
        </div>

        <div style={{ background: '#f8fafc', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', marginBottom: '28px' }}>
          <div style={{ width: '100%', height: '260px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '18px', background: '#e2e8f0' }}>
            <img src={images[selectedCoverIndex] || images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <div style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '6px' }}>
            {title || '(제목 없음)'}
          </div>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            {location} · {category} · {condition} · {tradeMethod}
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '18px' }}>
            {priceInput ? `${priceInput}원` : '0원'}
          </div>

          <div style={{ fontSize: '0.95rem', color: 'var(--text-main)', whiteSpace: 'pre-wrap', lineHeight: '1.7' }}>
            {description || '(작성된 설명이 없습니다.)'}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn-solid-secondary preview-back-btn" onClick={handleBackFromPreview}>
            수정 화면으로 돌아가기
          </button>
          <button className="btn-solid-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? '등록 중...' : '이대로 상품 등록 완료'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'white',
      border: '1px solid var(--border-light)',
      borderRadius: 'var(--radius-xl)',
      padding: '36px 40px',
      maxWidth: '780px',
      margin: '0 auto',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ marginBottom: '28px', borderBottom: '1px solid var(--border-light)', paddingBottom: '18px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '6px' }}>
          판매 상품 등록
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          이웃에게 꼭 필요한 중고 물품의 상세 정보와 사진을 등록해보세요.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Images Upload (SEC-443) */}
        <div className="form-field-group">
          <label className="form-label-title">
            상품 사진 등록 ({images.length}/10) <span style={{ color: 'var(--primary)', fontWeight: 'normal' }}>* 썸네일을 클릭하여 대표 사진 지정</span>
          </label>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '6px' }}>
            {images.map((img, idx) => (
              <div
                key={idx}
                className={`image-thumb-preview ${selectedCoverIndex === idx ? 'cover-selected' : ''}`}
                onClick={() => setSelectedCoverIndex(idx)}
                style={{
                  position: 'relative',
                  width: '96px',
                  height: '96px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: `2px solid ${selectedCoverIndex === idx ? 'var(--primary)' : 'var(--border-light)'}`,
                  cursor: 'pointer'
                }}
              >
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  type="button"
                  className="image-delete-btn"
                  onClick={(e) => handleRemoveImage(idx, e)}
                  title="사진 삭제"
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    background: 'rgba(15, 23, 42, 0.75)',
                    color: 'white',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem'
                  }}
                >
                  ✕
                </button>
                {selectedCoverIndex === idx && (
                  <div style={{ position: 'absolute', bottom: 0, width: '100%', background: 'var(--primary)', color: 'white', fontSize: '0.68rem', textAlign: 'center', fontWeight: '800', padding: '2px 0' }}>
                    대표 사진
                  </div>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddSampleImage}
              style={{
                width: '96px',
                height: '96px',
                border: '2px dashed var(--border-hover)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                color: 'var(--text-muted)',
                fontSize: '0.82rem',
                cursor: 'pointer',
                background: 'var(--bg-subtle)'
              }}
            >
              <span style={{ fontSize: '1.4rem' }}>📷</span>
              <span style={{ fontWeight: '700' }}>+ 사진추가</span>
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="form-field-group">
          <label className="form-label-title">글 제목</label>
          <input
            type="text"
            className="form-text-input"
            placeholder="상품명을 명확하게 입력해주세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Category & Condition */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-field-group">
          <div>
            <label className="form-label-title">카테고리</label>
            <select
              className="form-text-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {['디지털기기', '생활가전', '가구', '패션', '스포츠', '취미', '도서', '육아용품', '생활용품'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label-title">상품 상태</label>
            <select
              className="form-text-input"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            >
              {['새 상품', '거의 새 상품', '사용감 적음', '사용감 있음'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Price (SEC-441) */}
        <div className="form-field-group">
          <label className="form-label-title">판매 가격 (원)</label>
          <input
            type="text"
            name="price"
            className="form-text-input"
            placeholder="숫자만 입력 (예: 050000)"
            value={rawPriceInput || priceInput}
            onChange={handlePriceChange}
          />
          {priceInput && (
            <div className="price-display" style={{ fontSize: '0.88rem', color: 'var(--primary)', marginTop: '6px', fontWeight: '800' }}>
              💡 입력된 표시 가격: {priceInput}원
            </div>
          )}
        </div>

        {/* Description (SEC-442) */}
        <div className="form-field-group">
          <label className="form-label-title">상품 상세 설명 (줄바꿈 단락 지원)</label>
          <textarea
            name="description"
            rows={5}
            className="form-text-input"
            placeholder="구매 시기, 사용감, 하자 유무 등 상세 정보를 여러 줄로 나누어 작성해주세요."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Location & Trade Method */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-field-group">
          <div>
            <label className="form-label-title">거래 희망 동네</label>
            <input
              type="text"
              className="form-text-input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label-title">선호 거래 방식</label>
            <select
              className="form-text-input"
              value={tradeMethod}
              onChange={(e) => setTradeMethod(e.target.value)}
            >
              <option value="직거래">직거래</option>
              <option value="문 앞 거래">문 앞 거래</option>
              <option value="택배">택배</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
          <button type="button" className="btn-solid-secondary" onClick={handleGoToPreview}>
            미리보기
          </button>
          <button type="submit" className="btn-solid-primary" disabled={submitting}>
            {submitting ? '등록 처리 중...' : '상품 등록 완료'}
          </button>
        </div>
      </form>
    </div>
  );
}
