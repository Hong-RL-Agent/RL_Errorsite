import React, { useState, useEffect } from 'react'
import Header from './components/Header.jsx'
import HeroSection from './components/HeroSection.jsx'
import GenreNav from './components/GenreNav.jsx'
import BestsellerSection from './components/BestsellerSection.jsx'
import RecommendedSection from './components/RecommendedSection.jsx'
import CartPanel from './components/CartPanel.jsx'
import Footer from './components/Footer.jsx'

function App() {
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeGenre, setActiveGenre] = useState('전체')
  const [bestsellers, setBestsellers] = useState([])
  const [recommended, setRecommended] = useState([])
  const [genres, setGenres] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/books/bestsellers').then(r => r.json()),
      fetch('/api/books/recommended').then(r => r.json()),
      fetch('/api/genres').then(r => r.json()),
    ]).then(([bs, rec, gen]) => {
      setBestsellers(bs.data || [])
      setRecommended(rec.data || [])
      setGenres(gen.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const addToCart = (book) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === book.id)
      if (existing) {
        return prev.map(item => item.id === book.id ? { ...item, qty: item.qty + 1 } : item)
      }
      return [...prev, { ...book, qty: 1 }]
    })
  }

  const removeFromCart = (bookId) => {
    setCart(prev => prev.filter(item => item.id !== bookId))
  }

  const filteredBestsellers = bestsellers.filter(book => {
    const q = searchQuery.toLowerCase()
    const matchSearch = !q || book.title.includes(q) || book.author.includes(q)
    const matchGenre = activeGenre === '전체' || book.genre === activeGenre
    return matchSearch && matchGenre
  })

  const filteredRecommended = recommended.filter(book => {
    const q = searchQuery.toLowerCase()
    const matchSearch = !q || book.title.includes(q) || book.author.includes(q)
    const matchGenre = activeGenre === '전체' || book.genre === activeGenre
    return matchSearch && matchGenre
  })

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)

  return (
    <div className="app">
      <Header
        cartCount={cartCount}
        onCartClick={() => setIsCartOpen(o => !o)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <HeroSection />
      <GenreNav genres={genres} activeGenre={activeGenre} onGenreChange={setActiveGenre} />
      <main className="main-content">
        {loading ? (
          <div className="loading-wrap">
            <div className="spinner" />
            <p>도서 목록을 불러오는 중...</p>
          </div>
        ) : (
          <>
            <BestsellerSection books={filteredBestsellers} onAddToCart={addToCart} />
            <RecommendedSection books={filteredRecommended} onAddToCart={addToCart} />
          </>
        )}
      </main>
      <CartPanel
        isOpen={isCartOpen}
        cart={cart}
        total={cartTotal}
        onClose={() => setIsCartOpen(false)}
        onRemove={removeFromCart}
      />
      <Footer />
    </div>
  )
}

export default App
