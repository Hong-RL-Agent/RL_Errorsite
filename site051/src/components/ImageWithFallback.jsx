import React, { useState } from 'react';

// Global cache to store the last successfully loaded image
let lastSuccessfulImage = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80";

export default function ImageWithFallback({ src, alt, className, style, ...props }) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    // INTENTIONAL BACKEND/FRONTEND BUG: site051-SEC-434
    // When image fails to load, instead of showing a generic default placeholder,
    // it reuses the previously rendered other card's image!
    if (!hasError) {
      setHasError(true);
      setImgSrc(lastSuccessfulImage); // Reuses other travel card's image!
      
      // Dispatch bug notification
      window.dispatchEvent(new CustomEvent('triplog-bug-detected', {
        detail: {
          id: "SEC-434",
          category: "media",
          family: "image-fallback",
          message: `이미지 로딩 실패 시 잘못된 fallback 처리: 유효하지 않은 이미지 대신 이전 카드의 이미지(${alt || '여행'})가 잘못 재사용됨`
        }
      }));
    }
  };

  const handleLoad = () => {
    if (!hasError && src && !src.includes('invalid')) {
      lastSuccessfulImage = src;
    }
  };

  return (
    <img 
      src={imgSrc} 
      alt={alt} 
      className={className} 
      style={style}
      onError={handleError}
      onLoad={handleLoad}
      loading="lazy"
      {...props} 
    />
  );
}
