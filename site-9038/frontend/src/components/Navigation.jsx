import React from 'react'
import { BarChart3, TrendingUp, Zap } from 'lucide-react'

function Navigation({ currentPage, setCurrentPage, userName }) {
  const navItems = [
    { id: 'dashboard', label: '대시보드', icon: BarChart3 },
    { id: 'charts', label: '차트', icon: TrendingUp },
    { id: 'trading', label: '거래', icon: Zap }
  ]

  return (
    <nav className="sticky top-0 z-50 glass-effect border-b border-accent-cyan/20">
      <div className="container-main">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-accent-cyan to-accent-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FA</span>
            </div>
            <h1 className="text-xl font-bold text-accent-cyan">Fuzzing Agent Platform</h1>
          </div>

          <div className="flex items-center gap-8">
            {navItems.map(item => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    currentPage === item.id
                      ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan'
                      : 'text-gray-400 hover:text-accent-cyan hover:bg-accent-cyan/10'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-blue/10 border border-accent-blue/30">
            <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse"></div>
            <span className="text-sm text-accent-blue">{userName}</span>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
