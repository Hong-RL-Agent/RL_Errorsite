import React, { useState, useEffect } from 'react';
import { Filter, SlidersHorizontal, CheckCircle, Tag, Search, ArrowUpDown, Plus } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import Modal from '../components/Modal';

export default function Products({ onSelectProduct, onAddToCart, onShowToast }) {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('popular');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productNameInput, setProductNameInput] = useState('');
  const [validationResult, setValidationResult] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  // SEC-370: Product Filter Parameters
  const handleApplyFilter = async (e) => {
    if (e) e.preventDefault();
    try {
      const res = await fetch('/api/products/filter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          sort
        })
      });
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
        onShowToast({
          title: '상품 필터 적용 완료',
          message: `필터 조건 [카테고리: ${category}, 정렬: ${sort}]에 맞는 상품 ${data.total}개를 조회했습니다.`,
          type: 'success',
          bugId: data.bugId,
          secId: data.secId,
          reqId: data.request_id
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // SEC-364: Product Name Field Validation
  const handleValidateName = async () => {
    if (!productNameInput.trim()) return;
    try {
      const res = await fetch('/api/products/name/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: productNameInput.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setValidationResult(data);
        onShowToast({
          title: '상품명 검증 완료',
          message: data.message,
          type: 'success',
          bugId: data.bugId,
          secId: data.secId,
          reqId: data.request_id
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">라이프스타일 상품 컬렉션</h1>
          <p className="page-subtitle">엄선된 패션, 리빙, 뷰티, 여행 소품을 한곳에서 만나보세요.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> 신규 상품명 검증 & 제안
        </button>
      </div>

      {/* Filter Card (SEC-370) */}
      <div className="card" style={{ padding: '18px 20px' }}>
        <form onSubmit={handleApplyFilter} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr)) 140px', gap: '14px', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">카테고리</label>
            <select
              className="form-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">전체 카테고리</option>
              <option value="home">홈 & 리빙</option>
              <option value="fashion">패션 & 웨어</option>
              <option value="beauty">뷰티 & 바디케어</option>
              <option value="stationery">문구 & 데스크</option>
              <option value="travel">여행 & 아웃도어</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">정렬 기준</label>
            <select
              className="form-input"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="popular">인기순 (베스트)</option>
              <option value="price-low">가격 낮은순</option>
              <option value="price-high">가격 높은순</option>
              <option value="rating">평점 높은순</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">최소 가격 (₩)</label>
            <input
              type="number"
              className="form-input"
              placeholder="예: 20000"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">최대 가격 (₩)</label>
            <input
              type="number"
              className="form-input"
              placeholder="예: 80000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ height: '41px', justifyContent: 'center' }}
          >
            <Filter size={15} /> 필터 적용
          </button>
        </form>
      </div>

      {/* Product List Grid */}
      <div className="grid-layout grid-4">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onSelect={onSelectProduct}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>

      {/* SEC-364: Product Name Check Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="신규 라이프스타일 상품명 사전 검증"
      >
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
          새로 입점하거나 출시할 상품명의 중복 여부 및 네이밍 가이드를 실시간으로 검증합니다.
        </p>
        <div className="form-group">
          <label className="form-label">등록 희망 상품명 *</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="예: 오가닉 린넨 베개커버 2set"
              value={productNameInput}
              onChange={(e) => setProductNameInput(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-primary"
              style={{ whiteSpace: 'nowrap' }}
              onClick={handleValidateName}
            >
              검증하기
            </button>
          </div>
        </div>

        {validationResult && (
          <div style={{
            padding: '12px 14px',
            borderRadius: '8px',
            background: validationResult.valid ? '#ecfdf5' : '#fff1f2',
            border: `1px solid ${validationResult.valid ? '#a7f3d0' : '#fecdd3'}`,
            fontSize: '13px',
            color: validationResult.valid ? '#065f46' : '#9f1239',
            marginTop: '12px'
          }}>
            <strong>{validationResult.valid ? '✓ 사용 가능' : '⚠ 중복 또는 검증 실패'}</strong>: {validationResult.message}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
            닫기
          </button>
        </div>
      </Modal>
    </div>
  );
}
