import React, { useState } from 'react';
import { assetUrl } from '../api/media';

export default function Gallery({ images, title }) {
  const [i, setI] = useState(0);
  const n = images.length;
  if (!n) return <div className="gallery empty">이미지가 없습니다.</div>;
  const step = (d) => setI((x) => (x + d + n) % n);
  return (
    <div className="gallery">
      <div className="g-stage">
        <button type="button" className="g-nav l" onClick={() => step(-1)} aria-label="이전 사진">‹</button>
        <img src={assetUrl(images[i].url)} alt={`${title} ${images[i].label}`} />
        <button type="button" className="g-nav r" onClick={() => step(1)} aria-label="다음 사진">›</button>
        <span className="g-count">{i + 1} / {n}</span>
      </div>
      <ul className="g-thumbs">
        {images.map((im, k) => (
          <li key={im.url}><button type="button" className={k === i ? 'on' : ''} onClick={() => setI(k)} aria-label={`${im.label} 사진`}><img src={assetUrl(im.url)} alt="" /></button></li>
        ))}
      </ul>
    </div>
  );
}
