document.addEventListener('DOMContentLoaded', () => {
    let allArtifacts = [];
    let allTracks = [];
    let currentGallery = 'all';

    const tracksList = document.getElementById('tracks-list');
    const artifactSearch = document.getElementById('artifact-search');
    const galleryTabs = document.querySelectorAll('.tab-btn');
    const currentPanel = document.getElementById('current-selection-panel');
    const modal = document.getElementById('artifact-modal');
    const modalBody = document.getElementById('modal-body');
    const closeModal = document.querySelector('.close-modal');

    // Player Elements
    const playerTrackTitle = document.getElementById('player-track-title');
    const playerArtifactTitle = document.getElementById('player-artifact-title');

    // Initialize
    fetchData();

    async function fetchData() {
        try {
            const [artRes, trackRes] = await Promise.all([
                fetch('/api/artifacts'),
                fetch('/api/audio-tracks')
            ]);
            allArtifacts = await artRes.json();
            allTracks = await trackRes.json();
            renderTracks(allTracks);
        } catch (error) {
            tracksList.innerHTML = '<div class="error">데이터를 불러오지 못했습니다.</div>';
        }
    }

    function renderTracks(tracks) {
        tracksList.innerHTML = '';
        
        // Filter tracks by search query and gallery if needed
        const query = artifactSearch.value.toLowerCase();
        const filteredTracks = tracks.filter(track => {
            const artifact = allArtifacts.find(a => a.id === track.artifactId);
            if (!artifact) return false;
            const matchesGallery = currentGallery === 'all' || artifact.gallery === currentGallery;
            const matchesSearch = artifact.title.toLowerCase().includes(query) || artifact.artist.toLowerCase().includes(query);
            return matchesGallery && matchesSearch;
        });

        const tracksToRender = [...filteredTracks];

        // INTENTIONAL GUI BUG: site056-bug01
        // Type: duplicate-audio-track-render
        // Description: 오디오 트랙 렌더링 시 특정 track을 추가로 append하여 같은 해설 트랙이 중복 표시됨.
        // We'll duplicate the first track of the filtered results for demonstration.
        if (tracksToRender.length > 0) {
            tracksToRender.splice(1, 0, tracksToRender[0]); // Duplicate the first track at index 1
        }

        tracksToRender.forEach((track, index) => {
            const artifact = allArtifacts.find(a => a.id === track.artifactId);
            const card = document.createElement('div');
            card.className = 'track-item';
            
            // Mark the duplicate as the bug location
            if (index === 1 && tracksToRender[0].id === track.id) {
                card.dataset.bugId = 'site056-bug01';
            }

            card.innerHTML = `
                <div class="track-info">
                    <span class="track-meta">${artifact.gallery} | ${track.duration}</span>
                    <h4>${track.title}</h4>
                    <p class="track-meta">${artifact.title} (${artifact.artist})</p>
                </div>
                <div class="track-actions">
                    <button class="play-btn-circle" data-track-id="${track.id}">▶</button>
                </div>
            `;

            // INTENTIONAL GUI BUG: site056-bug03
            // Type: audio-play-button-no-response
            // Description: 특정 오디오 트랙의 재생 버튼에 click listener를 연결하지 않아 현재 재생 상태가 변경되지 않음.
            // Track 104 (함무라비 법전) will be the unresponsive one.
            const playBtn = card.querySelector('.play-btn-circle');
            if (track.id === 104) {
                playBtn.dataset.bugId = 'site056-bug03';
                // Listener NOT attached
                console.warn(`Bug 03: Play button for track ${track.id} is intentionally unresponsive.`);
            } else {
                playBtn.addEventListener('click', () => {
                    updatePlayer(track, artifact);
                    updateSelectionPanel(artifact);
                });
            }

            tracksList.appendChild(card);
        });
    }

    function updatePlayer(track, artifact) {
        playerTrackTitle.innerText = track.title;
        playerArtifactTitle.innerText = `${artifact.title} - ${artifact.artist}`;
        // In a real app, this would trigger audio.play()
    }

    function updateSelectionPanel(artifact) {
        const emptyMsg = currentPanel.querySelector('.selection-empty');
        const content = currentPanel.querySelector('.selection-content');
        
        emptyMsg.style.display = 'none';
        content.style.display = 'block';

        document.getElementById('current-img').src = artifact.image;
        document.getElementById('current-title').innerText = artifact.title;
        document.getElementById('current-artist').innerText = artifact.artist;

        document.getElementById('btn-view-detail').onclick = () => openArtifactDetail(artifact);
    }

    function openArtifactDetail(artifact) {
        modalBody.innerHTML = `
            <div style="display: flex; gap: 30px;">
                <img src="${artifact.image}" style="width: 250px; border-radius: 4px;">
                <div>
                    <h2 style="color: #4a3427; margin-bottom: 10px;">${artifact.title}</h2>
                    <p style="color: #c5a059; font-weight: 700; margin-bottom: 5px;">${artifact.artist}, ${artifact.year}</p>
                    <p style="font-size: 14px; color: #666; margin-bottom: 20px;">전시관: ${artifact.gallery}</p>
                    <div style="background: #fdfaf5; padding: 20px; border-left: 3px solid #c5a059;">
                        ${artifact.description}
                    </div>
                </div>
            </div>
        `;
        modal.style.display = 'block';
    }

    // Filters
    artifactSearch.addEventListener('input', () => renderTracks(allTracks));

    galleryTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            galleryTabs.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentGallery = btn.dataset.gallery;
            renderTracks(allTracks);
        });
    });

    // Language Selector
    document.getElementById('language-selector').addEventListener('change', (e) => {
        if (e.target.value !== 'ko') {
            alert('English audio guides are currently under preparation.');
            e.target.value = 'ko';
        }
    });

    // Course Filters
    document.querySelectorAll('.course-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            alert(`'${btn.innerText}' 코스 경로가 지도에 표시되었습니다. (준비 중)`);
        });
    });

    // Modal Close
    closeModal.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
});
