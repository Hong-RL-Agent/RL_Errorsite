const popularCities = [
  { id: 1, name: '오사카', country: '일본', imageColor: '#60a5fa' },
  { id: 2, name: '파리', country: '프랑스', imageColor: '#3b82f6' },
  { id: 3, name: '방콕', country: '태국', imageColor: '#2563eb' },
  { id: 4, name: '다낭', country: '베트남', imageColor: '#1d4ed8' }
]

const hotels = [
  { id: 101, cityId: 1, name: '오사카 블루 스카이 호텔', rating: 4.8, price: 154000, amenities: ['수영장', '조식 포함', '무료 와이파이'] },
  { id: 102, cityId: 1, name: '재팬 트레디셔널 료칸', rating: 4.5, price: 210000, amenities: ['온천', '다다미방', '조식 포함'] },
  { id: 103, cityId: 2, name: '르 파리 그랜드 호텔', rating: 4.9, price: 450000, amenities: ['에펠탑 뷰', '수영장', '스파'] },
  { id: 104, cityId: 3, name: '방콕 리버사이드 리조트', rating: 4.6, price: 120000, amenities: ['수영장', '리버 뷰', '피트니스'] },
  { id: 105, cityId: 4, name: '다낭 비치 프론트 빌라', rating: 4.7, price: 180000, amenities: ['프라이빗 비치', '풀빌라', '바비큐'] }
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

    if (parsed.pathname === '/api/cities') {
      return Promise.resolve(json({ success: true, data: popularCities }))
    }

    if (parsed.pathname === '/api/hotels') {
      const cityId = parsed.searchParams.get('cityId')
      const minRating = parsed.searchParams.get('minRating')
      let filtered = hotels

      if (cityId) filtered = filtered.filter(hotel => hotel.cityId === Number(cityId))
      if (minRating) filtered = filtered.filter(hotel => hotel.rating >= Number(minRating))

      return Promise.resolve(json({ success: true, data: filtered }))
    }

    return Promise.resolve(json({ success: false, data: null }))
  }
}
