import React, { useState, useEffect } from 'react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar } from 'recharts'

function ChartPage({ userId }) {
  const [priceData, setPriceData] = useState([])
  const [volumeData, setVolumeData] = useState([])

  useEffect(() => {
    generateMockData()
    const interval = setInterval(generateMockData, 1000)
    return () => clearInterval(interval)
  }, [])

  const generateMockData = () => {
    const now = new Date()
    const newData = []
    for (let i = 30; i > 0; i--) {
      const time = new Date(now.getTime() - i * 1000)
      newData.push({
        time: time.toLocaleTimeString('ko-KR'),
        price: 45000 + Math.random() * 5000 - 2500,
        open: 45000 + Math.random() * 4000 - 2000,
        high: 46000 + Math.random() * 3000,
        low: 44000 + Math.random() * 3000,
        volume: Math.floor(Math.random() * 1000000)
      })
    }
    setPriceData(newData)
    setVolumeData(newData)
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-800 border border-accent-cyan/50 rounded p-3 text-sm">
          <p className="text-accent-cyan font-bold">${payload[0].value.toFixed(2)}</p>
          <p className="text-gray-400 text-xs">시간: {payload[0].payload.time}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-accent-cyan mb-8">실시간 가격 차트</h1>

      {/* 캔들 차트 */}
      <div className="chart-wrapper">
        <h2 className="text-lg font-bold text-accent-blue mb-4">실시간 가격 (Line Chart)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={priceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 거래량 차트 */}
      <div className="chart-wrapper">
        <h2 className="text-lg font-bold text-accent-green mb-4">거래량 (Volume)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={volumeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="volume" fill="#10b981" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 면적 차트 */}
      <div className="chart-wrapper">
        <h2 className="text-lg font-bold text-accent-blue mb-4">누적 자산 (Area)</h2>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={priceData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="price" stroke="#06b6d4" fillOpacity={1} fill="url(#colorPrice)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default ChartPage
