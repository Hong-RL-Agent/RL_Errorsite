import React, { useState } from 'react';
import { assetUrl } from '../api';

export default function ImageGallery({ images, productName }) {
  const [index, setIndex] = useState(0);
  const total = images.length;
  if (!total) return <div className="gallery empty">등록된 이미지가 없습니다.</div>;

  const go = (delta) => setIndex((i) => (i + delta + total) % total);
  const current = images[index];
  // 이미지가 많은 상품은 간결한 갤러리 레이아웃을 사용한다.
  const dense = total >= 8;

  return (
    <div className={`gallery${dense ? ' gallery-dense' : ''}`} data-bug-id="B05-ERR03">
      <div className="gallery-stage">
        <button type="button" className="gallery-nav prev" onClick={() => go(-1)} aria-label="이전 이미지">‹</button>
        <img src={assetUrl(current.url)} alt={`${productName} ${current.label}`} />
        <button type="button" className="gallery-nav next" onClick={() => go(1)} aria-label="다음 이미지">›</button>
        {/* INTENTIONAL_ERROR: B05-ERR03
            CSV Error: 페이지네이션 없는 슬라이드
            Strategy: SEQUENCE_REPLAY
            Description: 이미지가 8장 이상인 갤러리에서는 현재 위치/전체 개수 인디케이터를 렌더링하지 않음. */}
        {!dense && <span className="gallery-count">{index + 1} / {total}</span>}
      </div>
      {!dense && (
        <ul className="gallery-thumbs">
          {images.map((img, i) => (
            <li key={img.id}>
              <button type="button" className={i === index ? 'on' : ''} onClick={() => setIndex(i)} aria-label={`${i + 1}번 이미지`}>
                <img src={assetUrl(img.url)} alt="" loading="lazy" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
