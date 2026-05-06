import React, { useState, useEffect } from 'react';
import './styles.css';
import { useToast } from './hooks/useToast.jsx';
import Sidebar from './components/Sidebar.jsx';
import TopHeader from './components/TopHeader.jsx';
import SummaryCards from './components/SummaryCards.jsx';
import BudgetBars from './components/BudgetBars.jsx';
import TransactionTable from './components/TransactionTable.jsx';
import Drawer from './components/Drawer.jsx';

const CATEGORIES = ['전체', '식비', '교통', '급여', '쇼핑', '주거'];

const BUDGET_LIMITS = {
  '식비': 300000,
  '교통': 50000,
  '쇼핑': 150000,
  '주거': 600000,
};

function App() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedMonth, setSelectedMonth] = useState('2026-05');
  const [selectedTx, setSelectedTx] = useState(null);
  const { addToast, ToastContainer } = useToast();

  useEffect(() => {
    fetch('/api/transactions')
      .then(r => r.json())
      .then(data => { setTransactions(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = selectedCategory === '전체'
    ? transactions
    : transactions.filter(t => t.category === selectedCategory);

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0);

  // INTENTIONAL GUI BUG: site012-bug02
  // Type: state-mismatch
  // Description: 총 지출 요약 카드에 실제 합계(totalExpense) 대신 의도적으로
  // 조작된 고정 값(totalExpense + 99999)을 표시하여 목록 합계와 불일치를 만듦.
  const displayedExpense = totalExpense + 99999;

  const balance = totalIncome - totalExpense;

  if (loading) return <div style={{ padding: '40px', fontSize: '1rem' }}>Loading...</div>;

  return (
    <div className="app-wrapper">
      <Sidebar addToast={addToast} />
      <div className="main">
        <TopHeader
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          addToast={addToast}
        />
        <SummaryCards
          totalIncome={totalIncome}
          displayedExpense={displayedExpense}
          balance={balance}
        />
        <BudgetBars transactions={transactions} budgetLimits={BUDGET_LIMITS} />
        <div className="filter-section">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <TransactionTable transactions={filtered} onRowClick={setSelectedTx} />
      </div>

      {selectedTx && <Drawer tx={selectedTx} onClose={() => setSelectedTx(null)} />}
      <ToastContainer />
    </div>
  );
}

export default App;
