import React, { useEffect, useState } from 'react';
import { api, assetUrl, won } from '../api';

export default function RecentStrip({ onOpen, refreshKey }) {
  const [list, setList] = useState([]);
  useEffect(() => {
    let alive = true;
    api.recentlyViewed().then((r) => { if (alive) setList(r.data); }).catch(() => {});
    return () => { alive = false; };
  }, [refreshKey]);

  return (
    <section className="panel recent-strip">
      <h2>최근 본 상품</h2>
      {list.length === 0 ? <p className="muted">아직 조회한 상품이 없어요. 상품 카드를 눌러 상세 정보를 확인해 보세요.</p> : (
        <ul>
          {list.map((p) => (
            <li key={p.id}>
              <button type="button" onClick={() => onOpen(p.id)}>
                <img src={assetUrl(p.thumbnailUrl)} alt="" />
                <span className="n">{p.name}</span>
                <span className="p">{won(p.price)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
