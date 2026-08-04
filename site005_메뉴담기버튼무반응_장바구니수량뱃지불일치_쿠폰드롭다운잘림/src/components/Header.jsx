import React from 'react';
import { MapPin, ChevronDown, Search } from 'lucide-react';

export default function Header({ address, setAddress }) {
  return (
    <header className="header">
      <div className="address-selector" onClick={() => {
        const newAddr = prompt('배달 받을 주소를 입력하세요:', address);
        if (newAddr) setAddress(newAddr);
      }}>
        <MapPin color="var(--primary)" size={20} />
        <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {address}
        </span>
        <ChevronDown size={16} />
      </div>
      <div>
        <button style={{ background: 'none' }}>
          <Search size={24} />
        </button>
      </div>
    </header>
  );
}
