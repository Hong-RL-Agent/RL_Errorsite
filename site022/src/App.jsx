import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BreakingTicker from './components/BreakingTicker';
import CategoryNav from './components/CategoryNav';
import ArticleHero from './components/ArticleHero';
import ArticleGrid from './components/ArticleGrid';
import ArticleModal from './components/ArticleModal';
import TrendingSidebar from './components/TrendingSidebar';
import NewsletterCard from './components/NewsletterCard';
import Footer from './components/Footer';

export default function App() {
  const [articles, setArticles] = useState([]);
  const [trending, setTrending] = useState({ keywords: [], articles: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [category, setCategory] = useState('All');
  const [isRtl, setIsRtl] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    fetchData();
  }, [category]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const artRes = await fetch(`/api/articles?category=${category}`);
      const trendRes = await fetch('/api/trending');
      const artData = await artRes.json();
      const trendData = await trendRes.json();
      setArticles(artData);
      setTrending(trendData);
      setError(null);
    } catch (err) {
      setError("Failed to fetch news. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    /* INTENTIONAL GUI BUG: site022-bug03
       Type: dark-mode-override
       Description: 시스템 다크 모드 설정을 무시하고 light-theme 클래스를 강제로 유지함.
    */
    <div className="app-container light-theme" dir={isRtl ? 'rtl' : 'ltr'} data-bug-id="site022-bug03">
      <Header onRtlToggle={() => setIsRtl(!isRtl)} isRtl={isRtl} />
      <BreakingTicker />
      <CategoryNav activeCategory={category} onCategoryChange={setCategory} />
      
      <main className="container">
        <div className="news-layout">
          <section className="main-news">
            {loading ? (
              <div style={{ padding: '100px', textAlign: 'center' }}>Loading the latest stories...</div>
            ) : error ? (
              <div style={{ padding: '100px', textAlign: 'center', color: 'red' }}>{error}</div>
            ) : (
              <>
                <ArticleHero article={articles[0]} onClick={setSelectedArticle} />
                <ArticleGrid articles={articles.slice(1)} onArticleClick={setSelectedArticle} />
              </>
            )}
          </section>
          
          <aside>
            <TrendingSidebar keywords={trending.keywords} articles={trending.articles} />
            <NewsletterCard />
          </aside>
        </div>
      </main>

      <Footer />

      {selectedArticle && (
        <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
      )}
    </div>
  );
}
