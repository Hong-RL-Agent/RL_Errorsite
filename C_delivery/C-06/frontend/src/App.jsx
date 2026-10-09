import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import { StoreHero, MenuList } from './components/StoreViews';
import MenuOptionModal from './components/MenuOptionModal';
import CheckoutView from './components/CheckoutView';
import { OrderSuccessView, OrderHistoryView, PriceChangeConflictModal } from './components/OrderResultViews';

export default function App() {
  const [currentView, setCurrentView] = useState('menu'); // 'menu' | 'checkout' | 'success' | 'orders'
  const [store, setStore] = useState(null);
  const [menus, setMenus] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [summary, setSummary] = useState({
    subtotal: 12000,
    discount: 0,
    deliveryFee: 3500,
    riderTip: 0,
    finalAmount: 15500,
    minimumOrderAmount: 15000,
    minimumOrderSatisfied: false
  });
  const [coupons, setCoupons] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);

  // Modals & Active selections
  const [selectedMenuForOption, setSelectedMenuForOption] = useState(null);
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(1);
  const [completedOrder, setCompletedOrder] = useState(null);
  
  const [priceConflictModalOpen, setPriceConflictModalOpen] = useState(false);
  const [priceConflictDetails, setPriceConflictDetails] = useState(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      const [sRes, cRes, smRes, cpRes, adRes, ordRes] = await Promise.all([
        fetch('/api/stores/1').then((r) => r.json()),
        fetch('/api/carts').then((r) => r.json()),
        fetch('/api/checkout/summary').then((r) => r.json()),
        fetch('/api/coupons').then((r) => r.json()),
        fetch('/api/addresses').then((r) => r.json()),
        fetch('/api/orders').then((r) => r.json())
      ]);

      if (sRes.store) {
        setStore(sRes.store);
        setMenus(sRes.menus || []);
      }
      if (cRes.items) setCartItems(cRes.items);
      if (smRes.finalAmount !== undefined) setSummary(smRes);
      if (cpRes.coupons) setCoupons(cpRes.coupons);
      if (adRes.addresses) setAddresses(adRes.addresses);
      if (ordRes.orders) setOrders(ordRes.orders);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh cart & summary
  const refreshCartAndSummary = async () => {
    try {
      const [cRes, smRes] = await Promise.all([
        fetch('/api/carts').then((r) => r.json()),
        fetch('/api/checkout/summary').then((r) => r.json())
      ]);
      if (cRes.items) setCartItems(cRes.items);
      if (smRes.finalAmount !== undefined) setSummary(smRes);
    } catch (err) {
      console.error(err);
    }
  };

  // Open Menu Option Modal
  const handleSelectMenu = (menu) => {
    setSelectedMenuForOption(menu);
    setIsOptionModalOpen(true);
  };

  // Add Item to Cart
  const handleAddToCart = async (menuId, quantity, selectedOptionIds) => {
    try {
      await fetch('/api/carts/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menuId, quantity, selectedOptionIds })
      });
      await refreshCartAndSummary();
      setCurrentView('checkout');
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  // Update Cart Item Quantity
  const handleUpdateCartQty = async (itemId, quantity) => {
    try {
      await fetch(`/api/carts/items/${itemId}`, {
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
      await fetch(`/api/carts/items/${itemId}`, { method: 'DELETE' });
      await refreshCartAndSummary();
    } catch (err) {
      console.error('Failed to remove cart item:', err);
    }
  };

  // Select Address (BUG-604)
  const handleSelectAddress = async (addrId) => {
    setSelectedAddressId(addrId);
    try {
      await fetch('/api/checkout/delivery-fee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addressId: addrId })
      });
      await refreshCartAndSummary();
    } catch (err) {
      console.error('Failed to select address:', err);
    }
  };

  // Apply Coupon (BUG-423)
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

  // Set Rider Tip
  const handleSetRiderTip = async (amount) => {
    try {
      await fetch('/api/checkout/rider-tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      await refreshCartAndSummary();
    } catch (err) {
      console.error('Failed to set rider tip:', err);
    }
  };

  // Cancel Rider Tip (BUG-1822)
  const handleCancelRiderTip = async () => {
    try {
      await fetch('/api/checkout/rider-tip', { method: 'DELETE' });
    } catch (err) {
      // Intentionally fails silently on UI while keeping backend tip
      console.warn('Rider tip cancellation RPC error:', err);
    }
  };

  // Place Order (BUG-1604 validation)
  const handlePlaceOrder = async () => {
    setIsSubmittingOrder(true);
    try {
      // Step 1: Validate checkout (BUG-1604: triggers 409 price conflict on Menu 2)
      const valRes = await fetch('/api/checkout/validate', { method: 'POST' });
      if (valRes.status === 409) {
        const conflictData = await valRes.json();
        setPriceConflictDetails(conflictData);
        setPriceConflictModalOpen(true);
        setIsSubmittingOrder(false);
        return;
      }

      // Step 2: Place order
      const orderRes = await fetch('/api/orders', { method: 'POST' });
      if (!orderRes.ok) throw new Error('Order placement failed');

      const data = await orderRes.json();
      if (data.success) {
        setCompletedOrder({
          orderId: data.orderId,
          orderNumber: data.orderNumber,
          finalAmount: data.finalAmount,
          riderTip: data.riderTip
        });
        setCurrentView('success');
        await fetchData();
      }
    } catch (err) {
      console.error('Place order error:', err);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Reset DB (POST /api/test/reset)
  const handleResetDb = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/test/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSelectedAddressId(1);
        setSelectedMenuForOption(null);
        setIsOptionModalOpen(false);
        setPriceConflictModalOpen(false);
        setCompletedOrder(null);
        await fetchData();
        setCurrentView('menu');
      }
    } catch (err) {
      console.error('Reset DB error:', err);
    } finally {
      setIsResetting(false);
    }
  };

  const totalCartCount = cartItems.reduce((sum, it) => sum + it.quantity, 0);

  return (
    <div className="app-container">
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        cartCount={totalCartCount}
        onResetDb={handleResetDb}
        isResetting={isResetting}
      />

      <main className="main-wrap">
        {currentView === 'menu' && (
          <>
            <StoreHero store={store} />
            <MenuList menus={menus} onSelectMenu={handleSelectMenu} />
          </>
        )}

        {currentView === 'checkout' && (
          <CheckoutView
            cartItems={cartItems}
            summary={summary}
            coupons={coupons}
            addresses={addresses}
            selectedAddressId={selectedAddressId}
            onSelectAddress={handleSelectAddress}
            onUpdateCartQty={handleUpdateCartQty}
            onRemoveCartItem={handleRemoveCartItem}
            onApplyCoupon={handleApplyCoupon}
            onSetRiderTip={handleSetRiderTip}
            onCancelRiderTip={handleCancelRiderTip}
            onPlaceOrder={handlePlaceOrder}
            isSubmittingOrder={isSubmittingOrder}
          />
        )}

        {currentView === 'success' && (
          <OrderSuccessView
            order={completedOrder}
            onReturnMenu={() => setCurrentView('menu')}
          />
        )}

        {currentView === 'orders' && (
          <OrderHistoryView orders={orders} />
        )}
      </main>

      {/* Menu Option Modal */}
      <MenuOptionModal
        menu={selectedMenuForOption}
        isOpen={isOptionModalOpen}
        onClose={() => setIsOptionModalOpen(false)}
        onAddToCart={handleAddToCart}
      />

      {/* Price Conflict Modal (BUG-1604) */}
      <PriceChangeConflictModal
        isOpen={priceConflictModalOpen}
        onClose={() => setPriceConflictModalOpen(false)}
        errorDetails={priceConflictDetails}
      />
    </div>
  );
}
