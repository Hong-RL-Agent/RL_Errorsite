import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { api } from '../api/client';

export default function MyListings({ onSelectProduct, setActivePage }) {
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await api.getMyProducts();
        if (res && res.products) {
          setMyProducts(res.products);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--gray-900)' }}>
            내 판매 상품 관리
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)' }}>
            등록한 상품의 상태를 변경하거나 관리할 수 있습니다.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setActivePage('sell')}>
          + 판매글 등록
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--gray-500)' }}>
          판매 목록을 불러오는 중...
        </div>
      ) : myProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: 'var(--radius-md)', color: 'var(--gray-500)' }}>
          등록된 판매 상품이 없습니다.
        </div>
      ) : (
        <div className="product-grid">
          {myProducts.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
}
