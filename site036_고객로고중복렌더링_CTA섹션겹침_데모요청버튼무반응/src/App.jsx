import { useEffect, useMemo, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import SaaSHero from './components/SaaSHero.jsx';
import FeatureTabs from './components/FeatureTabs.jsx';
import CustomerLogos from './components/CustomerLogos.jsx';
import PricingPreview from './components/PricingPreview.jsx';
import ScreenshotSection from './components/ScreenshotSection.jsx';
import TestimonialCarousel from './components/TestimonialCarousel.jsx';
import DemoRequestForm from './components/DemoRequestForm.jsx';
import FAQSection from './components/FAQSection.jsx';
import CTASection from './components/CTASection.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  const [features, setFeatures] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const formRef = useRef(null);

  useEffect(() => {
    let active = true;

    async function loadLandingData() {
      setLoading(true);
      setApiError('');
      try {
        const [featureResponse, testimonialResponse] = await Promise.all([
          fetch('/api/features'),
          fetch('/api/testimonials')
        ]);

        if (!featureResponse.ok || !testimonialResponse.ok) {
          throw new Error('Landing API request failed');
        }

        const featurePayload = await featureResponse.json();
        const testimonialPayload = await testimonialResponse.json();

        if (active) {
          setFeatures(featurePayload.features);
          setTestimonials(testimonialPayload.testimonials);
        }
      } catch (error) {
        if (active) {
          setApiError('제품 데이터를 불러오지 못했습니다. 잠시 후 새로고침해 주세요.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadLandingData();
    return () => {
      active = false;
    };
  }, []);

  const logos = useMemo(() => testimonials.map((item) => ({ id: item.id, name: item.company, logo: item.logo })), [testimonials]);

  const scrollToDemo = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="site-shell">
      <Header onDemoClick={scrollToDemo} />
      <main>
        <SaaSHero onDemoClick={scrollToDemo} />
        <section className="api-status" aria-live="polite">
          {loading && <span className="status-pill">API 데이터를 불러오는 중입니다...</span>}
          {apiError && <span className="status-pill error">{apiError}</span>}
          {!loading && !apiError && <span className="status-pill success">API 연결 정상: 기능 및 고객 후기 데이터 렌더링 완료</span>}
        </section>
        <FeatureTabs features={features} loading={loading} />
        <CustomerLogos logos={logos} />
        <PricingPreview />
        <ScreenshotSection />
        <DemoRequestForm ref={formRef} />
        <FAQSection />
        <TestimonialCarousel testimonials={testimonials} loading={loading} />
        <CTASection onDemoClick={scrollToDemo} />
      </main>
      <Footer />
    </div>
  );
}
