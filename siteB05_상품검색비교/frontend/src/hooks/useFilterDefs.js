import { useEffect, useState } from 'react';
import { api } from '../api';

const EMPTY = { priceRange: { min: 0, max: 0 }, brands: [], specs: [] };

export function useFilterDefs(category) {
  const [defs, setDefs] = useState(EMPTY);
  useEffect(() => {
    let alive = true;
    api.filters(category).then((r) => { if (alive) setDefs(r.data); }).catch(() => {});
    return () => { alive = false; };
  }, [category]);
  return defs;
}
