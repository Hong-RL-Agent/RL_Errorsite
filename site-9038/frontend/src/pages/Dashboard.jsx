import React, { useState, useEffect } from 'react'
import { DollarSign, Coins, TrendingUp, Activity } from 'lucide-react'
import { buildApiUrl } from '../lib/api'

function Dashboard({ userId }) {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboard()
    const interval = setInterval(fetchDashboard, 2000)
    return () => clearInterval(interval)
  }, [userId])

  const fetchDashboard = async () => {
    try {
      const response = await fetch(buildApiUrl(`/trading/dashboard/${userId}`))
      const data = await response.json()
      if (data.success) {
        setDashboard(data.data)
        setError(null)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center text-accent-cyan">Loading...</div>

  return (
    <div className="space-y-8">
      {/* 자산 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboard?.account && (
          <>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">현재 잔액</p>
                  <p className="text-2xl font-bold text-accent-green mt-2">
                    ${dashboard.account.balance?.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="text-accent-green opacity-30" size={40} />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">포인트</p>
                  <p className="text-2xl font-bold text-accent-blue mt-2">
                    {dashboard.account.points?.toFixed(0)}
                  </p>
                </div>
                <Coins className="text-accent-blue opacity-30" size={40} />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">총 자산</p>
                  <p className="text-2xl font-bold text-accent-cyan mt-2">
                    ${dashboard.assetValue?.toFixed(2)}
                  </p>
                </div>
                <TrendingUp className="text-accent-cyan opacity-30" size={40} />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">거래 건수</p>
                  <p className="text-2xl font-bold text-accent-cyan mt-2">
                    {dashboard.transactions?.length || 0}
                  </p>
                </div>
                <Activity className="text-accent-cyan opacity-30" size={40} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* 거래 이력 */}
      <div className="card">
        <h2 className="text-xl font-bold text-accent-cyan mb-4">최근 거래</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-accent-cyan/20">
                <th className="text-left py-2 text-gray-400">거래 타입</th>
                <th className="text-left py-2 text-gray-400">금액</th>
                <th className="text-left py-2 text-gray-400">상태</th>
                <th className="text-left py-2 text-gray-400">시간</th>
              </tr>
            </thead>
            <tbody>
              {dashboard?.transactions?.slice(0, 5).map((tx, idx) => (
                <tr key={idx} className="border-b border-accent-cyan/10 hover:bg-accent-cyan/5">
                  <td className="py-3 text-accent-blue">{tx.type}</td>
                  <td className={`py-3 font-bold ${tx.type === 'WITHDRAW' ? 'text-accent-red' : 'text-accent-green'}`}>
                    {tx.type === 'WITHDRAW' ? '-' : '+'}{tx.amount}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      tx.status === 'SUCCESS' ? 'bg-accent-green/20 text-accent-green' : 'bg-accent-red/20 text-accent-red'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500">{new Date(tx.createdAt).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {error && (
        <div className="card bg-accent-red/10 border-accent-red/50">
          <p className="text-accent-red">Error: {error}</p>
        </div>
      )}
    </div>
  )
}

export default Dashboard
