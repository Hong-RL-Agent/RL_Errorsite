import { useEffect, useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import GalleryHero from './components/GalleryHero.jsx';
import ArtworkFilters from './components/ArtworkFilters.jsx';
import ArtworkGrid from './components/ArtworkGrid.jsx';
import ArtworkModal from './components/ArtworkModal.jsx';
import ArtistPanel from './components/ArtistPanel.jsx';
import InquiryDrawer from './components/InquiryDrawer.jsx';
import ExhibitionSchedule from './components/ExhibitionSchedule.jsx';
import CuratorNote from './components/CuratorNote.jsx';
import Footer from './components/Footer.jsx';

const categoryLabels = {
  all: '전체',
  painting: '회화',
  mixed: '혼합재료',
  installation: '설치',
  drawing: '드로잉',
  photography: '사진'
};

export default function App() {
  const [artworks, setArtworks] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [artistFilter, setArtistFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryArtwork, setInquiryArtwork] = useState(null);
  const [scheduleTab, setScheduleTab] = useState('current');
  const [newsletter, setNewsletter] = useState(false);
  const [collectorName, setCollectorName] = useState('Private Collector');

  const fetchGalleryData = async () => {
    setLoading(true);
    setError('');

    try {
      const [artworkResponse, artistResponse] = await Promise.all([
        fetch('/api/artworks'),
        fetch('/api/artists')
      ]);

      if (!artworkResponse.ok || !artistResponse.ok) {
        throw new Error('갤러리 데이터를 불러오지 못했습니다.');
      }

      const artworkData = await artworkResponse.json();
      const artistData = await artistResponse.json();
      setArtworks(artworkData.artworks);
      setArtists(artistData.artists);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryData();
  }, []);

  const categories = useMemo(() => {
    const values = Array.from(new Set(artworks.map((artwork) => artwork.category)));
    return ['all', ...values];
  }, [artworks]);

  const filteredArtworks = useMemo(() => {
    return artworks.filter((artwork) => {
      const categoryMatch = categoryFilter === 'all' || artwork.category === categoryFilter;
      const artistMatch = artistFilter === 'all' || String(artwork.artistId) === String(artistFilter);
      const queryMatch =
        artwork.title.toLowerCase().includes(query.toLowerCase()) ||
        artwork.material.toLowerCase().includes(query.toLowerCase());

      return categoryMatch && artistMatch && queryMatch;
    });
  }, [artworks, categoryFilter, artistFilter, query]);

  const featuredArtwork = artworks[0];
  const featuredArtist = artists.find((artist) => featuredArtwork && String(artist.id) === String(featuredArtwork.artistId));

  const openInquiry = (artwork = null) => {
    setInquiryArtwork(artwork);
    setInquiryOpen(true);
  };

  const showComingSoon = () => {
    alert('준비중입니다.');
  };

  return (
    <div className="gallery-shell">
      <Header onInquiry={() => openInquiry(null)} onComingSoon={showComingSoon} />

      <main>
        <GalleryHero
          artwork={featuredArtwork}
          artist={featuredArtist}
          onExplore={() => document.getElementById('artworks')?.scrollIntoView({ behavior: 'smooth' })}
          onInquiry={() => openInquiry(featuredArtwork)}
        />

        <section className="gallery-layout section">
          <div className="gallery-main">
            <ArtworkFilters
              categories={categories}
              categoryLabels={categoryLabels}
              activeCategory={categoryFilter}
              activeArtist={artistFilter}
              artists={artists}
              query={query}
              onCategoryChange={setCategoryFilter}
              onArtistChange={setArtistFilter}
              onQueryChange={setQuery}
              onReset={() => {
                setCategoryFilter('all');
                setArtistFilter('all');
                setQuery('');
              }}
            />

            <ArtworkGrid
              artworks={filteredArtworks}
              artists={artists}
              loading={loading}
              error={error}
              onRetry={fetchGalleryData}
              onOpenDetail={setSelectedArtwork}
              onOpenInquiry={openInquiry}
            />

            <ArtistPanel artists={artists} loading={loading} />
            <ExhibitionSchedule activeTab={scheduleTab} onTabChange={setScheduleTab} />
            <CuratorNote onComingSoon={showComingSoon} />
          </div>

          <aside className="collection-sticky-panel" aria-label="컬렉션 문의">
            <span className="section-kicker">Collector Service</span>
            <h2>컬렉션 문의</h2>
            <p>작품 구매 가능 여부, 설치 조건, 프라이빗 뷰잉 일정을 큐레이터가 확인해 드립니다.</p>
            <label>
              <span>수집가명</span>
              <input value={collectorName} onChange={(event) => setCollectorName(event.target.value)} />
            </label>
            <label className="checkline">
              <input
                type="checkbox"
                checked={newsletter}
                onChange={(event) => setNewsletter(event.target.checked)}
              />
              전시 프리뷰 알림 받기
            </label>
            <button className="primary-button" type="button" onClick={() => openInquiry(null)}>
              컬렉션 상담 열기
            </button>
            <button className="ghost-button" type="button" onClick={showComingSoon}>
              VIP 프리뷰 예약
            </button>
          </aside>
        </section>
      </main>

      <Footer onComingSoon={showComingSoon} />

      <ArtworkModal
        artwork={selectedArtwork}
        artists={artists}
        onClose={() => setSelectedArtwork(null)}
        onInquiry={openInquiry}
      />

      <InquiryDrawer
        open={inquiryOpen}
        artwork={inquiryArtwork}
        onClose={() => setInquiryOpen(false)}
        collectorName={collectorName}
        onCollectorNameChange={setCollectorName}
      />
    </div>
  );
}
