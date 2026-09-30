import React, { useState, useEffect } from 'react';
import CategoryNav from '../components/CategoryNav';
import ProductCard from '../components/ProductCard';
import FilterPanel from '../components/FilterPanel';
import { api } from '../api/client';

export default function Products({ onSelectProduct, selectedCategory, setSelectedCategory, searchQuery, likedProductIds = [] }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedLocation, setSelectedLocation] = useState('전체');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [condition, setCondition] = useState('전체');
  const [tradeMethod, setTradeMethod] = useState('전체');
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  useEffect(() => {
    async function loadCats() {
      try {
        const res = await api.getCategories();
        if (res && res.categories) {
          setCategories(res.categories);
        }
      } catch (e) {}
    }
    loadCats();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        category: selectedCategory !== '전체' ? selectedCategory : undefined,
        search: searchQuery || undefined,
        location: selectedLocation !== '전체' ? selectedLocation : undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        condition: condition !== '전체' ? condition : undefined,
        tradeMethod: tradeMethod !== '전체' ? tradeMethod : undefined
      };
      const res = await api.getProducts(params);
      if (res && res.products) {
        setProducts(res.products);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery, selectedLocation, minPrice, maxPrice, condition, tradeMethod]);

  const handleResetFilters = () => {
    setSelectedCategory('전체');
    setSelectedLocation('전체');
    setMinPrice('');
    setMaxPrice('');
    setCondition('전체');
    setTradeMethod('전체');
  };

  return (
    <div>
      {/* Category Nav Carousel */}
      <CategoryNav
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '24px 0 20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-main)' }}>
            {selectedCategory === '전체' ? '동네 전체 상품 목록' : selectedCategory}
          </h1>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            총 <strong style={{ color: 'var(--primary)' }}>{products.length}</strong>개의 상품이 안전하게 등록되어 있습니다.
          </div>
        </div>

        <button
          className="btn-solid-secondary"
          style={{ padding: '9px 18px', fontSize: '0.88rem' }}
          onClick={() => setShowFilterPanel(!showFilterPanel)}
        >
          ⚙️ {showFilterPanel ? '상세 필터 닫기' : '상세 조건 필터'}
        </button>
      </div>

      {showFilterPanel && (
        <FilterPanel
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          condition={condition}
          setCondition={setCondition}
          tradeMethod={tradeMethod}
          setTradeMethod={setTradeMethod}
          onReset={handleResetFilters}
        />
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
          상품 목록을 불러오는 중입니다...
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔍</div>
          <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>조건에 일치하는 상품이 없습니다.</div>
          <div style={{ fontSize: '0.88rem' }}>검색어나 필터 조건을 변경하여 다시 시도해보세요.</div>
        </div>
      ) : (
        <div className="products-grid">
          {products.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              onSelectProduct={onSelectProduct}
              isLiked={likedProductIds.includes(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
