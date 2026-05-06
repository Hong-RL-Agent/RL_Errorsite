import { useEffect, useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import StudioHero from './components/StudioHero.jsx';
import GalleryFilters from './components/GalleryFilters.jsx';
import MasonryGallery from './components/MasonryGallery.jsx';
import Lightbox from './components/Lightbox.jsx';
import ServicePricing from './components/ServicePricing.jsx';
import TestimonialSection from './components/TestimonialSection.jsx';
import ContactForm from './components/ContactForm.jsx';
import Footer from './components/Footer.jsx';

const galleryFilters = [
  { id: 'all', label: '전체' },
  { id: 'wedding', label: '웨딩' },
  { id: 'profile', label: '프로필' },
  { id: 'commercial', label: '커머셜' },
  { id: 'editorial', label: '에디토리얼' }
];

function App() {
  const [photos, setPhotos] = useState([]);
  const [services, setServices] = useState([]);
  const [photoStatus, setPhotoStatus] = useState('loading');
  const [serviceStatus, setServiceStatus] = useState('loading');
  const [photoError, setPhotoError] = useState('');
  const [serviceError, setServiceError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [previousFilter, setPreviousFilter] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [likedPhotos, setLikedPhotos] = useState(() => new Set());

  const loadPhotos = async () => {
    setPhotoStatus('loading');
    setPhotoError('');

    try {
      const response = await fetch('/api/photos');
      if (!response.ok) {
        throw new Error('사진 데이터를 불러오지 못했습니다.');
      }
      const data = await response.json();
      setPhotos(data.photos);
      setPhotoStatus('success');
    } catch (error) {
      setPhotoError(error.message);
      setPhotoStatus('error');
    }
  };

  const loadServices = async () => {
    setServiceStatus('loading');
    setServiceError('');

    try {
      const response = await fetch('/api/services');
      if (!response.ok) {
        throw new Error('서비스 데이터를 불러오지 못했습니다.');
      }
      const data = await response.json();
      setServices(data.services);
      setServiceStatus('success');
    } catch (error) {
      setServiceError(error.message);
      setServiceStatus('error');
    }
  };

  useEffect(() => {
    loadPhotos();
    loadServices();
  }, []);

  const handleFilterChange = (nextFilter) => {
    setPreviousFilter(activeFilter);
    setActiveFilter(nextFilter);
  };

  // INTENTIONAL GUI BUG: site037-bug01
  // CSV Error: 갤러리 필터 상태 불일치
  // Type: gallery-filter-state-mismatch
  // Description: 필터 탭의 active state와 실제 사진 필터링에 사용되는 state가 달라 결과가 불일치함.
  const filteredPhotos = useMemo(() => {
    const filterUsedByGrid = previousFilter;
    if (filterUsedByGrid === 'all') {
      return photos;
    }
    return photos.filter((photo) => photo.category === filterUsedByGrid);
  }, [photos, previousFilter]);

  const selectedLightboxPhoto = lightboxIndex === null ? null : filteredPhotos[lightboxIndex];

  const openLightbox = (photoId) => {
    const selectedIndex = filteredPhotos.findIndex((photo) => photo.id === photoId);
    setLightboxIndex(selectedIndex >= 0 ? selectedIndex : 0);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const showPreviousPhoto = () => {
    setLightboxIndex((currentIndex) => {
      if (currentIndex === null || filteredPhotos.length === 0) {
        return null;
      }
      return (currentIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    });
  };

  const showNextPhoto = () => {
    setLightboxIndex((currentIndex) => {
      if (currentIndex === null || filteredPhotos.length === 0) {
        return null;
      }
      return (currentIndex + 1) % filteredPhotos.length;
    });
  };

  const toggleLike = (photoId) => {
    setLikedPhotos((currentLikes) => {
      const nextLikes = new Set(currentLikes);
      if (nextLikes.has(photoId)) {
        nextLikes.delete(photoId);
      } else {
        nextLikes.add(photoId);
      }
      return nextLikes;
    });
  };

  return (
    <>
      <Header />
      <main>
        <StudioHero />

        <section className="studio-strip" aria-label="스튜디오 핵심 지표">
          <div>
            <strong>14</strong>
            <span>Curated sets</span>
          </div>
          <div>
            <strong>420+</strong>
            <span>Published projects</span>
          </div>
          <div>
            <strong>48h</strong>
            <span>Preview delivery</span>
          </div>
          <div>
            <strong>1:1</strong>
            <span>Director consult</span>
          </div>
        </section>

        <section className="section-shell gallery-shell" id="portfolio">
          <div className="section-heading">
            <span className="eyebrow">Portfolio</span>
            <h2>빛의 밀도와 표정을 설계한 최근 작업</h2>
            <p>
              웨딩, 프로필, 커머셜, 에디토리얼을 한 스튜디오 톤으로 연결합니다. 이미지를 클릭하면 프로젝트 상세와 큰 이미지를 확인할 수 있습니다.
            </p>
          </div>

          <GalleryFilters
            filters={galleryFilters}
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
          />

          <MasonryGallery
            status={photoStatus}
            error={photoError}
            photos={filteredPhotos}
            likedPhotos={likedPhotos}
            onRetry={loadPhotos}
            onOpenLightbox={openLightbox}
            onToggleLike={toggleLike}
          />
        </section>

        <section className="section-shell process-section" id="process">
          <div className="section-heading compact">
            <span className="eyebrow">Direction</span>
            <h2>콘셉트부터 보정 톤까지 한 흐름으로</h2>
          </div>
          <div className="process-grid">
            <article>
              <span>01</span>
              <h3>Visual Brief</h3>
              <p>브랜드 무드, 인물의 인상, 공간 조건을 사전 브리프에서 하나의 촬영 언어로 정리합니다.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Set & Lighting</h3>
              <p>블랙, 크림, 실버 톤의 세트와 하드/소프트 조명을 조합해 장면의 질감을 만듭니다.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Editorial Retouch</h3>
              <p>피부 질감은 살리고 색 온도와 대비는 고급 인쇄물에 맞게 섬세하게 조정합니다.</p>
            </article>
          </div>
        </section>

        <ServicePricing
          status={serviceStatus}
          error={serviceError}
          services={services}
          onRetry={loadServices}
        />

        <TestimonialSection />
        <ContactForm />
      </main>
      <Footer />

      {selectedLightboxPhoto && (
        <Lightbox
          photo={selectedLightboxPhoto}
          count={filteredPhotos.length}
          index={lightboxIndex}
          isLiked={likedPhotos.has(selectedLightboxPhoto.id)}
          onClose={closeLightbox}
          onPrevious={showPreviousPhoto}
          onNext={showNextPhoto}
          onToggleLike={toggleLike}
        />
      )}
    </>
  );
}

export default App;
