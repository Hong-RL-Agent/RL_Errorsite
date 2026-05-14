import React from 'react';
import { Home, Search, Library, PlusSquare, Heart } from 'lucide-react';

export default function Sidebar({ playlists }) {
  // INTENTIONAL GUI BUG: site010-bug02
  // Type: component-rendering
  // Description: 플레이리스트 항목 순서가 API 응답 순서와 다르게 잘못 렌더링된다.
  // Explanation: 원본 데이터를 무작위로 섞거나 역순으로 렌더링하여 데이터 일관성 파괴 (여기서는 의도적 역순 정렬).
  
  const renderedPlaylists = [...playlists].reverse();

  return (
    <div className="sidebar">
      <div className="brand">
        <div style={{ width: 32, height: 32, background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black' }}>
          ♫
        </div>
        SoundWave
      </div>

      <div className="nav-links">
        <div className="nav-link active"><Home size={24} /> Home</div>
        <div className="nav-link"><Search size={24} /> Search</div>
        <div className="nav-link"><Library size={24} /> Your Library</div>
      </div>

      <div className="nav-links" style={{ marginTop: '16px' }}>
        <div className="nav-link"><PlusSquare size={24} /> Create Playlist</div>
        <div className="nav-link"><Heart size={24} fill="currentColor" color="var(--primary)" /> Liked Songs</div>
      </div>

      <div style={{ height: '1px', background: 'var(--border)', margin: '16px 0' }}></div>

      <div className="playlist-section" data-bug-id="site010-bug02">
        <div className="playlist-title">PLAYLISTS</div>
        {renderedPlaylists.map(pl => (
          <div key={pl.id} className="playlist-item">
            {pl.name}
          </div>
        ))}
      </div>
    </div>
  );
}
