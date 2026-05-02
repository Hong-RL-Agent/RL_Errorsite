document.addEventListener('DOMContentLoaded', () => {
  let allSongs = [];
  let isPlaying = false;
  let currentSong = null;

  // Nav
  const navHome = document.getElementById('nav-home');
  const navExplore = document.getElementById('nav-explore');
  const navLibrary = document.getElementById('nav-library');

  // Views
  const homeView = document.getElementById('home-view');
  const exploreView = document.getElementById('explore-view');
  const libraryView = document.getElementById('library-view');

  // Containers
  const recommendGrid = document.getElementById('recommend-grid');
  const popularList = document.getElementById('popular-list');
  const recentList = document.getElementById('recent-list');
  const exploreSongList = document.getElementById('explore-song-list');
  const artistGrid = document.getElementById('artist-grid');
  const libraryGrid = document.getElementById('library-grid');

  // Modal
  const modalOverlay = document.getElementById('playlist-modal');
  const closeModal = document.getElementById('close-modal');
  const modalPlImg = document.getElementById('modal-pl-img');
  const modalPlTitle = document.getElementById('modal-pl-title');
  const modalPlOwner = document.getElementById('modal-pl-owner');
  const modalPlSongs = document.getElementById('modal-pl-songs');

  // Player
  const playerImg = document.getElementById('player-img');
  const playerTitle = document.getElementById('player-title');
  const playerArtist = document.getElementById('player-artist');
  const playPauseBtn = document.getElementById('play-pause-btn');
  const likeBtn = document.getElementById('like-btn');

  // Controls
  const corruptToggle = document.getElementById('corrupt-toggle');
  const testPrivateBtn = document.getElementById('test-private-btn');
  const refreshRecommendBtn = document.getElementById('refresh-recommend');
  const searchInput = document.getElementById('search-input');
  const genreTags = document.querySelectorAll('.tag-btn');
  
  const toast = document.getElementById('toast');

  function init() {
    fetchAllSongs();
    fetchPlaylists(recommendGrid);
    fetchPopularSongs();
    fetchRecentSongs();
    fetchArtists();
  }

  // API Fetches
  function fetchAllSongs() {
    fetch('/api/songs')
      .then(res => res.json())
      .then(data => {
        allSongs = data;
        renderSongList(data, exploreSongList);
      });
  }

  function fetchPlaylists(container) {
    fetch('/api/playlists')
      .then(res => res.json())
      .then(data => renderPlaylists(data, container));
  }

  // Bug 02: Network Partial Response
  function fetchPopularSongs() {
    const isCorrupt = corruptToggle.checked;
    fetch(`/api/songs?type=popular&corrupt=${isCorrupt}`)
      .then(res => res.json())
      .then(data => {
        popularList.innerHTML = '';
        data.forEach(s => {
          // If Bug 02 is active, s.title, s.artist, s.coverImage are undefined
          const cover = s.coverImage || ''; 
          const title = s.title !== undefined ? s.title : '<span class="text-danger">undefined</span>';
          const artist = s.artist !== undefined ? s.artist : 'unknown artist';
          
          const div = document.createElement('div');
          div.className = 'song-row';
          div.innerHTML = `
            <img src="${cover}" alt="cover" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'40\\' height=\\'40\\'><rect width=\\'40\\' height=\\'40\\' fill=\\'red\\'/><text x=\\'5\\' y=\\'25\\' fill=\\'white\\' font-size=\\'10\\'>Error</text></svg>'">
            <div class="song-info">
              <div class="song-title">${title}</div>
              <div class="song-artist text-xs text-muted">${artist}</div>
            </div>
            <div class="song-duration">${s.duration || '--:--'}</div>
          `;
          div.addEventListener('click', () => playSong(s));
          popularList.appendChild(div);
        });
      });
  }

  function fetchRecentSongs() {
    fetch('/api/recent')
      .then(res => res.json())
      .then(data => renderSongList(data, recentList));
  }

  function fetchArtists() {
    fetch('/api/artists')
      .then(res => res.json())
      .then(data => {
        artistGrid.innerHTML = '';
        data.forEach(a => {
          const div = document.createElement('div');
          div.innerHTML = `
            <img src="${a.image}" class="artist-img">
            <div style="font-weight:bold; color:var(--white);">${a.name}</div>
            <div class="text-xs text-muted">${a.followers} followers</div>
          `;
          artistGrid.appendChild(div);
        });
      });
  }

  // Renderers
  function renderPlaylists(data, container) {
    container.innerHTML = '';
    data.forEach(p => {
      const card = document.createElement('div');
      card.className = 'playlist-card';
      card.innerHTML = `
        <img src="${p.cover}" class="playlist-cover">
        <div class="playlist-title">${p.title}</div>
        <div class="text-xs text-muted">by ${p.owner}</div>
      `;
      // Bug 01 manifestation inside openPlaylist
      card.addEventListener('click', () => openPlaylist(p.id));
      container.appendChild(card);
    });
  }

  function renderSongList(data, container) {
    container.innerHTML = '';
    if(data.length === 0) {
      container.innerHTML = '<div class="text-muted p-2">곡이 없습니다.</div>';
      return;
    }
    data.forEach(s => {
      const div = document.createElement('div');
      div.className = 'song-row';
      div.innerHTML = `
        <img src="${s.coverImage}" alt="cover">
        <div class="song-info">
          <div class="song-title">${s.title}</div>
          <div class="song-artist text-xs text-muted">${s.artist}</div>
        </div>
        <div class="song-duration">${s.duration}</div>
      `;
      div.addEventListener('click', () => playSong(s));
      container.appendChild(div);
    });
  }

  // Playlist Details (Bug 01)
  function openPlaylist(id) {
    fetch(`/api/playlists/${id}`)
      .then(res => {
        if(!res.ok) throw new Error('Failed to load playlist');
        return res.json();
      })
      .then(p => {
        modalPlImg.src = p.cover;
        modalPlTitle.innerText = p.title;
        modalPlOwner.innerText = p.owner;
        
        // Fetch songs for this playlist (Bug 01: returns wrong songs)
        fetch(`/api/playlists/${id}/songs`)
          .then(res => res.json())
          .then(songs => {
            renderSongList(songs, modalPlSongs);
            modalOverlay.style.display = 'flex';
          });
      })
      .catch(err => showToast(err.message));
  }

  closeModal.addEventListener('click', () => { modalOverlay.style.display = 'none'; });

  // Bug 03: Security Access Control Failure
  testPrivateBtn.addEventListener('click', () => {
    showToast('ID 999 비공개 플레이리스트 조회를 시도합니다...');
    openPlaylist('999'); // Should be blocked, but API allows it
  });

  // Search & Filter
  function applyFilters() {
    const term = searchInput.value.toLowerCase();
    const activeTag = document.querySelector('.tag-btn.active').dataset.genre;

    const filtered = allSongs.filter(s => {
      const matchTerm = s.title.toLowerCase().includes(term) || s.artist.toLowerCase().includes(term);
      const matchGenre = activeTag === 'all' || s.genre === activeTag;
      return matchTerm && matchGenre;
    });
    renderSongList(filtered, exploreSongList);
  }

  searchInput.addEventListener('input', applyFilters);
  genreTags.forEach(btn => {
    btn.addEventListener('click', () => {
      genreTags.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
    });
  });

  // Player controls
  function playSong(s) {
    currentSong = s;
    playerImg.src = s.coverImage || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="gray"/></svg>';
    playerTitle.innerText = s.title || 'Unknown Title';
    playerArtist.innerText = s.artist || 'Unknown Artist';
    
    isPlaying = true;
    playPauseBtn.innerText = '⏸';
    showToast(`재생 중: ${playerTitle.innerText}`);
  }

  playPauseBtn.addEventListener('click', () => {
    if(!currentSong) return;
    isPlaying = !isPlaying;
    playPauseBtn.innerText = isPlaying ? '⏸' : '▶';
  });

  likeBtn.addEventListener('click', () => {
    likeBtn.classList.toggle('active');
    likeBtn.innerText = likeBtn.classList.contains('active') ? '♥' : '♡';
  });

  // Tab Navigation
  function switchTab(navBtn, viewEl) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    navBtn.classList.add('active');
    
    [homeView, exploreView, libraryView].forEach(v => v.style.display = 'none');
    viewEl.style.display = 'block';
  }

  navHome.addEventListener('click', () => switchTab(navHome, homeView));
  navExplore.addEventListener('click', () => switchTab(navExplore, exploreView));
  navLibrary.addEventListener('click', () => {
    switchTab(navLibrary, libraryView);
    fetchPlaylists(libraryGrid); // Fetch library again
  });

  // Extras
  corruptToggle.addEventListener('change', () => {
    fetchPopularSongs();
    showToast(corruptToggle.checked ? '인기 곡 응답 데이터를 손상시킵니다.' : '응답 데이터를 정상 복구합니다.');
  });

  refreshRecommendBtn.addEventListener('click', () => {
    showToast('추천 알고리즘을 갱신했습니다.');
    // Just re-render for effect
    fetchPlaylists(recommendGrid);
  });

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
