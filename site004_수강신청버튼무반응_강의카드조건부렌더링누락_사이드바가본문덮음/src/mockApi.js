const categories = ['전체', '프로그래밍', '디자인', '마케팅', '비즈니스']

const courses = [
  { id: 101, title: '리액트 기초부터 실전까지', instructor: '김코딩', category: '프로그래밍', price: 55000, students: 1200, rating: 4.8, progress: 0, status: 'available' },
  { id: 102, title: 'UX/UI 디자인 마스터 클래스', instructor: '이디자인', category: '디자인', price: 78000, students: 850, rating: 4.9, progress: 45, status: 'in-progress' },
  { id: 103, title: '데이터 기반 디지털 마케팅', instructor: '박마켓', category: '마케팅', price: 62000, students: 430, rating: 4.6, progress: 100, status: 'completed' },
  { id: 104, title: 'Node.js 백엔드 완벽 가이드', instructor: '최서버', category: '프로그래밍', price: 89000, students: 2100, rating: 4.7, progress: 12, status: 'in-progress' },
  { id: 105, title: '스타트업 비즈니스 전략', instructor: '정대표', category: '비즈니스', price: 45000, students: 620, rating: 4.5, progress: 0, status: 'available' },
  { id: 106, title: '파이썬 데이터 분석 입문', instructor: '한데이터', category: '프로그래밍', price: 50000, students: 3100, rating: 4.8, progress: 100, status: 'completed' }
]

const announcements = [
  { id: 1, title: '[공지] 5월 수강할인 이벤트 안내', date: '2026-05-01' },
  { id: 2, title: '[업데이트] 모바일 앱 버전 출시', date: '2026-04-28' },
  { id: 3, title: '[안내] 시스템 점검 사전 안내', date: '2026-04-25' }
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

    if (parsed.pathname === '/api/categories') {
      return Promise.resolve(json({ success: true, data: categories }))
    }

    if (parsed.pathname === '/api/announcements') {
      return Promise.resolve(json({ success: true, data: announcements }))
    }

    if (parsed.pathname === '/api/courses') {
      const category = parsed.searchParams.get('category')
      const search = parsed.searchParams.get('search')
      const filter = parsed.searchParams.get('filter')
      let filtered = courses

      if (category && category !== '전체') filtered = filtered.filter(course => course.category === category)
      if (search) filtered = filtered.filter(course => course.title.includes(search) || course.instructor.includes(search))
      if (filter === 'in-progress') filtered = filtered.filter(course => course.progress > 0 && course.progress < 100)
      if (filter === 'completed') filtered = filtered.filter(course => course.progress === 100)

      return Promise.resolve(json({ success: true, data: filtered }))
    }

    return Promise.resolve(json({ success: false, data: null }))
  }
}
