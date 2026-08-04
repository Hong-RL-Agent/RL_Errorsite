import React, { useState, useEffect } from 'react';
import { Star, Clock } from 'lucide-react';

export default function RestaurantList({ categories, addToCart }) {
  const [restaurants, setRestaurants] = useState([]);
  const [activeCategory, setActiveCategory] = useState('전체');

  useEffect(() => {
    fetch(`/api/restaurants?category=${activeCategory}`)
      .then(res => res.json())
      .then(data => setRestaurants(data.data));
  }, [activeCategory]);

  return (
    <div>
      <div className="category-scroll">
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`cat-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div>
        {restaurants.map(res => (
          <div key={res.id} className="restaurant-card">
            <div className="res-header">
              <div>
                <div className="res-name">{res.name}</div>
                <div className="res-meta">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={14} fill="currentColor" color="#f59e0b" />
                    {res.rating}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} />
                    {res.deliveryTime}
                  </span>
                  <span>최소주문 {res.minOrder.toLocaleString()}원</span>
                </div>
              </div>
            </div>
            
            <div className="menu-list">
              {res.menus.map(menu => (
                <div key={menu.id} className="menu-item">
                  <div className="menu-info">
                    <div className="menu-name">{menu.name}</div>
                    <div className="menu-desc">{menu.desc}</div>
                    <div className="menu-price">{menu.price.toLocaleString()}원</div>
                  </div>
                  
                  {/* INTENTIONAL GUI BUG: site005-bug01
                     Type: button-no-response
                     Description: 특정 메뉴의 "담기" 버튼을 눌러도 장바구니에 추가되지 않는다.
                     Explanation: id가 101인 메뉴(후라이드 치킨)의 담기 버튼은 아무 동작도 수행하지 않는 빈 함수로 덮어씌움. */}
                  {menu.id === 101 ? (
                    <button 
                      className="btn-add" 
                      data-bug-id="site005-bug01"
                      onClick={() => {}} 
                    >
                      담기
                    </button>
                  ) : (
                    <button 
                      className="btn-add" 
                      onClick={() => addToCart(menu)}
                    >
                      담기
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        {restaurants.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            해당 카테고리의 음식점이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
