import { useCallback, useEffect, useState } from 'react';

function parse(hash) {
  const path = (hash || '').replace(/^#/, '') || '/';
  const parts = path.split('/').filter(Boolean);
  if (parts[0] === 'product' && parts[1]) return { name: 'product', id: parts[1] };
  if (parts[0] === 'compare') return { name: 'compare' };
  if (parts[0] === 'browse') return { name: 'browse' };
  if (parts[0] === 'library') return { name: 'library' };
  return { name: 'search' };
}

export function useHashRoute() {
  const [route, setRoute] = useState(() => parse(window.location.hash));
  useEffect(() => {
    const onChange = () => { setRoute(parse(window.location.hash)); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  const navigate = useCallback((path) => {
    const next = `#${path}`;
    if (window.location.hash === next) setRoute(parse(next));
    else window.location.hash = next;
  }, []);
  return [route, navigate];
}
