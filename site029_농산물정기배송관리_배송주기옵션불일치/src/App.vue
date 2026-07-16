<template>
  <div class="wavebox-app">
    <!-- Top Search Header -->
    <header class="app-header">
      <div class="logo-group">
        <svg class="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
        <span class="logo-title">WaveBox</span>
        <span class="logo-subtitle">음악 검색 및 커스텀 믹스</span>
      </div>

      <div class="search-box">
        <input 
          type="text" 
          placeholder="곡명, 아티스트명으로 스마트 검색..." 
          v-model="searchQuery"
          class="navbar-search"
        />
      </div>
    </header>

    <!-- Workspace Grid -->
    <div class="workspace-grid">
      
      <!-- Left sidebar Library Navigator -->
      <aside class="panel-section library-sidebar">
        <div class="panel-header">
          <h3>📚 나의 음악 보관소</h3>
        </div>

        <div class="sidebar-links-stack">
          <button 
            type="button" 
            @click="selectedPlaylistId = null"
            class="lib-tab-btn"
            :class="{ active: selectedPlaylistId === null }"
          >
            🎵 전체 음악 카탈로그
          </button>
          
          <div class="playlist-header-row">
            <span>나의 플레이리스트</span>
          </div>

          <div class="playlists-stack">
            <div 
              v-for="play in playlists" 
              :key="play.id"
              class="playlist-item-row"
              :class="{ active: selectedPlaylistId === play.id }"
              @click="selectPlaylist(play.id)"
            >
              <span class="icon">💿</span>
              <span class="name">{{ play.name }}</span>
              <button 
                type="button" 
                @click.stop="deletePlaylist(play.id)" 
                class="del-play-btn"
                title="플레이리스트 제거 (Error 4 적용)"
              >
                &times;
              </button>
            </div>
          </div>
        </div>

        <!-- Create new playlist (Error 3 targets 20-character names) -->
        <div class="playlist-creator-box">
          <h4>💿 플레이리스트 생성</h4>
          <form @submit.prevent="createNewPlaylist" class="create-playlist-form">
            <input 
              type="text" 
              placeholder="플레이리스트명 (정확히 20자 시 500에러)" 
              v-model="newPlaylistName"
              class="play-input"
            />
            <button type="submit" class="play-submit-btn">+</button>
          </form>
        </div>
      </aside>

      <!-- Center tracks and album layout -->
      <main class="center-catalog-workspace">
        
        <!-- Genre Filter Row -->
        <section class="panel-section genre-filters-panel" v-if="selectedPlaylistId === null">
          <div class="genre-tabs">
            <button 
              type="button" 
              v-for="genre in ['All', 'Lofi', 'Pop', 'Synthwave', 'Indie', 'EDM', 'Jazz', 'Classical', 'Rock', 'R&B', 'Latin', 'Ambient', 'Hip-Hop']"
              :key="genre"
              @click="selectedGenre = genre"
              class="genre-tab-btn"
              :class="{ active: selectedGenre === genre }"
            >
              {{ genre === 'All' ? '전체 장르' : genre }}
            </button>
          </div>
        </section>

        <!-- Dynamic tracks list -->
        <section class="panel-section tracks-list-panel">
          <div class="panel-header-row">
            <h2 v-if="selectedPlaylistId === null">
              🎛️ 개설 트랙 풀 ({{ filteredTracks.length }}곡)
            </h2>
            <h2 v-else>
              💿 플레이리스트 수록곡: {{ activePlaylistDetail?.name }}
            </h2>
          </div>

          <div class="tracks-table">
            <div class="table-header">
              <span class="num">#</span>
              <span class="title">곡 제목</span>
              <span class="artist">아티스트</span>
              <span class="album">앨범</span>
              <span class="genre">장르</span>
              <span class="dur">시간</span>
              <span class="act">액션</span>
            </div>

            <div class="table-body">
              <div 
                v-for="(song, i) in displaySongs" 
                :key="song.id"
                class="song-row-card"
                :class="{ 'now-playing': playingTrack?.id === song.id }"
                @click="loadAndPlayTrack(song)"
              >
                <span class="num">
                  <span v-if="playingTrack?.id === song.id && isPlaying" class="playing-gif">🔊</span>
                  <span v-else>{{ i + 1 }}</span>
                </span>

                <div class="title-cell">
                  <div class="svg-cover-box">
                    <span class="cov-ic">🎵</span>
                  </div>
                  <span class="title-txt">{{ song.title }}</span>
                </div>

                <span class="artist-cell">{{ song.artist }}</span>
                <span class="album-cell">{{ song.album }}</span>
                <span class="genre-cell">{{ song.genre }}</span>
                <span class="dur-cell">{{ song.duration }}</span>

                <div class="actions-cell" @click.stop>
                  <!-- Error 2 Check: Toggle Favorite utilizing filtered list Index -->
                  <button 
                    type="button" 
                    @click="toggleLike(i, song.id)"
                    class="like-btn"
                    :class="{ loved: likedIndexes.includes(i) }"
                  >
                    {{ likedIndexes.includes(i) ? '❤️' : '♡' }}
                  </button>

                  <select 
                    @change="addTrackToPlaylist(song.id, $event.target.value); $event.target.value = ''"
                    class="track-add-playlist-select"
                  >
                    <option value="">담기</option>
                    <option v-for="p in playlists" :key="p.id" :value="p.id">
                      {{ p.name }}
                    </option>
                  </select>
                </div>
              </div>

              <div v-if="displaySongs.length === 0" class="empty-placeholder">
                선택된 재생 목록 또는 장르에 해당하는 음악이 등록되어 있지 않습니다.
              </div>
            </div>
          </div>
        </section>
      </main>

      <!-- Right Play queue & Recently Played -->
      <aside class="right-queue-column">
        
        <!-- Active Play Queue list (Error 1 Target) -->
        <section class="panel-section play-queue-panel">
          <div class="panel-header">
            <h3>🎚️ 실시간 재생 대기열 ({{ visualQueue.length }}곡)</h3>
          </div>

          <div class="queue-scroller">
            <div 
              v-for="(item, idx) in visualQueue" 
              :key="`${item.id}-${idx}`"
              class="queue-item-card"
              :class="{ active: playingTrack?.id === item.id }"
            >
              <div class="info">
                <h4>{{ item.title }}</h4>
                <p>{{ item.artist }}</p>
              </div>

              <div class="reorder-btns">
                <button 
                  type="button" 
                  @click="moveTrackUpInQueue(idx)" 
                  class="reorder-btn"
                  title="위로 재생 순서 변경 (Error 1 검증)"
                >
                  ▲
                </button>
                <button 
                  type="button" 
                  @click="removeFromQueue(idx)" 
                  class="reorder-btn remove"
                >
                  &times;
                </button>
              </div>
            </div>

            <div v-if="visualQueue.length === 0" class="empty-placeholder">
              대기열이 비어 있습니다. 곡을 클릭해 재생 목록에 로드해 주십시오.
            </div>
          </div>
        </section>

        <!-- Recently Played list (Error 4 reference target) -->
        <section class="panel-section recently-played-panel">
          <div class="panel-header">
            <h3>📜 최근 감상 내역</h3>
          </div>

          <div class="recents-list">
            <div 
              v-for="rec in recentlyPlayed" 
              :key="rec.id"
              class="recent-row"
            >
              <span class="type-badge" :class="rec.type">{{ rec.type === 'playlist' ? '리스트' : '싱글' }}</span>
              <!-- Error 4: If playlist was deleted, rec.title remains, but its targetId does not exist -->
              <span class="title">{{ rec.title }}</span>
              <span class="time">{{ rec.date }}</span>
            </div>
          </div>
        </section>

      </aside>

    </div>

    <!-- Bottom Fixed Player Bar -->
    <footer class="app-player-bar">
      <div class="player-left-info">
        <div class="mini-cover">
          <svg class="disc-svg" :class="{ rotating: isPlaying }" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="18" fill="#1e293b" />
            <circle cx="20" cy="20" r="8" fill="#06b6d4" />
            <circle cx="20" cy="20" r="2" fill="#fff" />
          </svg>
        </div>
        <div class="track-meta" v-if="playingTrack">
          <h4>{{ playingTrack.title }}</h4>
          <p>{{ playingTrack.artist }} - {{ playingTrack.genre }}</p>
        </div>
        <div class="track-meta" v-else>
          <h4>재생 중인 곡 없음</h4>
          <p>노래를 선택하여 재생 목록에 올리십시오.</p>
        </div>
      </div>

      <div class="player-center-controls">
        <div class="btn-controls">
          <button type="button" @click="playPrevSong" class="control-btn">⏮</button>
          <button type="button" @click="togglePlay" class="control-btn play">
            {{ isPlaying ? '⏸' : '▶' }}
          </button>
          <button type="button" @click="playNextSong" class="control-btn">⏭</button>
        </div>

        <div class="progress-bar-row">
          <span class="timer">0:{{ String(Math.floor(playProgress * 0.03)).padStart(2, '0') }}</span>
          <div class="progress-track" @click="seekProgress">
            <div class="progress-fill" :style="{ width: playProgress + '%' }"></div>
          </div>
          <span class="timer" v-if="playingTrack">{{ playingTrack.duration }}</span>
          <span class="timer" v-else>0:00</span>
        </div>
      </div>

      <div class="player-right-options">
        <span class="vol-icon">🔊</span>
        <div class="vol-slider">
          <div class="vol-fill" style="width: 80%"></div>
        </div>
      </div>
    </footer>

    <!-- Toast Alerts -->
    <div class="toast-container">
      <div 
        v-for="t in toasts" 
        :key="t.id"
        class="toast-card"
        :class="t.type"
      >
        <span class="toast-icon">
          {{ t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️' }}
        </span>
        <span class="toast-message">{{ t.message }}</span>
        <button class="toast-close" @click="toasts = toasts.filter(x => x.id !== t.id)">
          &times;
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// DB states
const tracks = ref([]);
const playlists = ref([]);
const recentlyPlayed = ref([]);

// Filters
const searchQuery = ref('');
const selectedGenre = ref('All');
const selectedPlaylistId = ref(null);

// Forms
const newPlaylistName = ref('');
const likedIndexes = ref([1]); // Error 2 target: stores index in filtered list

// Toasts
const toasts = ref([]);

// Playback Simulated Player state
const playingTrack = ref(null);
const isPlaying = ref(false);
const playProgress = ref(0);
let playTimerId = null;

// Queue lists
const visualQueue = ref([]); // Reordered list (shown on screen)
const playQueue = ref([]);   // Master queue (remains in original order, Error 1 target)
const currentTrackIndex = ref(0);

onMounted(() => {
  loadTracks();
  loadPlaylists();
  loadRecentlyPlayed();
});

const loadTracks = async () => {
  try {
    const res = await fetch('/api/tracks');
    const data = await res.json();
    tracks.value = data;
  } catch (err) {
    showToast('트랙 데이터를 조회할 수 없습니다.', 'danger');
  }
};

const loadPlaylists = async () => {
  try {
    const res = await fetch('/api/playlists');
    const data = await res.json();
    playlists.value = data;
  } catch (err) {
    showToast('플레이리스트 목록 조회 실패', 'danger');
  }
};

const loadRecentlyPlayed = async () => {
  try {
    const res = await fetch('/api/recently-played');
    const data = await res.json();
    recentlyPlayed.value = data;
  } catch (err) {
    showToast('최근 감상 내역 로드 실패', 'danger');
  }
};

const showToast = (message, type = 'info') => {
  const id = Date.now();
  toasts.value.push({ id, message, type });
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }, 4500);
};

// Computed track listing
const filteredTracks = computed(() => {
  return tracks.value.filter(t => {
    const matchGenre = selectedGenre.value === 'All' || t.genre === selectedGenre.value;
    const matchSearch = t.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                        t.artist.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchGenre && matchSearch;
  });
});

const activePlaylistDetail = computed(() => {
  return playlists.value.find(p => p.id === selectedPlaylistId.value);
});

const displaySongs = computed(() => {
  if (selectedPlaylistId.value === null) {
    return filteredTracks.value;
  }
  const play = activePlaylistDetail.value;
  if (!play) return [];
  return tracks.value.filter(t => play.trackIds.includes(t.id));
});

// Playlist navigation
const selectPlaylist = (id) => {
  selectedPlaylistId.value = id;
};

// Create Playlist (Error 3 targets 20 characters)
const createNewPlaylist = async () => {
  if (!newPlaylistName.value.trim()) return;

  try {
    const res = await fetch('/api/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newPlaylistName.value })
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || '플레이리스트 작성 실패');
    }

    showToast(`플레이리스트 '${data.name}'이 생성되었습니다.`, 'success');
    newPlaylistName.value = '';
    loadPlaylists();
  } catch (err) {
    showToast(`[생성 에러] ${err.message}`, 'danger');
  }
};

// Delete Playlist (Error 4 reference leak)
const deletePlaylist = async (id) => {
  if (!confirm('해당 플레이리스트를 삭제하시겠습니까? (연쇄 이력 정리 검증 요망)')) return;

  try {
    const res = await fetch(`/api/playlists/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('플레이리스트가 라이브러리에서 제거되었습니다.', 'success');
      if (selectedPlaylistId.value === id) {
        selectedPlaylistId.value = null;
      }
      loadPlaylists();
    }
  } catch (err) {
    showToast('플레이리스트 제거 중 에러 발생', 'danger');
  }
};

// Add Track to Playlist
const addTrackToPlaylist = async (trackId, playlistId) => {
  if (!playlistId) return;

  try {
    const res = await fetch(`/api/playlists/${playlistId}/tracks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackId })
    });
    if (res.ok) {
      const playlistName = playlists.value.find(p => p.id === playlistId)?.name;
      showToast(`곡이 '${playlistName}'에 추가되었습니다.`, 'success');
      loadPlaylists();
    }
  } catch (err) {
    showToast('플레이리스트 트랙 가입 오류', 'danger');
  }
};

// Error 2: Favorite toggle logic using local rendering index
const toggleLike = (i, songId) => {
  // INTENTIONAL_ERROR
  // CATEGORY: Frontend
  // DESCRIPTION: 좋아요 보관 설정 시, 대상 곡 고유 식별값(song.id)을 저장하지 않고 
  // 장르/검색 필터가 걸려 출력되고 있는 화면 인덱스(i)를 `likedIndexes` 배열에 등록합니다. 
  // 이 때문에 장르 단추를 눌러 목록 길이가 다르게 가공되면 엉뚱한 타 노래에 좋아요 하트가 박히는 버그를 유발합니다.
  if (likedIndexes.value.includes(i)) {
    likedIndexes.value = likedIndexes.value.filter(x => x !== i);
  } else {
    likedIndexes.value.push(i);
  }
  showToast('곡 선호도(좋아요) 내역을 보관합니다.', 'success');
};

// Playback Logic
const loadAndPlayTrack = (song) => {
  // Add to play lists
  if (!visualQueue.value.some(q => q.id === song.id)) {
    visualQueue.value.push(song);
    playQueue.value.push(song); // Master queue keeps it too
  }
  
  currentTrackIndex.value = playQueue.value.findIndex(q => q.id === song.id);
  playTrack(song);
};

const playTrack = (song) => {
  if (playTimerId) clearInterval(playTimerId);
  
  playingTrack.value = song;
  isPlaying.value = true;
  playProgress.value = 0;

  // Add to recent played database
  postRecentPlayed(song);

  playTimerId = setInterval(() => {
    if (playProgress.value < 100) {
      playProgress.value += 4;
    } else {
      playProgress.value = 0;
      playNextSong();
    }
  }, 1000);
};

const postRecentPlayed = async (song) => {
  try {
    await fetch('/api/recently-played', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'track',
        targetId: song.id,
        title: song.title
      })
    });
    loadRecentlyPlayed();
  } catch (err) {
    // Fail silently
  }
};

const togglePlay = () => {
  if (!playingTrack.value) {
    if (displaySongs.value.length > 0) {
      loadAndPlayTrack(displaySongs.value[0]);
    }
    return;
  }

  isPlaying.value = !isPlaying.value;
  if (isPlaying.value) {
    playTimerId = setInterval(() => {
      if (playProgress.value < 100) {
        playProgress.value += 4;
      } else {
        playProgress.value = 0;
        playNextSong();
      }
    }, 1000);
  } else {
    if (playTimerId) clearInterval(playTimerId);
  }
};

// Error 1: Next Song reads from playQueue instead of visualQueue
const playNextSong = () => {
  if (playQueue.value.length === 0) return;

  const nextIndex = currentTrackIndex.value + 1;
  if (nextIndex < playQueue.value.length) {
    currentTrackIndex.value = nextIndex;
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 재생 대기열 순서 조율 시 visualQueue 배열 순서만 수정하고 원본 playQueue 배열은 
    // 정렬 갱신해주지 않아, 재생기 핵심인 playNextSong 작동 시 유저가 설정한 곡 대신 
    // 예전 원본 배열의 스냅샷 인덱스(playQueue[nextIndex])로 노래가 흘러나오게 합니다.
    const nextSong = playQueue.value[nextIndex];
    playTrack(nextSong);
  } else {
    // Loop back
    currentTrackIndex.value = 0;
    const nextSong = playQueue.value[0];
    playTrack(nextSong);
  }
};

const playPrevSong = () => {
  if (playQueue.value.length === 0) return;

  const prevIndex = currentTrackIndex.value - 1;
  if (prevIndex >= 0) {
    currentTrackIndex.value = prevIndex;
    const prevSong = playQueue.value[prevIndex];
    playTrack(prevSong);
  } else {
    // Go to last
    const lastIndex = playQueue.value.length - 1;
    currentTrackIndex.value = lastIndex;
    const prevSong = playQueue.value[lastIndex];
    playTrack(prevSong);
  }
};

// Error 1 Reorder buttons (Only updates visualQueue)
const moveTrackUpInQueue = (idx) => {
  if (idx === 0) return;

  const arr = [...visualQueue.value];
  const temp = arr[idx];
  arr[idx] = arr[idx - 1];
  arr[idx - 1] = temp;
  visualQueue.value = arr;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend
  // DESCRIPTION: 재생 순서 변경 시, 화면 렌더링 배열인 visualQueue만 Swap 교환해주고, 
  // 실제 오디오 구동 배열인 playQueue는 연동 갱신을 생략하여, 순서 조율 후 다음 곡 재생 시 
  // 조율 이전의 원본 인덱스 순서대로 재생이 이어지게 결함을 설계합니다.
  // 원래 해야하는 동기화 코드 누락:
  // playQueue.value = [...visualQueue.value];

  showToast('대기열 순서가 임시 변경되었습니다 (Error 1 적용)', 'warning');
};

const removeFromQueue = (idx) => {
  const removedSong = visualQueue.value[idx];
  visualQueue.value = visualQueue.value.filter((_, i) => i !== idx);
  playQueue.value = playQueue.value.filter((_, i) => i !== idx);
  
  if (playingTrack.value?.id === removedSong.id) {
    if (playTimerId) clearInterval(playTimerId);
    playingTrack.value = null;
    isPlaying.value = false;
    playProgress.value = 0;
  }
  showToast('대기열에서 트랙이 삭제되었습니다.', 'info');
};

const seekProgress = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const width = rect.width;
  playProgress.value = Math.round((clickX / width) * 100);
};
</script>
