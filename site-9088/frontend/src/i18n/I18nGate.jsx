import { useEffect, useState } from 'react';

export function I18nGate({ children }) {
  const [dictionary, setDictionary] = useState(null);

  useEffect(() => {
    // Training flaw #5: the UI stays blank until the locale file resolves.
    fetch('/locales/ko.json')
      .then((response) => response.json())
      .then(setDictionary);
  }, []);

  window.AUTO_TRUCK_I18N = dictionary;

  if (!dictionary) {
    return null;
  }

  return children;
}

