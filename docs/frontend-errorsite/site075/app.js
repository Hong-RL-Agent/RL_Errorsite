document.addEventListener('DOMContentLoaded', () => {
    let allGames = [];
    let allTables = [];
    let selectedReservation = null;

    const gameGrid = document.getElementById('game-grid');
    const tableSchedule = document.getElementById('table-schedule');
    const genreFilter = document.getElementById('genre-filter');
    const difficultyFilter = document.getElementById('difficulty-filter');
    const selectedInfo = document.getElementById('selected-info');
    const totalPrice = document.getElementById('total-price');

    // Fetch Data
    const fetchData = async () => {
        try {
            const [gamesRes, tablesRes] = await Promise.all([
                fetch('/api/games'),
                fetch('/api/tables')
            ]);
            allGames = await gamesRes.json();
            allTables = await tablesRes.json();
            
            renderGames(allGames);
            renderTables(allTables);
        } catch (error) {
            console.error('Data loading failed:', error);
            gameGrid.innerHTML = '<div class="error">데이터를 불러오는 데 실패했습니다.</div>';
        }
    };

    // Render Games
    const renderGames = (games) => {
        gameGrid.innerHTML = '';
        games.forEach(game => {
            const card = document.createElement('div');
            card.className = 'game-card';
            card.innerHTML = `
                <div class="game-img">
                    <img src="./assets/board_games_grid.png" alt="${game.name}">
                    <button class="btn-heart" onclick="event.stopPropagation(); this.textContent = this.textContent === '❤️' ? '🤍' : '❤️'">🤍</button>
                    ${game.popular ? '<div class="event-tag" style="top:10px; left:10px; right:auto;">HIT</div>' : ''}
                </div>
                <div class="game-info">
                    <h4>${game.name}</h4>
                    <div class="game-tags">
                        <span class="tag">${game.genre}</span>
                        <span class="tag">${game.difficulty}</span>
                    </div>
                    <div class="game-meta">
                        <span>👥 ${game.players}명</span>
                        <span>⏱️ ${game.time}</span>
                    </div>
                </div>
            `;
            card.onclick = () => showGameDetail(game);
            gameGrid.appendChild(card);
        });
    };

    // INTENTIONAL GUI BUG: site075-bug01
    // Type: difficulty-filter-result-mismatch
    // Description: 난이도 필터 매핑이 잘못되어 초급 필터 결과에 고급 게임이 섞여 표시됨.
    const filterGames = () => {
        const genre = genreFilter.value;
        const difficulty = difficultyFilter.value;

        let filtered = allGames.filter(game => {
            const genreMatch = genre === 'all' || game.genre === genre;
            
            let difficultyMatch = false;
            if (difficulty === 'all') {
                difficultyMatch = true;
            } else if (difficulty === 'Beginner') {
                // BUG: Beginner를 선택했는데 ID가 3인 게임(Terraforming Mars, Advanced)이 포함되도록 조건 설정
                difficultyMatch = (game.difficulty === 'Beginner' || game.id === 3);
            } else {
                difficultyMatch = game.difficulty === difficulty;
            }

            return genreMatch && difficultyMatch;
        });

        renderGames(filtered);
    };

    genreFilter.addEventListener('change', filterGames);
    difficultyFilter.addEventListener('change', filterGames);

    // Render Tables
    const renderTables = (tables) => {
        tableSchedule.innerHTML = '';
        tables.forEach(table => {
            const card = document.createElement('div');
            card.className = 'table-card';
            card.innerHTML = `
                <h5>${table.id} (${table.seats}인석)</h5>
                <p style="font-size: 11px; color: #64748B; margin-bottom: 10px;">${table.location}</p>
                <div class="time-slots">
                    ${table.times.map(time => {
                        const isBuggyButton = (table.id === 'T02' && time === '17:00');
                        
                        return `
                            <button class="time-btn" 
                                ${isBuggyButton ? 'data-bug-id="site075-bug03"' : ''}
                                data-table="${table.id}" 
                                data-time="${time}">
                                ${time} 예약 (잔여 1)
                            </button>
                        `;
                    }).join('')}
                </div>
            `;
            tableSchedule.appendChild(card);
        });

        // Add Listeners
        document.querySelectorAll('.time-btn').forEach(btn => {
            // INTENTIONAL GUI BUG: site075-bug03
            // Type: table-reserve-button-no-response
            // Description: 특정 테이블 시간 슬롯 예약 버튼에 click listener를 연결하지 않아 예약 요약이 변경되지 않음.
            if (btn.dataset.table === 'T02' && btn.dataset.time === '17:00') {
                // No listener attached
                console.log('Skipping listener for buggy button site075-bug03');
            } else {
                btn.onclick = () => selectTime(btn.dataset.table, btn.dataset.time);
            }
        });
    };

    const selectTime = (tableId, time) => {
        selectedReservation = { tableId, time };
        
        // Update Summary
        selectedInfo.innerHTML = `
            <div class="selected-item">
                <p><strong>테이블:</strong> ${tableId}</p>
                <p><strong>예약 시간:</strong> ${time}</p>
            </div>
        `;
        totalPrice.textContent = '12,000원 (2시간 기준)';
    };

    // Modal Logic
    const modal = document.getElementById('game-modal');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.querySelector('.close-modal');

    const showGameDetail = (game) => {
        modalBody.innerHTML = `
            <img src="./assets/board_games_grid.png" alt="${game.name}" class="modal-img">
            <div class="modal-details">
                <h2>${game.name}</h2>
                <p class="tag">${game.genre}</p>
                <div class="modal-meta">
                    <div><strong>난이도</strong><br>${game.difficulty}</div>
                    <div><strong>인원</strong><br>${game.players}명</div>
                    <div><strong>시간</strong><br>${game.time}</div>
                    <div><strong>인기</strong><br>${game.popular ? '🔥 베스트' : '일반'}</div>
                </div>
                <p style="margin-top: 20px; color: #64748B;">이 게임에 대한 상세 설명은 현재 준비 중입니다.</p>
                <button class="btn-primary" style="margin-top: 30px; width: 100%;" onclick="alert('찜 목록에 추가되었습니다!')">게임 찜하기</button>
            </div>
        `;
        modal.style.display = 'block';
    };

    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

    fetchData();
});
