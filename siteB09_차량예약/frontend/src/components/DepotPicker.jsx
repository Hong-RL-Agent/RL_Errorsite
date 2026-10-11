import React, { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import { useDebounce } from '../hooks/useDebounce';

// 지점/지역 검색 입력 (자동완성)
export default function DepotPicker({ label, value, onPick, placeholder }) {
  const [text, setText] = useState(value ? `${value.city} ${value.name}` : '');
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const q = useDebounce(text, 200);
  const box = useRef(null);

  useEffect(() => { setText(value ? `${value.city} ${value.name}` : ''); }, [value]);
  useEffect(() => {
    if (!open) return undefined;
    let alive = true;
    const term = value && q === `${value.city} ${value.name}` ? '' : q;
    api.depots({ q: term }).then((r) => alive && setOptions(r.data)).catch(() => {});
    return () => { alive = false; };
  }, [q, open, value]);
  useEffect(() => {
    const close = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div className="field depot-picker" ref={box}>
      <label>
        <span>{label}</span>
        <input
          type="text"
          value={text}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onChange={(e) => { setText(e.target.value); setOpen(true); if (value) onPick(null); }}
          autoComplete="off"
        />
      </label>
      {open && (
        <ul className="depot-list" role="listbox">
          {options.length === 0 && <li className="muted pad">일치하는 지점이 없어요.</li>}
          {options.map((d) => (
            <li key={d.id}>
              <button type="button" role="option" onClick={() => { onPick(d); setOpen(false); }}>
                <b>{d.name}</b><span>{d.city} · {d.hours}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
