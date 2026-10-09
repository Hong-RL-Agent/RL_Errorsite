import React, { useState } from 'react';
import { ShoppingBag, Plus, Minus, Check } from 'lucide-react';

export default function ProductCatalog({
  products,
  onAddToCart,
  onNavigateToCheckout
}) {
  const [quantities, setQuantities] = useState({});

  const getQuantity = (id) => quantities[id] || 1;

  const handleQtyChange = (id, delta) => {
    setQuantities((prev) => {
      const current = prev[id] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const handleAdd = (product) => {
    const qty = getQuantity(product.id);
    onAddToCart(product.id, qty);
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">Curated Collection</h2>
          <p className="section-desc">Morrow Market의 엄선된 에디토리얼 프리미엄 라인업</p>
        </div>
      </div>

      <div className="products-grid">
        {products.map((product) => (
          <div
            key={product.id}
            className="product-card"
            data-product-id={product.id}
          >
            <div className="product-image-wrap">
              <img
                src={product.image_url}
                alt={product.name}
                className="product-image"
                loading="lazy"
              />
              <span className="stock-tag">
                재고 {product.stock}개
              </span>
            </div>

            <div className="product-info">
              <div className="product-category">{product.category}</div>
              <h3 className="product-name">{product.name}</h3>
              <p className="product-description">{product.description}</p>

              <div className="product-footer">
                <div className="product-price" data-role="price">
                  {product.price.toLocaleString()}원
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {/* Quantity Stepper */}
                  <div className="quantity-stepper">
                    <button
                      className="stepper-btn"
                      onClick={() => handleQtyChange(product.id, -1)}
                    >
                      <Minus size={12} />
                    </button>
                    <span className="stepper-val" data-role="quantity">
                      {getQuantity(product.id)}
                    </span>
                    <button
                      className="stepper-btn"
                      onClick={() => handleQtyChange(product.id, 1)}
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <button
                    className="btn-add-cart"
                    onClick={() => handleAdd(product)}
                  >
                    <ShoppingBag size={14} />
                    담기
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
