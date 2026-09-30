import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CategoryNav from './components/CategoryNav';
import Toast from './components/Toast';

import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Wishlist from './pages/Wishlist';
import Reviews from './pages/Reviews';
import MyPage from './pages/MyPage';
import ProductCard from './components/ProductCard';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Checkout flow state
  const [checkoutItems, setCheckoutItems] = useState([]);

  const showToast = (message, bugId = null, secId = null, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, bugId, secId, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const fetchInitialData = async () => {
    try {
      const [prodRes, cpRes, cartRes, wishRes, dashRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/coupons'),
        fetch('/api/cart'),
        fetch('/api/wishlist'),
        fetch('/api/dashboard')
      ]);

      const prodData = await prodRes.json();
      const cpData = await cpRes.json();
      const cartData = await cartRes.json();
      const wishData = await wishRes.json();
      const dashData = await dashRes.json();

      if (prodData.success) setProducts(prodData.data);
      if (cpData.success) setCoupons(cpData.data);
      if (cartData.success) setCart(cartData.data);
      if (wishData.success) setWishlist(wishData.data);
      if (dashData.success) setUser(dashData.data.user);
    } catch (err) {
      console.error('Initial fetch failed', err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setCurrentPage('detail');
  };

  // Cart operations
  const handleAddToCart = async (product, quantity = 1, color = '기본') => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity, color })
      });
      const data = await res.json();
      if (data.success) {
        setCart(data.data);
        showToast(`[${product.name}] 장바구니에 담겼습니다!`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBuyNow = (product, quantity = 1, color = '기본') => {
    setCheckoutItems([
      {
        id: `direct-${product.id}`,
        productId: product.id,
        name: product.name,
        price: product.discountPrice || product.price,
        quantity,
        color: color || product.colors?.[0] || '기본',
        image: product.image
      }
    ]);
    setCurrentPage('checkout');
  };

  const handleToggleWishlist = async (product) => {
    const isExisting = wishlist.some((w) => w.productId === product.id);
    if (isExisting) {
      await fetch(`/api/wishlist/${product.id}`, { method: 'DELETE' });
      setWishlist(wishlist.filter((w) => w.productId !== product.id));
      showToast('찜 목록에서 제외되었습니다.', null, null, 'info');
    } else {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id })
      });
      const data = await res.json();
      if (data.success) {
        setWishlist(data.data);
        showToast(
          `[${product.name}] 찜 목록에 추가되었습니다.`,
          data.bugId || 'site043-bug03',
          data.secId || 'SEC-398'
        );
      }
    }
  };

  // Filter products by category and search
  const filteredProducts = products.filter((p) => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const matchSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div>
      <Toast toasts={toasts} onClose={(id) => setToasts(toasts.filter((t) => t.id !== id))} />

      {/* Top Navbar */}
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        wishlistCount={wishlist.length}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      {/* Category Navigation Bar */}
      <CategoryNav
        activeCategory={activeCategory}
        setActiveCategory={(cat) => {
          setActiveCategory(cat);
          if (currentPage !== 'home' && currentPage !== 'products') {
            setCurrentPage('products');
          }
        }}
      />

      {/* Main Page Render */}
      <main className="main-content">
        {currentPage === 'home' && (
          <Home
            products={products}
            onSelectProduct={handleSelectProduct}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            onNavigate={setCurrentPage}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />
        )}

        {currentPage === 'products' && (
          <div>
            <div className="section-head">
              <div>
                <h2>{activeCategory === 'all' ? '전체 가구 & 인테리어 컬렉션' : `${activeCategory} 컬렉션`} ({filteredProducts.length}개)</h2>
                <p>Roomly가 큐레이션한 감각적인 가구와 홈 데코 아이템을 만나보세요.</p>
              </div>
            </div>

            <div className="product-grid">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onSelect={handleSelectProduct}
                  isWishlisted={wishlist.some((w) => w.productId === prod.id)}
                  onToggleWishlist={handleToggleWishlist}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                />
              ))}
            </div>
          </div>
        )}

        {currentPage === 'detail' && (
          <ProductDetail
            product={selectedProduct}
            onBack={() => setCurrentPage('home')}
            isWishlisted={wishlist.some((w) => w.productId === selectedProduct?.id)}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />
        )}

        {currentPage === 'cart' && (
          <Cart
            cart={cart}
            onUpdateQuantity={(id, qty) => {
              setCart(cart.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
            }}
            onRemoveItem={(id) => setCart(cart.filter((i) => i.id !== id))}
            onProceedCheckout={() => {
              setCheckoutItems(cart);
              setCurrentPage('checkout');
            }}
            onNavigate={setCurrentPage}
          />
        )}

        {currentPage === 'checkout' && (
          <Checkout
            items={checkoutItems}
            coupons={coupons}
            onCompleteOrder={() => {
              setCart([]);
              setCurrentPage('orders');
              fetchInitialData();
            }}
            showToast={showToast}
          />
        )}

        {currentPage === 'orders' && (
          <Orders showToast={showToast} />
        )}

        {currentPage === 'wishlist' && (
          <Wishlist
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            showToast={showToast}
          />
        )}

        {currentPage === 'reviews' && (
          <Reviews showToast={showToast} />
        )}

        {currentPage === 'mypage' && (
          <MyPage user={user} onNavigate={setCurrentPage} />
        )}
      </main>
    </div>
  );
}
