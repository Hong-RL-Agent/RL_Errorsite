import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Navbar, HistoryToolbar } from './components/NavBars';
import MyPage from './pages/MyPage';
import AddressPage from './pages/AddressPage';
import { NewAddressPage, EditAddressPage } from './pages/AddressFormPages';
import OrderPage from './pages/OrderPage';

// Stale Client Cache storage for BUG-1797 & BUG-1609
let clientQueryCache = null;

function AppContent() {
  const [addresses, setAddresses] = useState([]);
  const [isResetting, setIsResetting] = useState(false);
  const location = useLocation();

  // Fetch addresses from backend
  const fetchAddressesFromServer = useCallback(async () => {
    try {
      const res = await fetch('/api/addresses');
      const data = await res.json();
      if (data.addresses) {
        setAddresses(data.addresses);
        // Initialize cache on first fetch
        if (!clientQueryCache) {
          clientQueryCache = JSON.parse(JSON.stringify(data.addresses));
        }
      }
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    }
  }, []);

  // When visiting /mypage/addresses:
  // BUG-1797: If clientQueryCache exists, use stale client cache instead of refetching from DB!
  useEffect(() => {
    if (location.pathname === '/mypage/addresses') {
      if (clientQueryCache) {
        setAddresses(JSON.parse(JSON.stringify(clientQueryCache)));
      } else {
        fetchAddressesFromServer();
      }
    }
  }, [location.pathname, fetchAddressesFromServer]);

  // Initial load
  useEffect(() => {
    fetchAddressesFromServer();
  }, [fetchAddressesFromServer]);

  // Set Default Address (BUG-894)
  const handleSetDefault = async (id) => {
    try {
      await fetch(`/api/addresses/${id}/default`, { method: 'PUT' });
      // Optimistic update in current view
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, is_default: a.id === id ? 1 : 0 }))
      );
      // Clear cache so that when user navigates away and revisits, backend returns reverted default!
      clientQueryCache = null;
    } catch (err) {
      console.error(err);
    }
  };

  // Add Address (BUG-194: Persistence loss on reload)
  const handleAddAddress = async (formData) => {
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success && data.address) {
        // Appends to React memory state and cache without SQLite DB insertion
        setAddresses((prev) => [...prev, data.address]);
        if (clientQueryCache) {
          clientQueryCache.push(data.address);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Edit Address (BUG-1797 & BUG-1609: Updates DB, but omits clientQueryCache invalidation)
  const handleEditAddress = async (id, formData) => {
    try {
      const res = await fetch(`/api/addresses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success && data.address) {
        // Update local memory state for immediate edit feedback
        setAddresses((prev) =>
          prev.map((a) => (a.id === id ? data.address : a))
        );
        // Notice: clientQueryCache is INTENTIONALLY NOT updated to reproduce BUG-1797!
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Address (BUG-5)
  const handleDeleteAddress = async (id) => {
    try {
      await fetch(`/api/addresses/${id}`, { method: 'DELETE' });
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      if (clientQueryCache) {
        clientQueryCache = clientQueryCache.filter((a) => a.id !== id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Reload / F5 simulation (BUG-194: Discards memory state and reads from SQLite DB)
  const handleReload = async () => {
    clientQueryCache = null;
    await fetchAddressesFromServer();
  };

  // Reset DB (POST /api/test/reset)
  const handleResetDb = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/test/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        clientQueryCache = null;
        await fetchAddressesFromServer();
      }
    } catch (err) {
      console.error('Reset DB error:', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="app-wrapper">
      <Navbar onResetDb={handleResetDb} isResetting={isResetting} />
      <HistoryToolbar onReload={handleReload} />

      <main className="main-container">
        <Routes>
          <Route path="/" element={<Navigate to="/mypage" replace />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route
            path="/mypage/addresses"
            element={
              <AddressPage
                addresses={addresses}
                onSetDefault={handleSetDefault}
                onDeleteAddress={handleDeleteAddress}
              />
            }
          />
          <Route
            path="/mypage/addresses/new"
            element={<NewAddressPage onAddAddress={handleAddAddress} />}
          />
          <Route
            path="/mypage/addresses/:id/edit"
            element={<EditAddressPage addresses={addresses} onEditAddress={handleEditAddress} />}
          />
          <Route path="/order" element={<OrderPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
