import React, { useEffect, useState } from 'react';
import { api, won } from '../api';
import { useCompare } from '../context/CompareContext';
import ImageGallery from '../components/ImageGallery';
import PriceChart from '../components/PriceChart';
import ProsCons from '../components/ProsCons';

export default function ProductDetailPage({ id, navigate }) {
  const { isSelected, toggleProduct } = useCompare();
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [history, setHistory] = useState({ data: [], meta: null });
  const [reviews, setReviews] = useState({ data: [], meta: null });
  const [reviewPage, setReviewPage] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setProduct(null); setError(''); setReviewPage(1);
    Promise.all([api.product(id), api.productImages(id), api.priceHistory(id)])
      .then(([p, im, ph]) => {
        if (!alive) return;
        setProduct(p.data); setImages(im.data); setHistory(ph);
        api.recordView(id).catch(() => {});
      })
      .catch((e) => alive && setError(e.status === 404 ? '존재하지 않는 상품입니다.' : e.message));
    return () => { alive = false; };
  }, [id]);

  useEffect(() => {
    let alive = true;
    api.productReviews(id, reviewPage).then((r) => alive && setReviews(r)).catch(() => {});
    return () => { alive = false; };
  }, [id, reviewPage]);

  if (error) return <div className="empty-box"><p>{error}</p><button type="button" className="btn" onClick={() => navigate('/')}>검색으로 돌아가기</button></div>;
  if (!product) return <p className="muted pad">상품 정보를 불러오는 중…</p>;

  const selected = isSelected(product.id);
  return (
    <div className="detail">
      <button type="button" className="link-btn back" onClick={() => window.history.back()}>‹ 이전으로</button>
      <div className="detail-top">
        <ImageGallery key={product.id} images={images} productName={product.name} />
        <div className="detail-info">
          <p className="card-brand">{product.brand.name} · {product.category.name}</p>
          <h1>{product.name}</h1>
          <p className="card-rating"><span className="star">★</span> {product.rating.toFixed(1)} <span className="muted">리뷰 {product.reviewCount.toLocaleString('ko-KR')}</span></p>
          <p className="detail-price">{won(product.price)} <span className="muted">최저가</span></p>
          <p className="summary">{product.summary}</p>
          <ul className="card-specs big">
            {product.keySpecs.map((s) => (<li key={s.key}><span>{s.label}</span>{s.value}</li>))}
          </ul>
          <button type="button" className={`btn ${selected ? 'btn-outline' : 'btn-primary'}`} onClick={() => toggleProduct(product)}>
            {selected ? '비교 목록에서 제거' : '비교 목록에 담기'}
          </button>
          <table className="offer-table">
            <thead><tr><th>판매처</th><th>가격</th><th>배송비</th><th>재고</th></tr></thead>
            <tbody>
              {product.offers.map((o) => (
                <tr key={o.seller}><td>{o.seller}</td><td>{won(o.price)}</td><td>{o.shipping ? won(o.shipping) : '무료'}</td><td>{o.inStock ? '있음' : '품절'}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="detail-grid">
        <section className="panel">
          <h2>상세 스펙</h2>
          <table className="spec-table"><tbody>
            {product.specs.map((s) => (<tr key={s.key}><th>{s.label}</th><td>{s.value}</td></tr>))}
          </tbody></table>
        </section>
        <section className="panel">
          <h2>가격 추이</h2>
          <PriceChart points={history.data} />
          {history.meta && <p className="muted">최근 8개월 최저 {won(history.meta.min)} · 최고 {won(history.meta.max)}</p>}
        </section>
      </div>

      <section className="panel">
        <h2>장단점</h2>
        <ProsCons pros={product.pros} cons={product.cons} />
      </section>

      <section className="panel">
        <h2>리뷰 {reviews.meta && <span className="muted">평균 ★ {reviews.meta.average ?? '-'} · {reviews.meta.total}건</span>}</h2>
        {reviews.data.length === 0 && <p className="muted">등록된 리뷰가 없습니다.</p>}
        <ul className="review-list">
          {reviews.data.map((r) => (
            <li key={r.id}>
              <p><strong>{'★'.repeat(r.rating)}</strong> {r.title}</p>
              <p className="muted">{r.body} · {r.author}</p>
            </li>
          ))}
        </ul>
        {reviews.meta && reviews.meta.totalPages > 1 && (
          <div className="pagination">
            <button type="button" disabled={reviewPage <= 1} onClick={() => setReviewPage((p) => p - 1)}>이전 리뷰</button>
            <span className="muted">{reviewPage} / {reviews.meta.totalPages}</span>
            <button type="button" disabled={reviewPage >= reviews.meta.totalPages} onClick={() => setReviewPage((p) => p + 1)}>다음 리뷰</button>
          </div>
        )}
      </section>
    </div>
  );
}
