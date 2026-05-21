const userProfile = {
  name: '김피트',
  level: '중급',
  caloriesBurned: 3200,
  workoutsCompleted: 15
}

const weeklyStats = [
  { day: '월', calories: 450, duration: 45 },
  { day: '화', calories: 600, duration: 60 },
  { day: '수', calories: 300, duration: 30 },
  { day: '목', calories: 550, duration: 50 },
  { day: '금', calories: 400, duration: 40 },
  { day: '토', calories: 800, duration: 90 },
  { day: '일', calories: 0, duration: 0 }
]

const routines = [
  { id: 1, name: '스쿼트 4세트', category: '하체', completed: true },
  { id: 2, name: '벤치 프레스 4세트', category: '가슴', completed: false },
  { id: 3, name: '풀업 3세트', category: '등', completed: false },
  { id: 4, name: '플랭크 3분', category: '코어', completed: false },
  { id: 5, name: '트레드밀 30분', category: '유산소', completed: true }
]

function json(data) {
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } })
}

export function installMockApi() {
  const originalFetch = window.fetch.bind(window)

  window.fetch = (input, init) => {
    const url = typeof input === 'string' ? input : input?.url
    const parsed = new URL(url, window.location.href)

    if (!parsed.pathname.startsWith('/api/')) {
      return originalFetch(input, init)
    }

    if (parsed.pathname === '/api/user') {
      return Promise.resolve(json({ success: true, data: userProfile }))
    }

    if (parsed.pathname === '/api/stats/weekly') {
      return Promise.resolve(json({ success: true, data: weeklyStats }))
    }

    if (parsed.pathname === '/api/routines') {
      const category = parsed.searchParams.get('category')
      let filtered = routines
      if (category && category !== '전체') filtered = filtered.filter(routine => routine.category === category)
      return Promise.resolve(json({ success: true, data: filtered }))
    }

    return Promise.resolve(json({ success: false, data: null }))
  }
}
