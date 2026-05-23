import { useMemo, useState } from 'react'
import {
  Gem,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  UserRound,
  Loader2
} from 'lucide-react'

// --- Types ---
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

// --- Data ---
const products: Product[] = [
  { id: 1, name: 'Obsidian Coat', category: 'Outer', color: 'Black', price: 890, image: 'from-slate-600/80 to-zinc-900/80' },
  { id: 2, name: 'Luna Silk Dress', category: 'Dress', color: 'Ivory', price: 1240, image: 'from-rose-200/50 to-fuchsia-800/80' },
  { id: 3, name: 'Apex Loafer', category: 'Shoes', color: 'Brown', price: 640, image: 'from-amber-500/60 to-stone-900/80' },
  { id: 4, name: 'Noir Tote', category: 'Bag', color: 'Black', price: 520, image: 'from-zinc-500/70 to-black/80' },
]

// --- Components ---
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
      </div>
    </article>
  )
}

function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [maxPrice, setMaxPrice] = useState<number>(1500)
  const [cart, setCart] = useState<Record<number, any>>({}) 
  const [cartTotal, setCartTotal] = useState<number>(0)
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false)

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (item) =>
          (selectedCategory === 'All' || item.category === selectedCategory) &&
          item.price <= maxPrice, 
      ),
    [selectedCategory, maxPrice],
  )

  // [Index 340] 수량 입력 로직 결함 (NaN 노출 위험)
  const handleQuantityChange = (productId: number, value: string) => {
    // 숫자로 엄격하게 변환하지 않아 빈 문자열이나 문자가 입력되면 NaN이 상태에 저장됨
    const newQty = parseInt(value) 
    setCart((prev) => ({ ...prev, [productId]: newQty }))
  }

  const upsertQuantity = async (product: Product, quantity: number): Promise<void> => {
    // 수량이 0 미만으로 내려가는 로직 결함 포함
    setCart((prev) => ({ ...prev, [product.id]: quantity }))
    
    try {
      const response = await fetch('/api/v1/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity, unitPrice: product.price }),
      })
      const data = await response.json()
      setCartTotal(data.total)
    } catch (e) {
      console.error("API Error")
    }
  }

  // [Index 350] 결제 버튼 클릭 시 무한 로딩 결함
  const handleCheckout = () => {
    setIsCheckoutLoading(true)
    // 결제 로직을 시작하지만, 완료 처리(setIsCheckoutLoading(false))를 절대 호출하지 않음
  }

  const cartCount = Object.values(cart).reduce((sum, qty) => sum + (Number(qty) || 0), 0)

  return (
    <div className="px-4 pb-12 pt-6 text-slate-100 md:px-8 bg-black min-h-screen">
      <header className="sticky top-3 z-50 mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-lg font-semibold tracking-wide">
          <Gem className="h-5 w-5 text-fuchsia-300" />
          AURA
        </div>
        <nav className="hidden items-center gap-6 text-sm text-slate-300 lg:flex">
          <span>Women</span><span>Men</span><span>Collections</span>
        </nav>
        <div className="flex flex-1 items-center justify-end gap-3">
          <button className="relative rounded-full border border-white/10 bg-white/5 p-2">
            <ShoppingBag className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 rounded-full bg-fuchsia-500 px-1.5 text-[10px]">{cartCount}</span>
          </button>
          <button className="rounded-full border border-white/10 bg-white/5 p-2"><UserRound className="h-4 w-4" /></button>
        </div>
      </header>

      <main className="mx-auto mt-8 grid w-full max-w-[1440px] grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glass backdrop-blur-xl h-fit">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold"><Sparkles className="h-4 w-4 text-fuchsia-300" />Filters</h2>
          <label className="mb-2 block text-xs text-slate-400">Category</label>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="mb-4 w-full rounded-xl border border-white/10 bg-black/40 p-2 text-sm outline-none">
            <option>All</option><option>Outer</option><option>Dress</option><option>Shoes</option><option>Bag</option>
          </select>
          <label className="mb-2 block text-xs text-slate-400">Max Price (${maxPrice})</label>
          <input type="range" min={300} max={1500} step={10} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-fuchsia-400" />
        </aside>

        <section>
          <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent px-6 py-14 shadow-glass backdrop-blur-xl">
            <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-white md:text-6xl">Timeless fashion.</h1>
            <p className="mt-4 max-w-xl text-slate-300">AURA는 하이엔드 제품을 감각적으로 큐레이션하는 프리미엄 편집숍입니다.</p>
          </section>

          <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredProducts.map((product) => (
              <div key={product.id}>
                <ProductCard product={product} onAddToCart={(target) => upsertQuantity(target, (cart[target.id] ?? 0) + 1)} />
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2 text-xs">
                  <button type="button" className="rounded border border-white/20 p-1" onClick={() => upsertQuantity(product, (cart[product.id] ?? 0) - 1)}>
                    <Minus className="h-3 w-3" />
                  </button>
                  {/* [Index 340] 수량 직접 입력 시 NaN 발생 유도 */}
                  <input 
                    type="text"
                    value={cart[product.id] ?? 0}
                    onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                    className="w-12 text-center bg-transparent border border-white/10 rounded"
                  />
                  <button type="button" className="rounded border border-white/20 p-1" onClick={() => upsertQuantity(product, (cart[product.id] ?? 0) + 1)}>
                    <Plus className="h-3 w-3" />
                  </button>
                  <span className="ml-auto text-slate-400">Subtotal: ${(Number(cart[product.id]) * product.price) || 0}</span>
                </div>
              </div>
            ))}
          </section>

          {/* [Index 360] 보안 결함: 관리자 전용 데이터가 일반 사용자 페이지 하단에 노출됨 */}
          <section className="mt-8 rounded-3xl border border-red-500/20 bg-red-500/5 p-4 text-[10px] text-slate-500">
            <p className="font-mono uppercase mb-2 text-red-400/60">Debug: Admin Order Stream (Unauthorized Access Risk)</p>
            <p>Recent Order: user_8829 - $2,400 - items: [1, 4] - Status: SHIPPED</p>
            <p>Recent Order: user_1204 - $1,240 - items: [2] - Status: PROCESSING</p>
          </section>
        </section>
      </main>

      <footer className="mx-auto mt-10 grid w-full max-w-[1440px] gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:grid-cols-3">
        <div>
          <p className="text-sm text-slate-300 font-semibold mb-3">Newsletter</p>
          <div className="flex gap-2">
            <input className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm" placeholder="your@email.com" />
            <button className="rounded-xl bg-fuchsia-600 px-4 py-2 text-sm font-semibold text-white">구독</button>
          </div>
        </div>
        <div className="text-sm text-slate-400">
          <p className="mb-2 text-white font-semibold">Concierge</p>
          <p>Shipping & Returns</p><p>Privacy Policy</p>
        </div>
        <div className="flex flex-col justify-between items-end">
          <p className="text-xl font-bold text-white">Total: ${cartTotal}</p>
          {/* [Index 350] 결제 버튼 - 클릭 시 무한 로딩 */}
          <button 
            onClick={handleCheckout}
            disabled={isCheckoutLoading}
            className="mt-4 flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-sm font-bold text-black transition hover:bg-fuchsia-100 disabled:opacity-70"
          >
            {isCheckoutLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Checkout Now"}
          </button>
        </div>
      </footer>
    </div>
  )
}

export default App