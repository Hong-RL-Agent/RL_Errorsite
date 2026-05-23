import { useMemo, useState } from 'react'
import {
  Crown,
  Gem,
  Heart,
  Minus,
  Plus,
  Search,
  Share2,
  ShoppingBag,
  Sparkles,
  Star,
  UserRound,
} from 'lucide-react'

interface Product {
  id: number
  name: string
  category: string
  color: string
  price: number
  image: string
}

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
}

interface Review {
  id: number
  name: string
  text: string
  rating: number
}

const products: Product[] = [
  { id: 1, name: 'Obsidian Coat', category: 'Outer', color: 'Black', price: 890, image: 'from-slate-600/80 to-zinc-900/80' },
  { id: 2, name: 'Luna Silk Dress', category: 'Dress', color: 'Ivory', price: 1240, image: 'from-rose-200/50 to-fuchsia-800/80' },
  { id: 3, name: 'Apex Loafer', category: 'Shoes', color: 'Brown', price: 640, image: 'from-amber-500/60 to-stone-900/80' },
  { id: 4, name: 'Noir Tote', category: 'Bag', color: 'Black', price: 520, image: 'from-zinc-500/70 to-black/80' },
]

const reviews: Review[] = [
  { id: 1, name: 'Mina K.', text: '배송부터 패키징까지 럭셔리 경험 그 자체였어요.', rating: 5 },
  { id: 2, name: 'Ethan P.', text: '소재감이 압도적이고 핏이 완벽합니다.', rating: 5 },
  { id: 3, name: 'Sora L.', text: 'UI가 부드럽고 쇼핑 흐름이 직관적이에요.', rating: 4 },
]

function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 shadow-glass backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-fuchsia-300/40">
      <div className={`mb-4 h-52 rounded-2xl bg-gradient-to-br ${product.image} transition group-hover:scale-[1.02]`} />
      <div className="flex items-center justify-between text-sm text-slate-300">
        <span>{product.category}</span>
        <span>{product.color}</span>
      </div>
      <h3 className="mt-2 text-lg font-semibold text-white">{product.name}</h3>
      <p className="mt-1 text-sm text-slate-300">${product.price}</p>
      <div className="relative mt-4">
        <button
          type="button"
          onClick={() => onAddToCart(product)}
          className="w-full rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-white"
        >
          장바구니 담기
        </button>
        <div className="absolute inset-0 z-20 block bg-transparent md:hidden" />
      </div>
    </article>
  )
}

function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedColor, setSelectedColor] = useState<string>('All')
  const [maxPrice, setMaxPrice] = useState<number>(1500)
  const [cart, setCart] = useState<Record<number, number>>({})
  const [cartTotal, setCartTotal] = useState<number>(0)

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (item) =>
          (selectedCategory === 'All' || item.category === selectedCategory) &&
          (selectedColor === 'All' || item.color === selectedColor) &&
          item.price <= maxPrice,
      ),
    [selectedCategory, selectedColor, maxPrice],
  )

  const upsertQuantity = async (product: Product, quantity: number): Promise<void> => {
    const response = await fetch('/api/v1/cart/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id, quantity, unitPrice: product.price }),
    })
    const data: { total: number } = await response.json()
    setCartTotal(data.total)
    setCart((prev) => ({ ...prev, [product.id]: quantity }))
  }

  const cartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0)

  return (
    <div className="px-4 pb-12 pt-6 text-slate-100 md:px-8">
      <header className="sticky top-3 z-50 mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-lg font-semibold tracking-wide">
          <Gem className="h-5 w-5 text-fuchsia-300" />
          AURA
        </div>
        <nav className="hidden items-center gap-6 text-sm text-slate-300 lg:flex">
          <span>Women</span>
          <span>Men</span>
          <span>Collections</span>
          <div className="group relative cursor-pointer">
            <span>Lifestyle</span>
            <div className="absolute left-0 top-7 hidden w-64 rounded-xl border border-white/20 bg-black/70 p-4 backdrop-blur-xl group-hover:block">
              <p className="text-xs text-slate-400">AURA Services</p>
              <p className="mt-2">Private Styling</p>
              <p>Artisan Home</p>
              <p>Members Club</p>
            </div>
          </div>
        </nav>
        <div className="flex flex-1 items-center justify-end gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 md:flex">
            <Search className="h-4 w-4 text-slate-400" />
            <input className="w-40 bg-transparent text-sm outline-none" placeholder="Search" />
          </div>
          <button className="relative rounded-full border border-white/10 bg-white/5 p-2">
            <ShoppingBag className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 rounded-full bg-fuchsia-500 px-1.5 text-[10px]">{cartCount}</span>
          </button>
          <button className="rounded-full border border-white/10 bg-white/5 p-2"><UserRound className="h-4 w-4" /></button>
        </div>
      </header>

      <main className="mx-auto mt-8 grid w-full max-w-[1440px] grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glass backdrop-blur-xl">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold"><Sparkles className="h-4 w-4 text-fuchsia-300" />Filters</h2>
          <label className="mb-2 block text-xs text-slate-400">Category</label>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="mb-4 w-full rounded-xl border border-white/10 bg-black/40 p-2 text-sm">
            <option>All</option><option>Outer</option><option>Dress</option><option>Shoes</option><option>Bag</option>
          </select>
          <label className="mb-2 block text-xs text-slate-400">Color</label>
          <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} className="mb-4 w-full rounded-xl border border-white/10 bg-black/40 p-2 text-sm">
            <option>All</option><option>Black</option><option>Ivory</option><option>Brown</option>
          </select>
          <label className="mb-2 block text-xs text-slate-400">Max Price (${maxPrice})</label>
          <input type="range" min={300} max={1500} step={10} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-fuchsia-400" />
        </aside>

        <section>
          <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent px-6 py-14 shadow-glass backdrop-blur-xl">
            <div className="absolute -right-10 -top-8 h-40 w-40 animate-float rounded-full bg-fuchsia-500/20 blur-2xl" />
            <p className="text-xs uppercase tracking-[0.3em] text-fuchsia-200">Luxury Curated</p>
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight text-white md:text-6xl">Timeless fashion in a modern dark atelier.</h1>
            <p className="mt-4 max-w-xl text-slate-300">AURA는 하이엔드 패션과 라이프스타일 제품을 감각적으로 큐레이션하는 프리미엄 편집숍입니다.</p>
          </section>

          <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredProducts.map((product) => (
              <div key={product.id}>
                <ProductCard product={product} onAddToCart={(target) => upsertQuantity(target, (cart[target.id] ?? 0) + 1)} />
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2 text-xs">
                  <button type="button" className="rounded border border-white/20 p-1" onClick={() => upsertQuantity(product, (cart[product.id] ?? 0) - 1)}>
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-8 text-center">{cart[product.id] ?? 0}</span>
                  <button type="button" className="rounded border border-white/20 p-1" onClick={() => upsertQuantity(product, (cart[product.id] ?? 0) + 1)}>
                    <Plus className="h-3 w-3" />
                  </button>
                  <span className="ml-auto text-slate-300">Subtotal track</span>
                </div>
              </div>
            ))}
          </section>

          <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2 text-lg font-semibold"><Crown className="h-5 w-5 text-amber-200" />Social Proof</div>
            <div className="grid gap-3 md:grid-cols-3">
              {reviews.map((review) => (
                <article key={review.id} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="mb-1 flex items-center gap-1">{Array.from({ length: review.rating }).map((_, idx) => <Star key={idx} className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />)}</div>
                  <p className="text-sm text-slate-200">{review.text}</p>
                  <p className="mt-3 text-xs text-slate-400">{review.name}</p>
                </article>
              ))}
            </div>
          </section>
        </section>
      </main>

      <footer className="mx-auto mt-10 grid w-full max-w-[1440px] gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:grid-cols-3">
        <div>
          <p className="text-sm text-slate-300">Newsletter</p>
          <div className="mt-2 flex gap-2">
            <input className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm" placeholder="your@email.com" />
            <button className="rounded-xl bg-fuchsia-500 px-4 py-2 text-sm font-semibold text-white">구독</button>
          </div>
        </div>
        <div className="text-sm text-slate-300">
          <p className="mb-2 text-white">Sitemap</p>
          <p>About</p><p>Editorial</p><p>Concierge</p>
        </div>
        <div className="text-sm text-slate-300">
          <p className="mb-2 text-white">Connect</p>
          <div className="flex items-center gap-3"><Share2 className="h-4 w-4" /><Heart className="h-4 w-4" />AURA Journal</div>
          <p className="mt-4 text-xs text-slate-400">Cart total: ${cartTotal}</p>
        </div>
      </footer>
    </div>
  )
}

export default App
