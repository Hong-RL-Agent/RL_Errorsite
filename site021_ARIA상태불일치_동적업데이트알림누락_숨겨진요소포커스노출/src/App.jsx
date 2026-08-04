import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TechHero from './components/TechHero';
import ProductFilters from './components/ProductFilters';
import ProductGrid from './components/ProductGrid';
import ProductModal from './components/ProductModal';
import CompareDrawer from './components/CompareDrawer';
import ReviewSummary from './components/ReviewSummary';
import RecommendationCarousel from './components/RecommendationCarousel';
import Footer from './components/Footer';

export default function App() {
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [brandFilter, setBrandFilter] = useState('All');
  const [priceFilter, setPriceFilter] = useState(2000000);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [compareItems, setCompareItems] = useState([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchData();
  }, [brandFilter, priceFilter, searchTerm]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const pRes = await fetch(`/api/products?brand=${brandFilter}&maxPrice=${priceFilter}&search=${searchTerm}`);
      const rRes = await fetch('/api/reviews');
      const pData = await pRes.json();
      const rData = await rRes.json();
      setProducts(pData);
      setReviews(rData);
      setError(null);
    } catch (err) {
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompare = (product) => {
    if (compareItems.find(item => item.id === product.id)) {
      alert('이미 비교함에 있는 상품입니다.');
      return;
    }
    if (compareItems.length >= 3) {
      alert('비교는 최대 3개까지만 가능합니다.');
      return;
    }
    setCompareItems([...compareItems, product]);
  };

  const handleRemoveCompare = (id) => {
    setCompareItems(compareItems.filter(item => item.id !== id));
  };

  return (
    <div className="app">
      <Header 
        compareCount={compareItems.length} 
        onCompareClick={() => setIsCompareOpen(!isCompareOpen)}
        isCompareOpen={isCompareOpen}
        onSearch={setSearchTerm}
      />
      
      <main>
        <TechHero />
        
        <div className="container">
          <div className="main-layout">
            <ProductFilters 
              onBrandChange={setBrandFilter}
              onPriceChange={setPriceFilter}
            />
            
            <section>
              {loading ? (
                <div style={{ padding: '100px', textAlign: 'center' }}>데이터를 불러오는 중...</div>
              ) : error ? (
                <div style={{ padding: '100px', textAlign: 'center', color: 'red' }}>{error}</div>
              ) : (
                <ProductGrid 
                  products={products} 
                  onAddCompare={handleAddCompare}
                  onProductClick={setSelectedProduct}
                />
              )}

              <RecommendationCarousel />
              <ReviewSummary reviews={reviews} />
            </section>
          </div>
        </div>
      </main>

      <Footer />

      <CompareDrawer 
        isOpen={isCompareOpen} 
        items={compareItems}
        onClose={() => setIsCompareOpen(false)}
        onRemove={handleRemoveCompare}
      />

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
}
