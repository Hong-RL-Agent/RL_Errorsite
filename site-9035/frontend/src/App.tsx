import AuthDashboard from './components/AuthDashboard'

function App() {
  return (
    /** 
     * 🚀 min-h-screen: 화면 높이 전체 사용
     * 🚀 justify-center items-start: 중앙 정렬 및 상단부터 배치
     */
    <div className="min-h-screen w-full bg-[#0b0e14] flex justify-center items-start overflow-x-hidden">
      <AuthDashboard />
    </div>
  )
}

export default App