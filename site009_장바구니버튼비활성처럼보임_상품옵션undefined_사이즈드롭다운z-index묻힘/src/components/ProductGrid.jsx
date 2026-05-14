import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function ProductGrid({ products, onAddToCart }) {
  // Store selections per product id
  const [selections, setSelections] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null);

  const handleColorSelect = (productId, color) => {
    setSelections(prev => ({ ...prev, [productId]: { ...prev[productId], color } }));
  };
  const handleSizeSelect = (productId, size) => {
    setSelections(prev => ({ ...prev, [productId]: { ...prev[productId], size } }));
    setOpenDropdown(null);
  };

  return (
    <div className="product-grid">
      {products.map(product => {
        const selectedColor = selections[product.id]?.color || product.colors[0];
        const selectedSize = selections[product.id]?.size;
        const isDropdownOpen = openDropdown === product.id;

        return (
          <div key={product.id} className="product-card">
            <div className="prod-img">{product.image}</div>
            <div className="prod-info">
              <div className="prod-name">{product.name}</div>
              <div className="prod-price">{product.price.toLocaleString()} KRW</div>
            </div>

            <div className="prod-actions">
              <div className="swatch-group">
                {product.colors.map(color => (
                  <button 
                    key={color} 
                    className={`swatch ${selectedColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorSelect(product.id, color)}
                  />
                ))}
              </div>

              {/* INTENTIONAL GUI BUG: site009-bug02
                 Type: component-rendering
                 Description: 상품 옵션 영역에 undefined 텍스트가 표시된다.
                 Explanation: product.material 같은 존재하지 않는 속성을 렌더링하여 undefined(문자열로 강제출력)를 표시함. */}
              <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }} data-bug-id="site009-bug02">
                Material: {String(product.material)}
              </div>

              <div className="size-select-wrap">
                <button 
                  className="size-select-btn" 
                  onClick={() => setOpenDropdown(isDropdownOpen ? null : product.id)}
                >
                  {selectedSize || 'SIZE'}
                  <ChevronDown size={16} />
                </button>
                
                {isDropdownOpen && (
                  // INTENTIONAL GUI BUG: site009-bug03 타겟 (main.css에서 z-index 문제)
                  <div className="size-dropdown-menu" data-bug-id="site009-bug03">
                    {product.sizes.map(size => (
                      <button 
                        key={size} 
                        className="size-item"
                        onClick={() => handleSizeSelect(product.id, size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* INTENTIONAL GUI BUG: site009-bug01
                 Type: form-ui
                 Description: 사이즈를 선택해도 "장바구니 담기" 버튼이 비활성화된 것처럼 보인다.
                 Explanation: selectedSize가 존재해도 무조건 disabled-look 클래스를 부여하여 시각적으로 비활성화된 것처럼 보이게 함. */}
              <button 
                className={`btn-add-cart disabled-look`} 
                data-bug-id="site009-bug01"
                onClick={() => {
                  if(selectedSize) onAddToCart(product, selectedColor, selectedSize);
                  else alert('사이즈를 선택해주세요.');
                }}
              >
                ADD TO CART
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
