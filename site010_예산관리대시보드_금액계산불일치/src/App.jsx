import React, { useState, useEffect } from 'react';

export default function App() {
  // Core transaction ledger database
  const [transactions, setTransactions] = useState([]);
  const [categoryTotals, setCategoryTotals] = useState({});
  const [budgetLimit, setBudgetLimit] = useState(500000);

  // Computed Totals inside react state (Error 1 targets)
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  // Filters state
  const [selectedMonth, setSelectedMonth] = useState('06월');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('전체');

  // Inline Registration Form inputs
  const [regDate, setRegDate] = useState('2026-06-23');
  const [regCategory, setRegCategory] = useState('식비');
  const [regType, setRegType] = useState('지출');
  const [regAmount, setRegAmount] = useState('');
  const [regMemo, setRegMemo] = useState('');

  // Inline editing state
  const [editingTxId, setEditingTxId] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editType, setEditType] = useState('지출');
  const [editAmount, setEditAmount] = useState('');
  const [editMemo, setEditMemo] = useState('');

  // UI state
  const [toasts, setToasts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadTransactions();
    loadCategoryTotals();
    loadBudget();
  }, []);

  const loadTransactions = async () => {
    try {
      const res = await fetch('/api/transactions');
      const data = await res.json();
      setTransactions(data);
      calculateTotalSums(data);
    } catch (err) {
      showToast('거래 목록 로딩 실패', 'danger');
    }
  };

  const loadCategoryTotals = async () => {
    try {
      const res = await fetch('/api/stats/categories');
      const data = await res.json();
      setCategoryTotals(data);
    } catch (err) {
      showToast('통계 합계 수집 실패', 'danger');
    }
  };

  const loadBudget = async () => {
    try {
      const res = await fetch('/api/budget');
      const data = await res.json();
      setBudgetLimit(data.limit);
    } catch (err) {
      showToast('예산 제한 로딩 실패', 'danger');
    }
  };

  const calculateTotalSums = (txsList) => {
    let inc = 0;
    let exp = 0;
    txsList.forEach(t => {
      if (t.type === '수입') {
        inc += t.amount;
      } else {
        exp += t.amount;
      }
    });
    setTotalIncome(inc);
    setTotalExpense(exp);
  };

  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    if (!regAmount || isNaN(regAmount) || Number(regAmount) <= 0) {
      showToast('올바른 거래 금액을 지정하십시오.', 'warning');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      date: regDate,
      category: regCategory,
      type: regType,
      amount: Number(regAmount),
      memo: regMemo
    };

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '거래 생성 실패');
      }

      showToast('새로운 가계 기록이 반영되었습니다.', 'success');
      setRegAmount('');
      setRegMemo('');
      
      // Reload lists
      const updatedTxs = [data, ...transactions];
      setTransactions(updatedTxs);
      calculateTotalSums(updatedTxs);
      loadCategoryTotals();
    } catch (err) {
      showToast(`[에러] ${err.message}`, 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startInlineEdit = (tx) => {
    setEditingTxId(tx.id);
    setEditDate(tx.date);
    setEditCategory(tx.category);
    setEditType(tx.type);
    setEditAmount(tx.amount.toString());
    setEditMemo(tx.memo);
  };

  // Error 1: Amount Edited then Category Changed -> sum stale
  const saveInlineEdit = async (id) => {
    if (!editAmount || isNaN(editAmount) || Number(editAmount) <= 0) {
      showToast('올바른 금액 수치를 입력하세요.', 'warning');
      return;
    }

    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: editDate,
          category: editCategory,
          type: editType,
          amount: Number(editAmount),
          memo: editMemo
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '수정 불가');
      }

      // Update state list
      const updatedList = transactions.map(t => t.id === id ? data : t);
      setTransactions(updatedList);
      setEditingTxId(null);
      showToast('거래 상세 내역이 변경되었습니다.', 'success');

      // INTENTIONAL_ERROR
      // CATEGORY: Frontend
      // DESCRIPTION: 사용자가 기존 거래를 수정한 후, 금액(amount)과 카테고리(category)를 동시에 변경했거나 
      // 금액을 바꾸고 곧바로 카테고리를 변경하는 흐름이 감지되면, 거래 리스트 뷰에는 변경된 금액이 올바르게 출력되지만 
      // 전체 대시보드 지출/수입 합산 함수(calculateTotalSums) 호출 시 수정 전의 이전 상태 어레이(transactions)를 
      // 그대로 입력하여 전체 총량 합산에 수정 금액이 누락되는 상태 비동기 버그를 유발합니다.
      const originalTx = transactions.find(t => t.id === id);
      const isCategoryChanged = originalTx && originalTx.category !== editCategory;
      if (isCategoryChanged) {
        calculateTotalSums(transactions); // Stale list used!
        showToast('카테고리 수정 감지: 합계 집계율은 기존 수정 전 단가 기준으로 누설 유지됩니다.', 'warning');
      } else {
        calculateTotalSums(updatedList); // Fresh list used
      }

      loadCategoryTotals();
    } catch (err) {
      showToast(`수정 실패: ${err.message}`, 'danger');
    }
  };

  const deleteTransaction = async (id) => {
    if (!confirm('해당 가계부 기록을 영구 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast('내역에서 삭제되었습니다. (DB 캐시에는 유지)', 'success');
        
        // Remove from list
        const updatedList = transactions.filter(t => t.id !== id);
        setTransactions(updatedList);
        calculateTotalSums(updatedList);
        // Note: we do not call loadCategoryTotals() here so the UI category bar doesn't refresh automatically,
        // but even if we do, the server has Error 3, so statistics won't update either!
        loadCategoryTotals(); 
      }
    } catch (err) {
      showToast('삭제 요청 통신 실패', 'danger');
    }
  };

  // Error 4 Exchange rate (404)
  const applyExchangeRate = async () => {
    // INTENTIONAL_ERROR
    // CATEGORY: Network
    // DESCRIPTION: '이번 달 환율 반영' 버튼 클릭 시 서버에 구현되지 않은 주소인 
    // '/api/exchange/latest-rate'로 네트워크 전송을 지시하여 브라우저에서 404 HTTP API 에러가 나도록 만듭니다.
    try {
      const res = await fetch('/api/exchange/latest-rate');
      if (!res.ok) {
        throw new Error(`HTTP 에러 코드: ${res.status}`);
      }
      showToast('환율 업데이트가 대시보드에 적용되었습니다.', 'success');
    } catch (err) {
      showToast(`환율 갱신 실패: ${err.message}`, 'danger');
    }
  };

  // Error 5 CSV path lock
  const exportCSVFile = async () => {
    try {
      const res = await fetch('/api/export/csv', {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error);
      }
      showToast(`CSV 다운로드 성공: 로컬 파일 '${data.path}' 저장됨`, 'success');
    } catch (err) {
      showToast(`[인프라 권한 장애] CSV 저장실패: ${err.message}`, 'danger');
    }
  };

  const changeBudgetLimit = async (newLimit) => {
    try {
      const res = await fetch('/api/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: newLimit })
      });
      if (res.ok) {
        setBudgetLimit(newLimit);
        showToast('이번 달 지출 한도 설정이 변경되었습니다.', 'success');
      }
    } catch (err) {
      showToast('예산 제한 설정 전송 중 에러', 'danger');
    }
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Filtering transactions
  const filteredTransactions = transactions.filter(t => {
    const matchCategory = selectedCategoryFilter === '전체' || t.category === selectedCategoryFilter;
    // Monthly checking: simplified check
    const matchMonth = t.date.includes(`-06-`) && selectedMonth === '06월' || 
                       t.date.includes(`-07-`) && selectedMonth === '07월' ||
                       !t.date.includes('-06-') && !t.date.includes('-07-') && selectedMonth === '06월';
    return matchCategory && matchMonth;
  });

  const getBudgetUsagePercent = () => {
    if (budgetLimit <= 0) return 0;
    return Math.min(100, Math.round((totalExpense / budgetLimit) * 100));
  };

  return (
    <div className="budgetcanvas-app">
      {/* App Navbar */}
      <header className="app-navbar">
        <div className="navbar-logo">
          <svg className="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span className="logo-title">BudgetCanvas</span>
          <span className="logo-subtitle">퍼스널 가계부 &amp; 예산 원형 캔버스</span>
        </div>
        <div className="navbar-actions">
          <button className="rate-btn" onClick={applyExchangeRate}>
            💵 이번 달 환율 반영 (404 유발)
          </button>
          <button className="csv-btn" onClick={exportCSVFile}>
            📥 CSV 파일 내보내기 (C:\ 경로 강제)
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="canvas-grid-layout">
        
        {/* Left Side: Month & Category Menu */}
        <aside className="panel-section column-menu">
          <div className="panel-header">
            <h2>📅 월별 레저 조회</h2>
          </div>
          <div className="month-selector-buttons">
            {['06월', '07월'].map(m => (
              <button 
                key={m} 
                className={selectedMonth === m ? 'active' : ''}
                onClick={() => setSelectedMonth(m)}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="category-filter-section">
            <h3>🏷️ 카테고리 필터</h3>
            <div className="cat-buttons-list">
              {['전체', '식비', '교통비', '문화생활', '급여', '기타'].map(cat => (
                <button 
                  key={cat} 
                  className={selectedCategoryFilter === cat ? 'active' : ''}
                  onClick={() => setSelectedCategoryFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="budget-settings-box">
            <h3>⚙️ 지출 한도 설정</h3>
            <div className="limit-inputs">
              <input 
                type="number" 
                value={budgetLimit} 
                onChange={(e) => changeBudgetLimit(Number(e.target.value))} 
                step="50000"
              />
              <span className="unit-lbl">원</span>
            </div>
          </div>
        </aside>

        {/* Center: Budget Flow Chart (Dynamic SVG image error target) */}
        <main className="panel-section column-chart">
          <div className="panel-header chart-header-row">
            <h2>📊 실시간 수입/지출 흐름 통계</h2>
            <p className="subtitle">아래 차트는 서버에서 Content-Type이 오설정되어 렌더링에 지장이 가는 SVG 통계 데이터입니다.</p>
          </div>

          {/* SVG response renderer */}
          <div className="chart-render-workspace">
            <div className="error-svg-container">
              {/* Load server SVG directly which has application/json contentType error (Error 6) */}
              <img 
                src="/api/stats/chart.svg" 
                alt="수입 지출 통계 차트 (SVG MIME Type Error)" 
                className="broken-svg-image"
                onError={(e) => {
                  // Fallback warning text in UI
                  e.target.style.display = 'none';
                  const p = document.getElementById('svg-err-msg');
                  if (p) p.style.display = 'block';
                }}
              />
              <div id="svg-err-msg" className="svg-error-msg-box" style={{ display: 'none' }}>
                <div className="broken-box-icon">⚠️</div>
                <h4>차트 이미지 로드 실패</h4>
                <p>서버가 SVG 이미지의 Content-Type 헤더를 <code>application/json</code>으로 전송하여 브라우저에서 차트를 출력할 수 없습니다. (MIME 유형 미스매치)</p>
                <p className="debug-btn-row">
                  <a href="/api/stats/chart.svg" target="_blank" rel="noreferrer" className="raw-link-btn">SVG 원본 코드 확인하기</a>
                </p>
              </div>
            </div>
          </div>

          {/* Inline Transaction Registration Panel */}
          <section className="inline-entry-panel">
            <h3>📝 새로운 거래 내역 기입 (인라인 패널)</h3>
            <form onSubmit={handleCreateTransaction} className="inline-form-row">
              <div className="form-cell">
                <label>날짜</label>
                <input type="date" value={regDate} onChange={(e) => setRegDate(e.target.value)} />
              </div>
              <div className="form-cell">
                <label>구분</label>
                <select value={regType} onChange={(e) => {
                  setRegType(e.target.value);
                  if (e.target.value === '수입') setRegCategory('급여');
                  else setRegCategory('식비');
                }}>
                  <option value="지출">지출 (-)</option>
                  <option value="수입">수입 (+)</option>
                </select>
              </div>
              <div className="form-cell">
                <label>분류</label>
                <select value={regCategory} onChange={(e) => setRegCategory(e.target.value)}>
                  {regType === '수입' ? (
                    <option value="급여">급여</option>
                  ) : (
                    <>
                      <option value="식비">식비</option>
                      <option value="교통비">교통비</option>
                      <option value="문화생활">문화생활</option>
                    </>
                  )}
                  <option value="기타">기타</option>
                </select>
              </div>
              <div className="form-cell amount-cell">
                <label>금액 (₩)</label>
                <input 
                  type="number" 
                  placeholder="단가 입력" 
                  value={regAmount} 
                  onChange={(e) => setRegAmount(e.target.value)} 
                />
              </div>
              <div className="form-cell memo-cell">
                <label>적요 (메모)</label>
                <input 
                  type="text" 
                  placeholder="적요 작성 (정확히 50자 입력 시 서버 500 에러)" 
                  value={regMemo} 
                  onChange={(e) => setRegMemo(e.target.value)} 
                />
              </div>
              <button type="submit" className="add-record-btn" disabled={isSubmitting}>
                {isSubmitting ? '...' : '장부 등록'}
              </button>
            </form>
          </section>
        </main>

        {/* Right Side: Recent Transactions & Inline Edit */}
        <aside className="panel-section column-transactions">
          <div className="panel-header">
            <h2>📜 이번 달 장부 거래 목록 ({filteredTransactions.length})</h2>
          </div>

          <div className="dashboard-financial-summary">
            <div className="summary-lbl">
              <span>수입 합계:</span>
              <strong className="text-emerald">₩{totalIncome.toLocaleString()}</strong>
            </div>
            <div className="summary-lbl">
              <span>지출 합계:</span>
              <strong className="text-rose">₩{totalExpense.toLocaleString()}</strong>
            </div>
          </div>

          <div className="transactions-vertical-scroll">
            {filteredTransactions.length === 0 ? (
              <div className="empty-placeholder">해당 필터에 부합하는 거래 내역이 존재하지 않습니다.</div>
            ) : (
              filteredTransactions.map(tx => {
                const isEditing = editingTxId === tx.id;
                return (
                  <div key={tx.id} className={`tx-item-card ${tx.type === '수입' ? 'inc' : 'exp'}`}>
                    {isEditing ? (
                      /* Inline Editor mode */
                      <div className="tx-inline-editor-form">
                        <div className="edit-row-inputs">
                          <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="small-input"/>
                          <select value={editType} onChange={(e) => setEditType(e.target.value)} className="small-input">
                            <option value="지출">지출</option>
                            <option value="수입">수입</option>
                          </select>
                          <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="small-input">
                            <option value="식비">식비</option>
                            <option value="교통비">교통비</option>
                            <option value="문화생활">문화생활</option>
                            <option value="급여">급여</option>
                            <option value="기타">기타</option>
                          </select>
                        </div>
                        <input 
                          type="number" 
                          value={editAmount} 
                          onChange={(e) => setEditAmount(e.target.value)} 
                          className="large-input"
                          placeholder="수정 금액"
                        />
                        <input 
                          type="text" 
                          value={editMemo} 
                          onChange={(e) => setEditMemo(e.target.value)} 
                          className="large-input"
                          placeholder="메모 작성 (50자 예외)"
                        />
                        <div className="editor-control-buttons">
                          <button className="save-edit-btn" onClick={() => saveInlineEdit(tx.id)}>저장</button>
                          <button className="cancel-edit-btn" onClick={() => setEditingTxId(null)}>취소</button>
                        </div>
                      </div>
                    ) : (
                      /* Standard View mode */
                      <>
                        <div className="tx-top-line">
                          <span className="tx-date-lbl">{tx.date.slice(5)}</span>
                          <span className="tx-cat-badge">{tx.category}</span>
                          <div className="tx-action-buttons">
                            <button className="action-edit" onClick={() => startInlineEdit(tx)}>✏️</button>
                            <button className="action-del" onClick={() => deleteTransaction(tx.id)}>&times;</button>
                          </div>
                        </div>
                        <div className="tx-middle-line">
                          <span className="tx-memo-text">{tx.memo || '(적요 없음)'}</span>
                          <strong className="tx-amount-text">
                            {tx.type === '수입' ? '+' : '-'} ₩{tx.amount.toLocaleString()}
                          </strong>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </aside>
      </div>

      {/* Bottom: Budget Usage bar */}
      <footer className="panel-section footer-budget-status">
        <div className="budget-bar-header">
          <h3>📊 이번 달 예산 소진 사용률</h3>
          <div className="budget-numeric-labels">
            <span>사용 금액: <strong>₩{totalExpense.toLocaleString()}</strong></span>
            <span className="divider-bar">/</span>
            <span>한도 예산: <strong>₩{budgetLimit.toLocaleString()}</strong></span>
            <span className="percent-label">({getBudgetUsagePercent()}%)</span>
          </div>
        </div>

        <div className="progress-bar-track">
          <div 
            className={`progress-fill ${getBudgetUsagePercent() >= 90 ? 'warning-fill' : ''}`}
            style={{ width: `${getBudgetUsagePercent()}%` }}
          ></div>
        </div>
      </footer>

      {/* Toast popup notifications */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-card ${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}
            </span>
            <span className="toast-message">{t.message}</span>
            <button className="toast-close" onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>&times;</button>
          </div>
        ))}
      </div>
    </div>
  );
}
