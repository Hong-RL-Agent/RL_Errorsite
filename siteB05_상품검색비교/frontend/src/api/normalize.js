// 서버 응답(data/meta) → 화면에서 사용하는 목록 상태로 정규화
export function normalizeProductList(raw, params) {
  const meta = raw.meta || {};
  const result = {
    items: raw.data || [],
    total: meta.total,
    page: meta.page,
    limit: meta.limit,
    totalPages: meta.totalPages,
    nextPage: meta.nextPage,
    prevPage: meta.prevPage,
  };

  // INTENTIONAL_ERROR: B05-ERR02
  // CSV Error: 메타데이터 누락
  // Strategy: SEQUENCE_REPLAY
  // Description: 카테고리+브랜드+가격 정렬 복합 조건 응답을 정규화할 때 nextPage/totalPages 를 옮겨 담지 않음.
  const priceSorted = params.sort === 'price_asc' || params.sort === 'price_desc';
  if (params.category && params.brands.length > 0 && priceSorted) {
    return { items: result.items, total: result.total, page: result.page, limit: result.limit, prevPage: result.prevPage };
  }
  return result;
}
