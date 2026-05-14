import React from 'react';
import { ShoppingCart, LayoutGrid, User, Search, BarChart3 } from 'lucide-react';

export default function Header({ compareCount, onCompareClick, isCompareOpen, onSearch }) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <header>
      <div className="container flex justify-between items-center">
        <div className="flex items-center gap-20">
          <div className="logo flex items-center gap-10" style={{ fontSize: '24px', fontWeight: 800 }}>
            <BarChart3 color="#00e5ff" />
            <span>TECHSTORE</span>
          </div>
          
          <div className="flex items-center gap-20" style={{ fontSize: '14px', fontWeight: 600 }}>
            <button onClick={() => alert('준비중입니다.')} className="flex items-center gap-10" style={{ color: 'white' }}>
              <LayoutGrid size={18} /> 카테고리
            </button>
          </div>
        </div>

        <form className="search-bar" onSubmit={handleSearchSubmit}>
          <input 
            type="text" 
            placeholder="제품명, 브랜드 또는 키워드 검색..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" style={{ position: 'absolute', right: '15px', top: '10px', color: 'white' }}>
            <Search size={20} />
          </button>
        </form>

        <div className="flex items-center gap-20">
          {/* INTENTIONAL GUI BUG: site021-bug01
              Type: aria-state-mismatch
              Description: 비교함 패널은 열리지만 aria-expanded 값이 실제 open state와 동기화되지 않음. */}
          <button 
            data-bug-id="site021-bug01"
            className="btn btn-dark flex items-center" 
            onClick={onCompareClick}
            aria-label="비교함 열기"
            aria-expanded="false" // Should be {isCompareOpen ? 'true' : 'false'}
          >
            비교함
            {/* INTENTIONAL GUI BUG: site021-bug02
                Type: dynamic-update-announcement-missing
                Description: 비교함 수량은 변경되지만 동적 업데이트를 알리는 상태 메시지나 aria-live 영역이 없음. */}
            <span data-bug-id="site021-bug02" className="badge">{compareCount}</span>
          </button>
          
          <button onClick={() => alert('준비중입니다.')} style={{ color: 'white' }}>
            <ShoppingCart size={24} />
          </button>
          <button onClick={() => alert('준비중입니다.')} style={{ color: 'white' }}>
            <User size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}
