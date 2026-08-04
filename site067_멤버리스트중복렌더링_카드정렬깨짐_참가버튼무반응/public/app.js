const BUGGY_JOIN_CLUB_ID = "club-067-03";
const LONG_TITLE_CLUB_ID = "club-067-05";
const DUPLICATE_MEMBER_ID = "member-003";

const state = {
  clubs: [],
  members: [],
  joinedClubIds: new Set(),
  filters: {
    genre: "all",
    search: ""
  },
  selectedDate: "",
  activeClubId: null
};

const topics = [
  {
    genre: "고전",
    title: "고전 속 고독은 오늘의 생활과 어떻게 닿아 있나요?",
    body: "주인공의 선택을 현대 도시 생활과 비교하며, 혼자 있는 시간과 공동체의 균형을 이야기합니다."
  },
  {
    genre: "SF",
    title: "과학적 상상력은 윤리적 질문을 어디까지 밀어붙이나요?",
    body: "기술 발전이 가족, 기억, 책임의 감각을 바꾸는 장면을 중심으로 토론합니다."
  },
  {
    genre: "에세이",
    title: "사소한 산책과 기록이 삶의 방향을 바꿀 수 있을까요?",
    body: "일상 기록이 취향과 관계를 어떻게 새롭게 발견하게 하는지 각자의 경험을 나눕니다."
  }
];

const els = {};

document.addEventListener("DOMContentLoaded", init);

function init() {
  cacheElements();
  bindStaticEvents();
  renderTopics();
  loadClubs();
  loadMembers();
}

function cacheElements() {
  els.clubGrid = document.getElementById("clubGrid");
  els.clubsStatus = document.getElementById("clubsStatus");
  els.clubsError = document.getElementById("clubsError");
  els.retryClubs = document.getElementById("retryClubs");
  els.memberGrid = document.getElementById("memberGrid");
  els.membersStatus = document.getElementById("membersStatus");
  els.membersError = document.getElementById("membersError");
  els.retryMembers = document.getElementById("retryMembers");
  els.genreFilter = document.getElementById("genreFilter");
  els.clubSearch = document.getElementById("clubSearch");
  els.resetFilters = document.getElementById("resetFilters");
  els.calendarGrid = document.getElementById("calendarGrid");
  els.selectedDateLabel = document.getElementById("selectedDateLabel");
  els.calendarDetail = document.getElementById("calendarDetail");
  els.topicList = document.getElementById("topicList");
  els.joinCard = document.getElementById("joinCard");
  els.toggleJoinPanel = document.getElementById("toggleJoinPanel");
  els.joinList = document.getElementById("joinList");
  els.joinCount = document.getElementById("joinCount");
  els.monthCount = document.getElementById("monthCount");
  els.clearJoinList = document.getElementById("clearJoinList");
  els.clubModalBackdrop = document.getElementById("clubModalBackdrop");
  els.modalClose = document.getElementById("modalClose");
  els.modalGenre = document.getElementById("modalGenre");
  els.modalTitle = document.getElementById("modalTitle");
  els.modalBook = document.getElementById("modalBook");
  els.modalSchedule = document.getElementById("modalSchedule");
  els.modalPlace = document.getElementById("modalPlace");
  els.modalCapacity = document.getElementById("modalCapacity");
  els.modalJoinButton = document.getElementById("modalJoinButton");
  els.modalMemberList = document.getElementById("modalMemberList");
}

function bindStaticEvents() {
  document.querySelectorAll("[data-scroll-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.dataset.scrollTarget);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  document.querySelectorAll("[data-soon]").forEach((button) => {
    button.addEventListener("click", () => {
      alert("준비중입니다.");
    });
  });

  els.retryClubs.addEventListener("click", loadClubs);
  els.retryMembers.addEventListener("click", loadMembers);

  els.genreFilter.addEventListener("change", () => {
    state.filters.genre = els.genreFilter.value;
    renderClubs();
  });

  els.clubSearch.addEventListener("input", () => {
    state.filters.search = els.clubSearch.value.trim().toLowerCase();
    renderClubs();
  });

  els.resetFilters.addEventListener("click", () => {
    els.genreFilter.value = "all";
    els.clubSearch.value = "";
    state.filters.genre = "all";
    state.filters.search = "";
    renderClubs();
  });

  els.toggleJoinPanel.addEventListener("click", () => {
    const collapsed = !els.joinCard.classList.contains("collapsed");
    els.joinCard.classList.toggle("collapsed", collapsed);
    els.toggleJoinPanel.textContent = collapsed ? "펼치기" : "접기";
    els.toggleJoinPanel.setAttribute("aria-expanded", String(!collapsed));
  });

  els.clearJoinList.addEventListener("click", () => {
    state.joinedClubIds.clear();
    renderClubs();
    renderJoinPanel();
  });

  els.modalClose.addEventListener("click", closeModal);
  els.clubModalBackdrop.addEventListener("click", (event) => {
    if (event.target === els.clubModalBackdrop) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !els.clubModalBackdrop.hidden) {
      closeModal();
    }
  });

  els.modalJoinButton.addEventListener("click", () => {
    if (state.activeClubId) {
      joinClub(state.activeClubId);
      openClubModal(state.activeClubId);
    }
  });
}

async function loadClubs() {
  els.clubsError.hidden = true;
  els.clubsStatus.textContent = "독서 모임을 불러오는 중입니다.";
  els.clubGrid.innerHTML = "";

  try {
    const response = await fetch("/api/clubs");
    if (!response.ok) {
      throw new Error("clubs api failed");
    }
    const data = await response.json();
    state.clubs = data.clubs;
    populateGenreFilter();
    renderClubs();
    renderCalendar();
    renderJoinPanel();
    els.clubsStatus.textContent = `${state.clubs.length}개 모임 표시 중 · API 데이터 정상 로드`;
  } catch (error) {
    els.clubsError.hidden = false;
    els.clubsStatus.textContent = "모임 로딩 오류";
  }
}

async function loadMembers() {
  els.membersError.hidden = true;
  els.membersStatus.textContent = "멤버를 불러오는 중입니다.";
  els.memberGrid.innerHTML = "";

  try {
    const response = await fetch("/api/members");
    if (!response.ok) {
      throw new Error("members api failed");
    }
    const data = await response.json();
    state.members = data.members;
    renderMemberDirectory();
    els.membersStatus.textContent = `${state.members.length}명 멤버 표시 중 · API 데이터 정상 로드`;
  } catch (error) {
    els.membersError.hidden = false;
    els.membersStatus.textContent = "멤버 로딩 오류";
  }
}

function populateGenreFilter() {
  const current = els.genreFilter.value || "all";
  const genres = [...new Set(state.clubs.map((club) => club.genre))];
  els.genreFilter.innerHTML = [
    '<option value="all">전체 장르</option>',
    ...genres.map((genre) => `<option value="${genre}">${genre}</option>`)
  ].join("");
  els.genreFilter.value = genres.includes(current) ? current : "all";
}

function getFilteredClubs() {
  return state.clubs.filter((club) => {
    const genreMatch = state.filters.genre === "all" || club.genre === state.filters.genre;
    const haystack = `${club.name} ${club.book} ${club.place}`.toLowerCase();
    const searchMatch = !state.filters.search || haystack.includes(state.filters.search);
    return genreMatch && searchMatch;
  });
}

function renderClubs() {
  const clubs = getFilteredClubs();
  els.clubGrid.innerHTML = "";

  if (clubs.length === 0) {
    els.clubGrid.innerHTML = '<div class="empty-state">조건에 맞는 독서 모임이 없습니다.</div>';
    return;
  }

  clubs.forEach((club) => {
    els.clubGrid.appendChild(createClubCard(club));
  });
}

function createClubCard(club) {
  const card = document.createElement("article");
  card.className = "club-card";
  card.dataset.clubId = club.id;
  if (club.id === LONG_TITLE_CLUB_ID) {
    card.setAttribute("data-bug-id", "site067-bug02");
  }

  const joined = state.joinedClubIds.has(club.id);
  card.innerHTML = `
    <span class="genre-badge">${club.genre}</span>
    <h3>${club.name}</h3>
    <p class="book-title">선정 도서: ${club.book}</p>
    <div class="club-meta">
      <span>${formatDateTime(club.schedule)}</span>
      <span>${club.place}</span>
      <span>${club.participants}/${club.capacity}명 참여 중</span>
      <div class="capacity-bar" aria-label="참여율"><span style="width: ${(club.participants / club.capacity) * 100}%"></span></div>
    </div>
    <div class="club-actions">
      <button class="secondary-button detail-button" type="button">상세 보기</button>
      <button class="primary-button join-button" type="button">${joined ? "참여 예정" : "참가하기"}</button>
    </div>
  `;

  card.querySelector(".detail-button").addEventListener("click", () => openClubModal(club.id));

  const joinButton = card.querySelector(".join-button");
  if (club.id === BUGGY_JOIN_CLUB_ID) {
    // INTENTIONAL GUI BUG: site067-bug03
    // CSV Error: 참가 버튼 무반응
    // Type: join-club-button-no-response
    // Description: 특정 독서 모임의 참가 버튼에 click listener를 연결하지 않아 참여 예정 목록이 변경되지 않음.
    joinButton.setAttribute("data-bug-id", "site067-bug03");
  } else {
    joinButton.addEventListener("click", () => joinClub(club.id));
  }

  return card;
}

function renderMemberDirectory() {
  els.memberGrid.innerHTML = "";

  if (state.members.length === 0) {
    els.memberGrid.innerHTML = '<div class="empty-state">표시할 멤버가 없습니다.</div>';
    return;
  }

  state.members.forEach((member) => {
    els.memberGrid.appendChild(createMemberNode(member, "member-card"));
  });
}

function renderMembers(memberIds) {
  els.modalMemberList.innerHTML = "";
  const modalMembers = memberIds
    .map((id) => state.members.find((member) => member.id === id))
    .filter(Boolean);

  modalMembers.forEach((member) => {
    els.modalMemberList.appendChild(createMemberNode(member, "modal-member"));
  });

  const duplicateMember = modalMembers.find((member) => member.id === DUPLICATE_MEMBER_ID);
  if (duplicateMember) {
    // INTENTIONAL GUI BUG: site067-bug01
    // CSV Error: 멤버 리스트 중복 렌더링
    // Type: duplicate-member-list-render
    // Description: 멤버 목록 렌더링 시 특정 member를 추가로 append하여 같은 멤버가 중복 표시됨.
    els.modalMemberList.appendChild(createMemberNode(duplicateMember, "modal-member"));
  }
}

function createMemberNode(member, className) {
  const node = document.createElement("article");
  node.className = className;
  node.dataset.memberId = member.id;
  node.innerHTML = `
    <img src="${member.profileImage}" alt="${member.name} 프로필" />
    <div>
      <strong>${member.name}</strong>
      <span>${member.interestGenre} · ${member.joinedClubCount}회 참여</span>
    </div>
  `;
  return node;
}

function renderCalendar() {
  els.calendarGrid.innerHTML = "";
  const clubByDay = new Map();
  state.clubs.forEach((club) => {
    const day = new Date(club.schedule).getDate();
    clubByDay.set(day, club);
  });

  for (let day = 1; day <= 31; day += 1) {
    const button = document.createElement("button");
    const club = clubByDay.get(day);
    button.type = "button";
    button.className = `calendar-day ${club ? "has-club" : ""}`;
    button.textContent = `${day}`;
    button.setAttribute("aria-label", `${day}일 일정 선택`);
    button.addEventListener("click", () => selectCalendarDate(day));
    els.calendarGrid.appendChild(button);
  }
}

function selectCalendarDate(day) {
  state.selectedDate = String(day);
  els.calendarGrid.querySelectorAll(".calendar-day").forEach((button) => {
    button.classList.toggle("selected", button.textContent === String(day));
  });

  const matches = state.clubs.filter((club) => new Date(club.schedule).getDate() === day);
  els.selectedDateLabel.textContent = `5월 ${day}일`;
  if (matches.length === 0) {
    els.calendarDetail.textContent = "선택한 날짜에는 예정된 모임이 없습니다.";
    return;
  }

  els.calendarDetail.innerHTML = matches
    .map((club) => `<strong>${club.name}</strong> · ${formatTime(club.schedule)} · ${club.place}`)
    .join("<br />");
}

function renderTopics() {
  els.topicList.innerHTML = "";
  topics.forEach((topic, index) => {
    const item = document.createElement("article");
    item.className = "topic-item";
    const contentId = `topic-content-${index}`;
    item.innerHTML = `
      <button class="topic-trigger" type="button" aria-expanded="${index === 0}" aria-controls="${contentId}">
        ${topic.title}
        <span>${topic.genre}</span>
      </button>
      <div class="topic-content" id="${contentId}" ${index === 0 ? "" : "hidden"}>${topic.body}</div>
    `;
    item.querySelector(".topic-trigger").addEventListener("click", () => {
      const content = item.querySelector(".topic-content");
      const expanded = content.hidden;
      content.hidden = !expanded;
      item.querySelector(".topic-trigger").setAttribute("aria-expanded", String(expanded));
    });
    els.topicList.appendChild(item);
  });
}

function openClubModal(clubId) {
  const club = state.clubs.find((entry) => entry.id === clubId);
  if (!club) {
    return;
  }

  state.activeClubId = clubId;
  els.modalGenre.textContent = club.genre;
  els.modalTitle.textContent = club.name;
  els.modalBook.textContent = `선정 도서: ${club.book}`;
  els.modalSchedule.textContent = formatDateTime(club.schedule);
  els.modalPlace.textContent = club.place;
  els.modalCapacity.textContent = `${club.participants}/${club.capacity}명`;
  els.modalJoinButton.textContent = state.joinedClubIds.has(clubId) ? "참여 예정" : "참가하기";
  renderMembers(club.memberIds);
  els.clubModalBackdrop.hidden = false;
}

function closeModal() {
  els.clubModalBackdrop.hidden = true;
  state.activeClubId = null;
}

function joinClub(clubId) {
  state.joinedClubIds.add(clubId);
  renderClubs();
  renderJoinPanel();
}

function renderJoinPanel() {
  const joined = state.clubs.filter((club) => state.joinedClubIds.has(club.id));
  els.joinList.innerHTML = "";

  if (joined.length === 0) {
    els.joinList.innerHTML = '<div class="empty-state">아직 참여 예정 모임이 없습니다.</div>';
  } else {
    joined.forEach((club) => {
      const item = document.createElement("div");
      item.className = "join-item";
      item.innerHTML = `
        <strong>${club.name}</strong>
        <span>${formatDateTime(club.schedule)}</span>
        <span>${club.place}</span>
      `;
      els.joinList.appendChild(item);
    });
  }

  els.joinCount.textContent = `${joined.length}개`;
  const thisMonthCount = joined.filter((club) => new Date(club.schedule).getMonth() === 4).length;
  els.monthCount.textContent = `${thisMonthCount}회`;
}

function formatDateTime(value) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function formatTime(value) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}
