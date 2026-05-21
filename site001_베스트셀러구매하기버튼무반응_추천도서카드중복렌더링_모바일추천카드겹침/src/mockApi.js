const genres = ['전체', '소설', '에세이', '컴퓨터/IT', '경제/경영', '역사', '자기계발', '과학']

const bestsellers = [
  { id: 1, title: '달빛 서재', author: '이수아', genre: '소설', price: 15800, rating: 4.8, reviews: 2341, badge: '1위', colorIdx: 0, description: '작은 서재에서 시작된 특별한 이야기.' },
  { id: 2, title: '파이썬으로 배우는 AI', author: '김현준', genre: '컴퓨터/IT', price: 28000, rating: 4.6, reviews: 1872, badge: '2위', colorIdx: 1, description: '실무 중심의 파이썬 AI 입문서.' },
  { id: 3, title: '마음의 정원', author: '박지현', genre: '에세이', price: 13500, rating: 4.9, reviews: 3109, badge: '3위', colorIdx: 2, description: '지친 일상에 쉼을 주는 따뜻한 에세이.' },
  { id: 4, title: '역사의 비밀', author: '최민호', genre: '역사', price: 18000, rating: 4.5, reviews: 987, badge: '4위', colorIdx: 3, description: '우리가 몰랐던 한국사의 숨겨진 진실.' },
  { id: 5, title: '투자의 정석', author: '장세영', genre: '경제/경영', price: 22000, rating: 4.7, reviews: 1543, badge: '5위', colorIdx: 4, description: '초보 투자자를 위한 체계적인 투자 가이드.' }
]

const recommended = [
  { id: 6, title: '별을 담은 노트', author: '한소희', genre: '소설', price: 14000, rating: 4.4, reviews: 678, colorIdx: 5, description: '꿈을 기록하는 한 소녀의 성장 이야기.' },
  { id: 7, title: '데이터 사이언스 입문', author: '이준혁', genre: '컴퓨터/IT', price: 32000, rating: 4.5, reviews: 521, colorIdx: 0, description: '통계부터 머신러닝까지 한 권으로.' },
  { id: 8, title: '오늘도 괜찮아', author: '정유진', genre: '자기계발', price: 12800, rating: 4.6, reviews: 2890, colorIdx: 1, description: '매일을 긍정으로 채우는 실천 가이드.' },
  { id: 9, title: '우주의 시간', author: '박성훈', genre: '과학', price: 19500, rating: 4.3, reviews: 445, colorIdx: 2, description: '빅뱅부터 현재까지, 우주의 장대한 역사.' },
  { id: 10, title: '부의 지도', author: '김태영', genre: '경제/경영', price: 24000, rating: 4.7, reviews: 1234, colorIdx: 3, description: '경제 흐름을 읽는 새로운 시각.' },
  { id: 11, title: '조선의 밥상', author: '이혜원', genre: '역사', price: 17000, rating: 4.2, reviews: 312, colorIdx: 4, description: '음식으로 보는 조선시대 생활사.' }
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

    if (parsed.pathname === '/api/books/bestsellers') {
      return Promise.resolve(json({ success: true, data: bestsellers }))
    }

    if (parsed.pathname === '/api/books/recommended') {
      return Promise.resolve(json({ success: true, data: recommended }))
    }

    if (parsed.pathname === '/api/genres') {
      return Promise.resolve(json({ success: true, data: genres }))
    }

    if (parsed.pathname === '/api/books/search') {
      const q = parsed.searchParams.get('q')
      const genre = parsed.searchParams.get('genre')
      let results = [...bestsellers, ...recommended]
      if (q) results = results.filter(book => book.title.includes(q) || book.author.includes(q))
      if (genre && genre !== '전체') results = results.filter(book => book.genre === genre)
      return Promise.resolve(json({ success: true, data: results, total: results.length }))
    }

    if (parsed.pathname === '/api/cart') {
      return Promise.resolve(json({ success: true, data: [], total: 0 }))
    }

    return Promise.resolve(json({ success: false, data: null }))
  }
}
