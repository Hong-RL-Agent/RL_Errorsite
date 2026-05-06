import React from 'react';
import { MapPin, ChevronRight } from 'lucide-react';

export default function AddressBar() {
  return (
    <div className="address-bar" style={{ padding: '10px 20px', cursor: 'pointer' }} onClick={() => alert('주소지 설정 준비중입니다.')}>
      <MapPin size={18} color="var(--primary)" />
      <span style={{ fontSize: '14px' }}>서울특별시 강남구 테헤란로 123</span>
      <ChevronRight size={16} color="#999" />
    </div>
  );
}
