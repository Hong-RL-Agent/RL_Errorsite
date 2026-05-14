import React, { useState, useEffect } from 'react';
import './styles.css';
import { useToast } from './hooks/useToast.jsx';
import Header from './components/Header.jsx';
import SummaryCards from './components/SummaryCards.jsx';
import QuickTransfer from './components/QuickTransfer.jsx';
import TransactionList from './components/TransactionList.jsx';

function App() {
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('Accounts');
  const { addToast, ToastContainer } = useToast();

  useEffect(() => {
    fetch('/api/account').then(r => r.json()).then(setAccount);
    fetch('/api/transactions').then(r => r.json()).then(setTransactions);
  }, []);

  const handleTransfer = async (amount) => {
    // Optimistic Update handled in QuickTransfer component to simulate Bug 02
    try {
      const res = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      return data;
    } catch (err) {
      return { success: false, message: 'Network error' };
    }
  };

  return (
    <div className="app-wrapper">
      <Header activeTab={activeTab} setActiveTab={(tab) => {
        if (tab === 'Loans' || tab === 'Settings') {
          addToast('This feature is currently under preparation.');
        } else {
          setActiveTab(tab);
        }
      }} />

      <div className="container">
        <SummaryCards account={account} />
        
        <div className="grid-main">
          <TransactionList transactions={transactions} addToast={addToast} />
          <QuickTransfer 
            balance={account?.balance || 0} 
            setBalance={(newVal) => setAccount(prev => ({ ...prev, balance: newVal }))}
            onTransfer={handleTransfer}
            addToast={addToast}
          />
        </div>
      </div>

      <footer className="footer">
        © 2026 Grand Estate Bank. All rights reserved. Secure Banking.
      </footer>

      <ToastContainer />
    </div>
  );
}

export default App;
