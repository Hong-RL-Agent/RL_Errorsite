import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, Heart } from 'lucide-react';

export default function PlayerBar({ track, isPlaying, onTogglePlay }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(p => (p >= 100 ? 0 : p + 0.5));
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Reset progress when track changes
  useEffect(() => {
    setProgress(0);
  }, [track?.id]);

  if (!track) return <div className="player-bar"></div>;

  return (
    <div className="player-bar">
      <div className="now-playing">
        <div className="np-img">{track.image}</div>
        <div className="np-info">
          <div className="np-title">{track.title}</div>
          <div className="np-artist">{track.artist}</div>
        </div>
        <button className="like-btn" style={{ marginLeft: '16px' }}>
          <Heart size={16} />
        </button>
      </div>

      <div className="player-controls">
        <div className="ctrl-buttons">
          <button style={{ color: 'var(--text-sub)' }}><Shuffle size={18} /></button>
          <button style={{ color: 'var(--text-sub)' }}><SkipBack size={20} fill="currentColor" /></button>
          <button className="btn-circle" onClick={onTogglePlay}>
            {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" style={{ marginLeft: '2px' }} />}
          </button>
          <button style={{ color: 'var(--text-sub)' }}><SkipForward size={20} fill="currentColor" /></button>
          <button style={{ color: 'var(--text-sub)' }}><Repeat size={18} /></button>
        </div>
        
        <div className="progress-bar">
          <span>0:00</span>
          <div className="progress-bg">
            <div className="progress-fg" style={{ width: `${progress}%` }}></div>
          </div>
          <span>{track.duration}</span>
        </div>
      </div>

      <div className="player-extra">
        <Volume2 size={20} />
        <div className="progress-bg" style={{ width: '80px' }}>
          <div className="progress-fg" style={{ width: '50%' }}></div>
        </div>
      </div>
    </div>
  );
}
