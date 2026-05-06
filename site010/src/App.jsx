import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.jsx';
import MainContent from './components/MainContent.jsx';
import PlayerBar from './components/PlayerBar.jsx';

function App() {
  const [playlists, setPlaylists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetch('/api/playlists')
      .then(res => res.json())
      .then(data => setPlaylists(data.data));

    fetch('/api/tracks')
      .then(res => res.json())
      .then(data => {
        setTracks(data.data);
        if (data.data.length > 0) {
          setCurrentTrack(data.data[0]); // default playing
        }
      });
  }, []);

  const handlePlayTrack = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="app-wrapper">
      <div className="top-section">
        <Sidebar playlists={playlists} />
        <MainContent 
          tracks={tracks} 
          currentTrack={currentTrack} 
          onPlay={handlePlayTrack} 
        />
      </div>
      <PlayerBar 
        track={currentTrack} 
        isPlaying={isPlaying} 
        onTogglePlay={togglePlayPause} 
      />
    </div>
  );
}

export default App;
