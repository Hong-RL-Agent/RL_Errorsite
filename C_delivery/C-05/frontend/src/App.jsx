import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import ProductCatalog from './components/ProductCatalog';
import CheckoutFlow from './components/CheckoutFlow';
import { OrderSuccess, OrderHistory } from './components/OrderViews';
import ConflictModal from './components/ConflictModal';

export default function App() {
  const [currentView, setCurrentView] = useState('catalog'); // 'catalog' | 'checkout' | 'success' | 'orders'
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [summary, setSummary] = useState({
    subtotal: 15000,
    discount: 0,
    shippingFee: 0,
    tax: 0,
    total: 15000,
    appliedCouponCodes: []
  });
  const [coupons, setCoupons] = useState([]);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  
  const [selectedShippingOptionId, setSelectedShippingOptionId] = useState(1);
  const [selectedAddressId, setSelectedAddressId] = useState(1);
  const [completedOrder, setCompletedOrder] = useState(null);
  
  // Modals & States
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [conflictErrorMessage, setConflictErrorMessage] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Fetch all initial data
  const fetchData = useCallback(async () => {
    try {
      const [pRes, cRes, sRes, cpRes, shRes, adRes, ordRes] = await Promise.all([
        fetch('/api/products').then((r) => r.json()),
        fetch('/api/cart').then((r) => r.json()),
        fetch('/api/checkout/summary').then((r) => r.json()),
        fetch('/api/coupons').then((r) => r.json()),
        fetch('/api/shipping-options').then((r) => r.json()),
        fetch('/api/addresses').then((r) => r.json()),
        fetch('/api/orders').then((r) => r.json())
      ]);

      if (pRes.products) setProducts(pRes.products);
      if (cRes.items) setCartItems(cRes.items);
      if (sRes.total !== undefined) {
        setSummary(sRes);
        if (sRes.shippingOption) setSelectedShippingOptionId(sRes.shippingOption.id);
      }
      if (cpRes.coupons) setCoupons(cpRes.coupons);
      if (shRes.shippingOptions) setShippingOptions(shRes.shippingOptions);
      if (adRes.addresses) setAddresses(adRes.addresses);
      if (ordRes.orders) setOrders(ordRes.orders);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Sync Summary & Cart
  const refreshCartAndSummary = async () => {
    try {
      const [cRes, sRes] = await Promise.all([
        fetch('/api/cart').then((r) => r.json()),
        fetch('/api/checkout/summary').then((r) => r.json())
      ]);
      if (cRes.items) setCartItems(cRes.items);
      if (sRes.total !== undefined) setSummary(sRes);
    } catch (err) {
      console.error(err);
    }
  };

  // Add To Cart
  const handleAddToCart = async (productId, quantity = 1) => {
    try {
      await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity })
      });
      await refreshCartAndSummary();
      setCurrentView('checkout');
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  // Update Cart Qty
  const handleUpdateCartQty = async (itemId, quantity) => {
    try {
      await fetch(`/api/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });
      await refreshCartAndSummary();
    } catch (err) {
      console.error('Failed to update cart qty:', err);
    }
  };

  // Remove Cart Item
  const handleRemoveCartItem = async (itemId) => {
    try {
      await fetch(`/api/cart/items/${itemId}`, { method: 'DELETE' });
      await refreshCartAndSummary();
    } catch (err) {
      console.error('Failed to remove cart item:', err);
    }
  };

  // Select Shipping Option (BUG-627 Stealth Cart Injection)
  const handleSelectShippingOption = async (optionId) => {
    setSelectedShippingOptionId(optionId);
    try {
      await fetch('/api/checkout/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shippingOptionId: optionId })
      });
      // Refreshes cart to reflect stealth item injection if Dawn Express
      await refreshCartAndSummary();
    } catch (err) {
      console.error('Failed to select shipping option:', err);
    }
  };

  // Select Address
  const handleSelectAddress = (addrId) => {
    setSelectedAddressId(addrId);
  };

  // Apply Coupon (BUG-011, BUG-013, BUG-652)
  const handleApplyCoupon = async (couponCode) => {
    try {
      await fetch('/api/checkout/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode })
      });
      await refreshCartAndSummary();
    } catch (err) {
      console.error('Failed to apply coupon:', err);
    }
  };

  // Place Order (BUG-446: 409 Conflict on out of stock)
  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId: 1,
          shippingAddressId: selectedAddressId,
          shippingOptionId: selectedShippingOptionId
        })
      });

      // BUG-446: Inventory conflict
      if (res.status === 409) {
        const errorData = await res.json().catch(() => ({}));
        setConflictErrorMessage(errorData.message || '409 Conflict: 상품 재고가 부족합니다.');
        setConflictModalOpen(true);
        setIsPlacingOrder(false);
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to place order');
      }

      const data = await res.json();
      if (data.success) {
        setCompletedOrder({
          orderId: data.orderId,
          orderNumber: data.orderNumber,
          total: data.total
        });
        setCurrentView('success');
        await fetchData();
      }
    } catch (err) {
      console.error('Place order error:', err);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Reset DB (POST /api/test/reset)
  const handleResetDb = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/test/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSelectedShippingOptionId(1);
        setSelectedAddressId(1);
        setConflictModalOpen(false);
        setCompletedOrder(null);
        await fetchData();
        setCurrentView('catalog');
      }
    } catch (err) {
      console.error('Reset DB error:', err);
    } finally {
      setIsResetting(false);
    }
  };

  const totalCartCount = cartItems.reduce((sum, it) => sum + it.quantity, 0);

  return (
    <div className="app-wrapper">
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        cartItemCount={totalCartCount}
        onResetDb={handleResetDb}
        isResetting={isResetting}
      />

      <main className="main-container">
        {currentView === 'catalog' && (
          <ProductCatalog
            products={products}
            onAddToCart={handleAddToCart}
            onNavigateToCheckout={() => setCurrentView('checkout')}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutFlow
            cartItems={cartItems}
            summary={summary}
            coupons={coupons}
            shippingOptions={shippingOptions}
            addresses={addresses}
            selectedShippingOptionId={selectedShippingOptionId}
            selectedAddressId={selectedAddressId}
            onUpdateCartQty={handleUpdateCartQty}
            onRemoveCartItem={handleRemoveCartItem}
            onSelectShippingOption={handleSelectShippingOption}
            onSelectAddress={handleSelectAddress}
            onApplyCoupon={handleApplyCoupon}
            onPlaceOrder={handlePlaceOrder}
            isPlacingOrder={isPlacingOrder}
          />
        )}

        {currentView === 'success' && (
          <OrderSuccess
            order={completedOrder}
            onContinueShopping={() => setCurrentView('catalog')}
          />
        )}

        {currentView === 'orders' && (
          <OrderHistory orders={orders} />
        )}
      </main>

      {/* Conflict Modal (BUG-446) */}
      <ConflictModal
        isOpen={conflictModalOpen}
        onClose={() => setConflictModalOpen(false)}
        errorMessage={conflictErrorMessage}
      />
    </div>
  );
}
