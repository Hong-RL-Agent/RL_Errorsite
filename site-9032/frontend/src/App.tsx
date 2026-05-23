import Dashboard from './components/NetworkDashboard'

function App() {
  return (
    /** * 🚀 min-h-screen: 화면 높이를 100% 채워 배경색이 끊기지 않게 함
     * 🚀 bg-[#0b0e14]: 9030 시리즈 공통 다크 테마 적용
     * 🚀 flex flex-col items-center: 대시보드가 수평 중앙에 오도록 서포트
     */
    <div className="min-h-screen w-full bg-[#0b0e14] flex flex-col items-center">
      <Dashboard />
    </div>
  )
}

export default App