import React from 'react';
import { Play, Pause, Heart, MoreHorizontal, Clock } from 'lucide-react';

export default function MainContent({ tracks, currentTrack, onPlay }) {
  const [likedTracks, setLikedTracks] = React.useState([102, 105]); // initial mock

  const toggleLike = (id) => {
    setLikedTracks(prev => prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]);
  };

  return (
    <div className="main-view" data-bug-id="site010-bug03">
      <div className="view-header">Global Top 50</div>
      
      <table className="track-table">
        <thead>
          <tr>
            <th style={{ width: '40px' }}>#</th>
            <th>Title</th>
            <th>Album</th>
            <th style={{ width: '60px', textAlign: 'center' }}><Clock size={16} /></th>
          </tr>
        </thead>
        <tbody>
          {tracks.map((track, idx) => {
            const isPlaying = currentTrack?.id === track.id;
            const isLiked = likedTracks.includes(track.id);
            
            // INTENTIONAL GUI BUG: site010-bug01
            // Type: button-no-response
            // Description: 특정 트랙(예: 두 번째 트랙)의 재생 버튼이 클릭되어도 현재 재생 정보가 바뀌지 않는다.
            // Explanation: idx === 1 인 곡(Blinding Lights)의 플레이 버튼 onClick을 빈 함수로 만들어 무반응 유발.
            const isBuggyTrack = idx === 1;

            return (
              <tr key={track.id} className={`track-row ${isPlaying ? 'playing' : ''}`}>
                <td style={{ textAlign: 'center' }}>
                  <button 
                    className="play-btn" 
                    data-bug-id={isBuggyTrack ? "site010-bug01" : undefined}
                    onClick={() => {
                      if (isBuggyTrack) {
                        // Do nothing (Bug 01)
                      } else {
                        onPlay(track);
                      }
                    }}
                  >
                    {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
                  </button>
                  <span style={{ display: 'none' /* toggle logic simplifies to hover */ }}>{idx + 1}</span>
                </td>
                <td>
                  <div className="track-info-cell">
                    <div className="track-img">{track.image}</div>
                    <div className="track-details">
                      <span className="track-title">{track.title}</span>
                      <span className="track-artist">{track.artist}</span>
                    </div>
                  </div>
                </td>
                <td style={{ color: 'var(--text-sub)' }}>{track.album}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button 
                      className={`like-btn ${isLiked ? 'liked' : ''}`}
                      onClick={() => toggleLike(track.id)}
                    >
                      <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                    </button>
                    <span style={{ color: 'var(--text-sub)' }}>{track.duration}</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
