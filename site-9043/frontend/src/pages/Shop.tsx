import { useState } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  [key: string]: any; 
}

const PRODUCTS: Product[] = [
  { id: 1, name: "Mystic Wood Eau de Parfum", price: 185000, image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&q=80" },
  { id: 2, name: "Velvet Rose Absolute", price: 210000, image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500&q=80" },
  { id: 3, name: "Midnight Amber", price: 155000, image: "https://images.unsplash.com/photo-1557170334-a9632e77c6e4?w=500&q=80" }
];

export default function Shop() {
  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      
      {/* 1. 네비게이션: 흐릿했던 opacity-60을 지우고 텍스트를 또렷한 진회색으로 변경했습니다. */}
      <nav className="p-6 flex justify-between items-center border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <h1 className="text-2xl font-medium tracking-[0.3em] text-stone-900">AURA</h1>
        <div className="space-x-8 text-sm tracking-widest uppercase font-medium text-stone-600">
          <span className="cursor-pointer hover:text-stone-900 transition-colors">Shop</span>
          <span className="cursor-pointer hover:text-stone-900 transition-colors">Cart</span>
        </div>
      </nav>

      {/* 2. 메인 배너: 하얀색 텍스트를 어두운 색으로 바꾸고, 배경 이미지 투명도를 조절해 글씨를 살렸습니다. */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden bg-stone-100">
        <img src="https://images.unsplash.com/photo-1615397323136-1e35928d3632?w=1200&q=80" className="absolute inset-0 object-cover w-full h-full opacity-40" alt="banner" />
        <div className="relative z-10 text-center">
          <h2 className="text-stone-900 text-5xl font-light tracking-widest mb-6">ESSENCE OF LIGHT</h2>
          {/* 버튼: 배경이 밝으므로 다크톤 버튼으로 변경해 눈에 확 띄게 만들었습니다. */}
          <button className="bg-stone-900 text-white px-8 py-3 text-xs tracking-[0.2em] hover:bg-stone-700 shadow-md transition-all">
            DISCOVER
          </button>
        </div>
      </section>

      {/* 3. 상품 목록: 상품명 텍스트 색상을 더 또렷하게 잡았습니다. */}
      <main className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-3 gap-16">
        {PRODUCTS.map(p => (
          <div key={p.id} className="group cursor-pointer">
            <div className="aspect-[3/4] bg-stone-100 mb-6 overflow-hidden">
              <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={p.name} />
            </div>
            <div className="text-center">
              <h3 className="font-medium text-stone-800 tracking-wide mb-2">{p.name}</h3>
              <p className="text-stone-500">{p.price.toLocaleString()} KRW</p>
            </div>
          </div>
        ))}
      </main>
      
    </div>
  );
}