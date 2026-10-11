import { useEffect, useRef, useState } from 'react';

function parse() {
  const h = window.location.hash.replace(/^#/, '') || '/';
  const parts = h.split('/').filter(Boolean);
  return { name: parts[0] || 'home', id: parts[1] ? Number(parts[1]) : null };
}

export const go = (path) => {
  window.location.hash = path;
};

export function useHashRoute() {
  const [route, setRoute] = useState(parse);
  const prevName = useRef(route.name);

  useEffect(() => {
    const onChange = () => {
      const next = parse();
      if (next.name !== prevName.current) window.scrollTo(0, 0);
      prevName.current = next.name;
      setRoute(next);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}
