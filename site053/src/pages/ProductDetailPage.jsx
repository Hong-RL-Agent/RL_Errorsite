import React, { useState, useEffect } from 'react';
import ProductDetail from '../components/ProductDetail';
import { api } from '../api/client';

export default function ProductDetailPage({ productId, onBack, onStartChat, likedProductIds = [], onToggleLike, showToast }) {
  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!productId) return;
      setLoading(true);
      try {
        const res = await api.getProductById(productId);
        if (res && res.product) {
          setProduct(res.product);
          setSeller(res.seller);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [productId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--gray-500)' }}>
        상품 정보를 불러오는 중...
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <h2>상품을 찾을 수 없습니다.</h2>
        <button className="btn-primary" style={{ marginTop: '16px' }} onClick={onBack}>
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <ProductDetail
      product={product}
      seller={seller}
      onBack={onBack}
      onStartChat={onStartChat}
      isLiked={likedProductIds.includes(product.id)}
      onToggleLike={onToggleLike}
      showToast={showToast}
    />
  );
}
