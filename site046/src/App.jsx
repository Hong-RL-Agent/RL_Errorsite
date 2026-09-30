import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Toast, { showToast } from './components/Toast';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Addresses from './pages/Addresses';
import Points from './pages/Points';
import Wishlist from './pages/Wishlist';
import { fetchApi } from './api/client';

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // home, detail, cart, checkout, orders, addresses, points, wishlist
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [cart, setCart] = useState({ items: [], itemsCount: 0, itemsTotal: 0, shippingFee: 0, finalTotal: 0 });
  const [wishlistIds, setWishlistIds] = useState([]);
  const [points, setPoints] = useState(3500);

  useEffect(() => {
    loadCategories();
    loadCart();
    loadWishlist();
    loadPoints();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, searchQuery, sortBy]);

  const loadCategories = async () => {
    try {
      const data = await fetchApi('/api/categories');
      setCategories(data.categories || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (sortBy) params.append('sort', sortBy);

      const data = await fetchApi(`/api/products?${params.toString()}`);
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadCart = async () => {
    try {
      const data = await fetchApi('/api/cart');
      setCart(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadWishlist = async () => {
    try {
      const data = await fetchApi('/api/wishlist');
      setWishlistIds(data.ids || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadPoints = async () => {
    try {
      const data = await fetchApi('/api/points');
      setPoints(data.points?.balance || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCart = async (product, quantity = 1) => {
    try {
      const data = await fetchApi('/api/cart/items', {
        method: 'POST',
        body: JSON.stringify({ productId: product.id, quantity })
      });
      setCart(data.cart);
      showToast('장바구니 담기 완료', `${product.name} ${quantity}개가 담겼습니다.`, 'success');
    } catch (err) {
      showToast('담기 실패', err.message, 'error');
    }
  };

  const handleToggleWishlist = async (productId) => {
    const isWish = wishlistIds.includes(productId);
    try {
      if (isWish) {
        await fetchApi(`/api/wishlist/${productId}`, { method: 'DELETE' });
        setWishlistIds((prev) => prev.filter((id) => id !== productId));
        showToast('찜 해제', '찜 목록에서 삭제되었습니다.', 'info');
      } else {
        await fetchApi(`/api/wishlist/${productId}`, { method: 'POST' });
        setWishlistIds((prev) => [...prev, productId]);
        showToast('찜 등록', '찜 목록에 추가되었습니다.', 'success');
      }
    } catch (err) {
      showToast('오류', err.message, 'error');
    }
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setActiveTab('detail');
  };

  const handleReorder = async (items) => {
    try {
      for (const it of items) {
        await fetchApi('/api/cart/items', {
          method: 'POST',
          body: JSON.stringify({ productId: it.productId, quantity: it.quantity })
        });
      }
      await loadCart();
      showToast('재주문 담기 완료', '이전 주문 상품들이 장바구니에 담겼습니다.', 'success');
      setActiveTab('cart');
    } catch (err) {
      showToast('오류', err.message, 'error');
    }
  };

  const handleOrderSuccess = (newOrder) => {
    loadCart();
    loadPoints();
    setActiveTab('orders');
  };

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cart.itemsCount || 0}
        wishlistCount={wishlistIds.length}
        points={points}
        searchQuery={searchQuery}
        onSearch={(q) => {
          setSearchQuery(q);
          if (activeTab !== 'home') setActiveTab('home');
        }}
      />

      <main>
        {activeTab === 'home' && (
          <Home
            products={products}
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(catId) => setSelectedCategory(catId)}
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleAddToCart}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            sortBy={sortBy}
            onSortChange={(s) => setSortBy(s)}
          />
        )}

        {activeTab === 'detail' && selectedProduct && (
          <ProductDetail
            product={selectedProduct}
            onBack={() => setActiveTab('home')}
            onAddToCart={handleAddToCart}
            isWishlisted={wishlistIds.includes(selectedProduct.id)}
            onToggleWishlist={handleToggleWishlist}
            onNavigateCheckout={() => setActiveTab('checkout')}
          />
        )}

        {activeTab === 'cart' && (
          <Cart
            cart={cart}
            onUpdateCart={(newCart) => setCart(newCart)}
            onNavigateCheckout={() => setActiveTab('checkout')}
            onContinueShopping={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'checkout' && (
          <Checkout
            onOrderSuccess={handleOrderSuccess}
            onNavigateAddresses={() => setActiveTab('addresses')}
          />
        )}

        {activeTab === 'orders' && (
          <Orders
            onReorder={handleReorder}
            onContinueShopping={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'addresses' && (
          <Addresses />
        )}

        {activeTab === 'points' && (
          <Points />
        )}

        {activeTab === 'wishlist' && (
          <Wishlist
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleAddToCart}
            onContinueShopping={() => setActiveTab('home')}
          />
        )}
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '16px', color: '#059669', marginBottom: '4px' }}>FreshCart 주식회사</div>
              <div>서울특별시 강남구 테헤란로 142 | 대표이사: 이주이 | 고객센터: 1588-0046 (09:00 ~ 18:00)</div>
              <div>통신판매업신고: 2026-서울강남-0460 | 사업자등록번호: 220-88-04699</div>
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
              © 2026 FreshCart Delivery & Grocery Platform. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      <Toast />
    </div>
  );
}
