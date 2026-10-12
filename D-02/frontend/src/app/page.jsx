'use client';

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import SummaryCards from '../components/SummaryCards';
import CategoryChart from '../components/CategoryChart';
import BudgetProgress from '../components/BudgetProgress';
import AccountStatus from '../components/AccountStatus';
import TransactionTable from '../components/TransactionTable';
import AddTransactionModal from '../components/AddTransactionModal';
import EditTransactionModal from '../components/EditTransactionModal';
import EditBudgetModal from '../components/EditBudgetModal';
import { api } from '../lib/api';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function Home() {
  const [selectedMonth, setSelectedMonth] = useState('2026-10');
  
  // Data States
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [stats, setStats] = useState(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editingBudget, setEditingBudget] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Toast Helper
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Load All Data
  const loadData = async () => {
    try {
      const [tList, cList, aList, bList, sData] = await Promise.all([
        api.getTransactions(),
        api.getCategories(),
        api.getAccounts(),
        api.getBudgets(),
        api.getMonthlyStats(selectedMonth)
      ]);
      setTransactions(tList || []);
      setCategories(cList || []);
      setAccounts(aList || []);
      setBudgets(bList || []);
      setStats(sData || null);
    } catch (err) {
      console.error('Failed to load PennyLog data:', err);
      showToast('데이터 불러오기 실패: ' + err.message, 'danger');
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  // 1. Reset Database
  const handleResetData = async () => {
    try {
      await api.resetData();
      await loadData();
      showToast('초기 41개 거래 데이터 및 예산 상태로 전체 복원되었습니다.', 'info');
    } catch (err) {
      showToast('초기화 실패: ' + err.message, 'danger');
    }
  };

  // 2. Add Transaction
  const handleAddTransaction = async (payload) => {
    try {
      const res = await api.createTransaction(payload);
      if (res.success) {
        showToast('거래 내역이 성공적으로 등록되었습니다.', 'success');
        setIsAddModalOpen(false);
        await loadData();
      }
    } catch (err) {
      showToast('거래 등록 실패: ' + err.message, 'danger');
    }
  };

  // 3. Edit Transaction
  const handleUpdateTransaction = async (id, payload) => {
    try {
      const res = await api.updateTransaction(id, payload);
      if (res.success) {
        showToast('거래 내역이 성공적으로 수정되었습니다.', 'success');
        setEditingTransaction(null);
        await loadData();
      }
    } catch (err) {
      showToast('거래 수정 실패: ' + err.message, 'danger');
    }
  };

  // 4. Delete Transaction
  const handleDeleteTransaction = async (id) => {
    try {
      const res = await api.deleteTransaction(id);
      if (res.success) {
        showToast('거래 내역이 성공적으로 삭제되었습니다.', 'info');
        await loadData();
      }
    } catch (err) {
      showToast('거래 삭제 실패: ' + err.message, 'danger');
    }
  };

  // 5. Update Budget
  const handleUpdateBudget = async (id, newAmount) => {
    try {
      const res = await api.updateBudget(id, { monthly_budget: newAmount });
      if (res.success) {
        showToast('목표 예산이 성공적으로 변경되었습니다.', 'success');
        setEditingBudget(null);
        await loadData();
      }
    } catch (err) {
      showToast('예산 수정 실패: ' + err.message, 'danger');
    }
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <Header
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onResetData={handleResetData}
      />

      {/* KPI Summary Cards */}
      <SummaryCards stats={stats} accounts={accounts} />

      {/* 2 Columns: Chart & Budgets / Accounts */}
      <div className="dashboard-columns">
        <CategoryChart distribution={stats?.category_distribution || []} />
        <AccountStatus accounts={accounts} />
      </div>

      {/* Budget Progress Tracker */}
      <BudgetProgress
        budgets={budgets}
        transactions={transactions}
        onEditBudget={(b) => setEditingBudget(b)}
      />

      {/* Detailed Transaction Table */}
      <TransactionTable
        transactions={transactions}
        categories={categories}
        onEditTransaction={(item) => setEditingTransaction(item)}
        onDeleteTransaction={handleDeleteTransaction}
      />

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        categories={categories}
        accounts={accounts}
        onSubmit={handleAddTransaction}
      />

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          categories={categories}
          accounts={accounts}
          onClose={() => setEditingTransaction(null)}
          onSubmit={handleUpdateTransaction}
        />
      )}

      {/* Edit Budget Modal */}
      {editingBudget && (
        <EditBudgetModal
          budget={editingBudget}
          onClose={() => setEditingBudget(null)}
          onSubmit={handleUpdateBudget}
        />
      )}

      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.type === 'success' && <CheckCircle2 size={16} color="var(--mint-500)" />}
            {t.type === 'info' && <Info size={16} color="var(--neutral-blue)" />}
            {t.type === 'danger' && <AlertCircle size={16} color="#EF4444" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
