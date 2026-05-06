import React, { useState } from 'react';
import { Search, MapPin, Calendar, Users } from 'lucide-react';

export default function Hero() {
  const [passengers, setPassengers] = useState(1);

  return (
    <section className="hero">
      <h1>어디로 떠나시나요?</h1>
      <p>전 세계 수백만 개의 항공권과 호텔을 한 번에 비교하세요.</p>
      
      <div className="search-container">
        <div className="search-form">
          <div className="form-group">
            <label>목적지</label>
            <div className="search-input-wrap">
              <MapPin size={18} />
              <input type="text" placeholder="도시 또는 공항" />
            </div>
          </div>
          
          <div className="form-group">
            <label>체크인 - 체크아웃</label>
            <div className="search-input-wrap">
              <Calendar size={18} />
              <input type="text" placeholder="날짜 선택" />
            </div>
          </div>
          
          <div className="form-group">
            <label>인원</label>
            <div className="search-input-wrap">
              <Users size={18} />
              <select value={passengers} onChange={(e) => setPassengers(e.target.value)}>
                <option value="1">성인 1명</option>
                <option value="2">성인 2명</option>
                <option value="3">성인 3명</option>
                <option value="4">성인 4명</option>
              </select>
            </div>
          </div>
          
          {/* INTENTIONAL GUI BUG: site002-bug01
             Type: button-no-response
             Description: 날짜 선택 후 "다음 단계" 버튼을 눌러도 다음 예약 단계로 이동하지 않는다.
             Explanation: onClick 이벤트 핸들러가 연결되어 있지 않아 클릭해도 아무 반응이 없음. */}
          <button 
            className="btn-primary" 
            data-bug-id="site002-bug01"
            onClick={() => {}}
          >
            다음 단계
          </button>
        </div>
      </div>
    </section>
  );
}
