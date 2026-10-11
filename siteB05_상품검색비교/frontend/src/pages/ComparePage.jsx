import React, { useMemo, useState } from 'react';
import { logAction, won } from '../api';
import { useCompare } from '../context/CompareContext';
import { useSearch } from '../context/SearchContext';
import ComparisonTable from '../components/ComparisonTable';
import PriceBars from '../components/PriceBars';
import ProsCons from '../components/ProsCons';

function describeConditions(f, brandNames) {
  const parts = [];
  if (f.category) parts.push(f.category);
  if (f.query) parts.push(`검색어 ${f.query}`);
  if (f.minPrice !== null || f.maxPrice !== null) parts.push(`가격 ${f.minPrice !== null ? won(f.minPrice) : '최저'} ~ ${f.maxPrice !== null ? won(f.maxPrice) : '최고'}`);
  if (f.brands.length) parts.push(`브랜드 ${f.brands.length}개`);
  Object.entries(f.specs).forEach(([k, v]) => parts.push(`${k}: ${v.join(', ')}`));
  return parts;
}

export default function ComparePage({ navigate }) {
  const { items, summary, removeProduct, saveCurrent } = useCompare();
  const { lastSearch, setCategory } = useSearch();
  const [name, setName] = useState('');

  const chips = useMemo(() => (lastSearch ? describeConditions(lastSearch) : []), [lastSearch]);
  const cheapest = useMemo(() => items.reduce((a, b) => (!a || b.price < a.price ? b : a), null), [items]);
  const topRated = useMemo(() => items.reduce((a, b) => (!a || b.rating > a.rating ? b : a), null), [items]);

  const backToSearch = () => {
    logAction('return_to_search', '');
    navigate('/');
  };

  const onSave = async (e) => {
    e.preventDefault();
    const saved = await saveCurrent(name.trim() || `비교 ${new Date().toLocaleDateString('ko-KR')}`);
    if (saved) setName('');
  };

  return (
    <div className="compare-page">
      <div className="results-head">
        <div>
          <h1>상품 비교</h1>
          <p className="muted">최대 4개 상품의 성능, 크기, 무게, 가격을 한눈에 비교해 보세요.</p>
        </div>
        <button type="button" className="btn btn-outline" data-bug-id="B05-ERR01" onClick={backToSearch}>검색 조건으로 돌아가기</button>
      </div>

      {chips.length > 0 && (
        <div className="panel condition-panel">
          <strong>이전 검색 조건</strong>
          <div>{chips.map((c) => (<span className="chip static" key={c}>{c}</span>))}</div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="empty-box">
          <p>비교할 상품이 없어요. 상품 카드의 ‘비교 담기’를 선택해 보세요.</p>
          <button type="button" className="btn btn-primary" onClick={() => { setCategory(null); navigate('/'); }}>상품 보러 가기</button>
        </div>
      ) : (
        <>
          <section className="summary-panel panel" data-bug-id="B05-ERR05" aria-label="비교 요약">
            <div className="stat"><span>비교 상품</span><b>{summary ? summary.count : '-'}개</b></div>
            <div className="stat"><span>평균 가격</span><b>{summary ? won(summary.averagePrice) : '-'}</b></div>
            <div className="stat"><span>최저 ~ 최고</span><b>{summary ? `${won(summary.minPrice)} ~ ${won(summary.maxPrice)}` : '-'}</b></div>
            <div className="stat"><span>평균 평점</span><b>{summary ? `★ ${summary.averageRating}` : '-'}</b></div>
          </section>

          <div className="highlight-cards">
            <div className="hl-card"><span>가장 저렴한 상품</span><b>{cheapest && cheapest.name}</b><em>{cheapest && won(cheapest.price)}</em></div>
            <div className="hl-card"><span>평점이 가장 높은 상품</span><b>{topRated && topRated.name}</b><em>{topRated && `★ ${topRated.rating.toFixed(1)}`}</em></div>
          </div>

          <ComparisonTable products={items} onRemove={removeProduct} onOpen={(id) => navigate(`/product/${id}`)} />

          <div className="detail-grid">
            <section className="panel"><h2>가격 비교 그래프</h2><PriceBars products={items} /></section>
            <section className="panel">
              <h2>비교 결과 저장</h2>
              <form className="save-form" onSubmit={onSave}>
                <input type="text" value={name} maxLength={40} placeholder="저장할 이름 (예: 업무용 노트북)" onChange={(e) => setName(e.target.value)} />
                <button type="submit" className="btn btn-primary">비교 저장</button>
              </form>
              <p className="muted">저장한 비교는 ‘내 비교함’에서 다시 불러올 수 있어요.</p>
            </section>
          </div>

          <section className="panel">
            <h2>상품별 장단점</h2>
            <div className="pc-grid">
              {items.map((p) => (
                <div key={p.id} className="pc-item"><h3>{p.name}</h3><ProsCons pros={p.pros} cons={p.cons} /></div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
