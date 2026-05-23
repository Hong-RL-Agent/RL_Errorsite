import { useState, useEffect } from 'react'
import Navigation from './components/Navigation'
import Dashboard from './pages/Dashboard'
import Trading from './pages/Trading'
import ChartPage from './pages/ChartPage'
import { buildApiUrl } from './lib/api'

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [userId, setUserId] = useState(null)
  const [userName, setUserName] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    initializeUser()
  }, [])

  const initializeUser = async () => {
    setLoading(true)
    try {
      // 테스트용 사용자 생성
      const response = await fetch(buildApiUrl('/users/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'trader_' + Math.random().toString(36).substr(2, 9),
          email: 'trader@example.com',
          nickname: 'Test Trader'
        })
      })
      const data = await response.json()
      if (data.success) {
        setUserId(data.user.id)
        setUserName(data.user.nickname)
      }
    } catch (error) {
      console.error('Failed to initialize user:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderPage = () => {
    if (loading || !userId) {
      return <div className="flex items-center justify-center h-screen text-accent-cyan">Loading...</div>
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard userId={userId} />
      case 'trading':
        return <Trading userId={userId} />
      case 'charts':
        return <ChartPage userId={userId} />
      default:
        return <Dashboard userId={userId} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      {userId && (
        <Navigation 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage}
          userName={userName}
        />
      )}
      <main className="container-main py-8">
        {renderPage()}
      </main>
    </div>
  )
}

export default App
