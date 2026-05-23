import React, { useState, useRef } from 'react'
import { AlertCircle, Send } from 'lucide-react'
import { buildApiUrl } from '../lib/api'

function Trading({ userId }) {
  const [activeTab, setActiveTab] = useState('withdraw')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  // Withdraw form
  const withdrawAmountRef = useRef('')
  // Deposit form
  const depositAmountRef = useRef('')
  // Buy item form
  const itemNameRef = useRef('')
  const quantityRef = useRef('')
  const pointCostRef = useRef('')

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmountRef.current.value)
    if (!amount || amount <= 0) {
      setError('Valid amount required')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(buildApiUrl('/trading/withdraw'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount })
      })
      const data = await response.json()
      if (data.success) {
        setResult(data.data)
        withdrawAmountRef.current.value = ''
      } else {
        setError(data.data.message)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmountRef.current.value)
    if (!amount || amount <= 0) {
      setError('Valid amount required')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(buildApiUrl('/trading/deposit'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount })
      })
      const data = await response.json()
      if (data.success) {
        setResult(data.data)
        depositAmountRef.current.value = ''
      } else {
        setError(data.data.message)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBuyItem = async () => {
    const itemName = itemNameRef.current.value
    const quantity = parseInt(quantityRef.current.value)
    const pointCost = parseFloat(pointCostRef.current.value)

    if (!itemName || !quantity || !pointCost) {
      setError('All fields required')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(buildApiUrl('/trading/buy-item'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, itemName, quantity, pointCost })
      })
      const data = await response.json()
      if (data.success) {
        setResult(data.data)
        itemNameRef.current.value = ''
        quantityRef.current.value = ''
        pointCostRef.current.value = ''
      } else {
        setError(data.data.message)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-accent-cyan mb-8">거래 시스템</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 거래 폼 */}
        <div className="space-y-6">
          {/* 탭 */}
          <div className="flex gap-2 border-b border-accent-cyan/20">
            {['withdraw', 'deposit', 'buy-item'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-semibold border-b-2 transition-all ${
                  activeTab === tab
                    ? 'text-accent-cyan border-accent-cyan'
                    : 'text-gray-400 border-transparent hover:text-accent-cyan'
                }`}
              >
                {tab === 'withdraw' && '출금'}
                {tab === 'deposit' && '입금'}
                {tab === 'buy-item' && '아이템 구매'}
              </button>
            ))}
          </div>

          {/* Withdraw Tab */}
          {activeTab === 'withdraw' && (
            <div className="card space-y-4">
              <h3 className="text-lg font-bold text-accent-green">출금하기</h3>
              <div>
                <label className="block text-sm text-gray-400 mb-2">출금 금액 (USD)</label>
                <input
                  ref={withdrawAmountRef}
                  type="number"
                  placeholder="100"
                  className="w-full px-4 py-2 bg-dark-700 border border-accent-cyan/30 rounded text-white placeholder-gray-600 focus:outline-none focus:border-accent-cyan"
                />
              </div>
              <button
                onClick={handleWithdraw}
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50"
              >
                {loading ? '처리 중...' : '출금'}
              </button>
            </div>
          )}

          {/* Deposit Tab */}
          {activeTab === 'deposit' && (
            <div className="card space-y-4">
              <h3 className="text-lg font-bold text-accent-green">입금하기</h3>
              <div>
                <label className="block text-sm text-gray-400 mb-2">입금 금액 (USD)</label>
                <input
                  ref={depositAmountRef}
                  type="number"
                  placeholder="500"
                  className="w-full px-4 py-2 bg-dark-700 border border-accent-cyan/30 rounded text-white placeholder-gray-600 focus:outline-none focus:border-accent-cyan"
                />
              </div>
              <button
                onClick={handleDeposit}
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50"
              >
                {loading ? '처리 중...' : '입금'}
              </button>
            </div>
          )}

          {/* Buy Item Tab */}
          {activeTab === 'buy-item' && (
            <div className="card space-y-4">
              <h3 className="text-lg font-bold text-accent-blue">아이템 구매</h3>
              <div>
                <label className="block text-sm text-gray-400 mb-2">아이템 이름</label>
                <input
                  ref={itemNameRef}
                  type="text"
                  placeholder="Gold Coin"
                  className="w-full px-4 py-2 bg-dark-700 border border-accent-cyan/30 rounded text-white placeholder-gray-600 focus:outline-none focus:border-accent-cyan"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">수량</label>
                <input
                  ref={quantityRef}
                  type="number"
                  placeholder="10"
                  className="w-full px-4 py-2 bg-dark-700 border border-accent-cyan/30 rounded text-white placeholder-gray-600 focus:outline-none focus:border-accent-cyan"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">포인트 비용</label>
                <input
                  ref={pointCostRef}
                  type="number"
                  placeholder="100"
                  className="w-full px-4 py-2 bg-dark-700 border border-accent-cyan/30 rounded text-white placeholder-gray-600 focus:outline-none focus:border-accent-cyan"
                />
              </div>
              <button
                onClick={handleBuyItem}
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50"
              >
                {loading ? '처리 중...' : '구매'}
              </button>
            </div>
          )}
        </div>

        {/* 결과/상태 */}
        <div className="space-y-4">
          {result && (
            <div className="card bg-accent-green/10 border border-accent-green/50">
              <h4 className="text-sm font-bold text-accent-green mb-2">✓ 거래 성공</h4>
              <pre className="text-xs text-green-300 overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          {error && (
            <div className="card bg-accent-red/10 border border-accent-red/50">
              <div className="flex gap-2">
                <AlertCircle size={20} className="text-accent-red flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-accent-red mb-2">오류</h4>
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          {!result && !error && (
            <div className="card">
              <p className="text-gray-400 text-sm">거래 결과가 여기에 표시됩니다...</p>
            </div>
          )}

          {/* 테스트 버튼 */}
          <div className="card bg-accent-cyan/5 border border-accent-cyan/30 space-y-3">
            <h4 className="text-sm font-bold text-accent-cyan">결함 테스트</h4>
            <p className="text-xs text-gray-400">다중 출금 요청을 빠르게 보내 Race Condition을 테스트하세요.</p>
            <button
              onClick={() => {
                for (let i = 0; i < 5; i++) {
                  setTimeout(() => handleWithdraw(), i * 100)
                }
              }}
              disabled={loading}
              className="w-full px-4 py-2 bg-accent-cyan hover:bg-accent-cyan/80 text-dark-900 rounded font-semibold transition-colors disabled:opacity-50"
            >
              Race Condition 테스트 (출금 x5)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Trading
