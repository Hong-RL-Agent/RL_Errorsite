import React, { useCallback, useEffect, useState } from 'react';
import { api, assetUrl } from '../api';
import { useCompare } from '../context/CompareContext';
import { useSearch } from '../context/SearchContext';
import RecentStrip from '../components/RecentStrip';

const TYPE_LABEL = {
  search: '검색', view: '상품 조회', compare_add: '비교 담기', compare_remove: '비교 제거', compare_save: '비교 저장',
  compare_load: '비교 불러오기', compare_delete: '비교 삭제', open_compare: '비교 화면 열기', return_to_search: '검색 복귀',
};

function SavedList({ title, list, onLoad, onDelete }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {list.length === 0 && <p className="muted">저장된 비교가 없어요.</p>}
      <ul className="saved-list">
        {list.map((c) => (
          <li key={c.id}>
            <div className="thumbs">{c.products.slice(0, 4).map((p) => (<img key={p.id} src={assetUrl(p.thumbnailUrl)} alt="" />))}</div>
            <div className="meta"><b>{c.name}</b><span className="muted">{c.productCount}개 상품 · {c.products[0] ? c.products[0].category.name : ''}</span></div>
            <div className="actions">
              <button type="button" className="btn btn-outline" onClick={() => onLoad(c)}>불러오기</button>
              {onDelete && <button type="button" className="btn btn-ghost" onClick={() => onDelete(c)}>삭제</button>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function LibraryPage({ navigate }) {
  const { replaceWith, setNotice } = useCompare();
  const { setCategory } = useSearch();
  const [mine, setMine] = useState([]);
  const [community, setCommunity] = useState([]);
  const [searches, setSearches] = useState([]);
  const [activity, setActivity] = useState([]);

  const reload = useCallback(() => {
    api.listComparisons('mine').then((r) => setMine(r.data)).catch(() => {});
    api.listComparisons('community', 8).then((r) => setCommunity(r.data)).catch(() => {});
    api.searchHistory().then((r) => setSearches(r.data)).catch(() => {});
    api.activity().then((r) => setActivity(r.data)).catch(() => {});
  }, []);
  useEffect(() => { reload(); }, [reload]);

  const onLoad = async (c) => {
    const ok = await replaceWith(c.productIds, c.name);
    if (ok) navigate('/compare');
  };
  const onDelete = async (c) => {
    try { await api.deleteComparison(c.id); setNotice('저장한 비교를 삭제했어요.'); reload(); } catch (e) { setNotice(e.message); }
  };

  return (
    <div className="library">
      <div className="results-head"><div><h1>내 비교함</h1><p className="muted">저장한 비교, 최근 본 상품, 검색·비교 활동을 한곳에서 확인하세요.</p></div></div>
      <SavedList title="저장한 비교 목록" list={mine} onLoad={onLoad} onDelete={onDelete} />
      <SavedList title="인기 저장 비교" list={community} onLoad={onLoad} />
      <RecentStrip onOpen={(id) => navigate(`/product/${id}`)} refreshKey="library" />
      <div className="detail-grid">
        <section className="panel">
          <h2>최근 검색 기록</h2>
          {searches.length === 0 && <p className="muted">검색 기록이 없어요.</p>}
          <ul className="log-list">
            {searches.map((s) => (
              <li key={s.id}><span>{s.keyword}</span><span className="muted">{s.resultCount}건</span></li>
            ))}
          </ul>
        </section>
        <section className="panel">
          <h2>검색 및 비교 활동 로그</h2>
          {activity.length === 0 && <p className="muted">기록된 활동이 없어요.</p>}
          <ul className="log-list">
            {activity.map((a) => (
              <li key={a.id}><span><em className="tag">{TYPE_LABEL[a.type] || a.type}</em>{a.detail}</span><span className="muted">{new Date(a.createdAt).toLocaleTimeString('ko-KR')}</span></li>
            ))}
          </ul>
        </section>
      </div>
      <p><button type="button" className="link-btn" onClick={() => { setCategory(null); navigate('/'); }}>상품 검색으로 이동</button></p>
    </div>
  );
}
