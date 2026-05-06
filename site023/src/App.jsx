import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PortfolioHero from './components/PortfolioHero';
import GalleryGrid from './components/GalleryGrid';
import Lightbox from './components/Lightbox';
import ProjectSection from './components/ProjectSection';
import TestimonialSection from './components/TestimonialSection';
import ContactCTA from './components/ContactCTA';
import Footer from './components/Footer';

import './styles/global.css';
import './styles/gallery.css';
import './styles/accessibility.css';

export default function App() {
  const [photos, setPhotos] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [category, setCategory] = useState('All');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    fetchData();
  }, [category]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const photoRes = await fetch(`/api/photos?category=${category}`);
      const projectRes = await fetch('/api/projects');
      const photoData = await photoRes.json();
      const projectData = await projectRes.json();
      setPhotos(photoData);
      setProjects(projectData);
      setError(null);
    } catch (err) {
      setError("Failed to load portfolio. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <Header />
      
      <main id="main-content">
        <PortfolioHero />
        
        {loading ? (
          <div style={{ padding: '100px', textAlign: 'center' }}>Developing Visual Narratives...</div>
        ) : error ? (
          <div style={{ padding: '100px', textAlign: 'center', color: 'red' }}>{error}</div>
        ) : (
          <>
            <GalleryGrid 
              photos={photos} 
              onPhotoClick={setSelectedPhoto} 
              onCategoryChange={setCategory} 
              activeCategory={category} 
            />
            <ProjectSection projects={projects} />
            <TestimonialSection />
            <ContactCTA />
          </>
        )}
      </main>

      <Footer />

      {selectedPhoto && (
        <Lightbox 
          photo={selectedPhoto} 
          onClose={() => setSelectedPhoto(null)} 
        />
      )}
    </div>
  );
}
