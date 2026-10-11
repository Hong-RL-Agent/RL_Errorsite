"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import ToastStack from "../components/ToastStack";
import { useToast } from "../hooks/useToast";

const CUSTOMER_ID = 1;
const BUG_CANCEL_STATS_BOOKING = "B0001";
const BUG_CHANGE_FEEDBACK_BOOKING = "B0002";
const BUG_DELETE_BOOKING = "B0003";
const BUG_LOCKED_MODAL_BOOKING = "B0004";

function SeatMap({ seats, selectedSeats, onToggle, blocked = false }) {
  const selected = new Set(selectedSeats);
  const rows = useMemo(() => {
    return seats.reduce((map, seat) => {
      map[seat.rowLabel] = map[seat.rowLabel] || [];
      map[seat.rowLabel].push(seat);
      return map;
    }, {});
  }, [seats]);

  return (
    <div className="seatShell">
      <div className="screen">SCREEN</div>
      <svg viewBox="0 0 760 430" className="seatSvg" role="img" aria-label="상영관 좌석 배치도">
        <path d="M80 40 Q380 10 680 40" className="screenCurve" />
        {Object.entries(rows).map(([row, rowSeats], rowIndex) => (
          <g key={row} transform={`translate(48 ${82 + rowIndex * 44})`}>
            <text x="0" y="22" className="rowLabel">{row}</text>
            {rowSeats.map((seat, index) => {
              const aisleOffset = index >= 6 ? 34 : 0;
              const x = 42 + index * 46 + aisleOffset;
              const status = seat.status === "booked" ? "booked" : selected.has(seat.id) ? "selected" : "available";
              return (
                <g key={seat.id} onClick={() => !blocked && onToggle(seat)} className={`seat ${status}`}>
                  <rect x={x} y="0" width="34" height="30" rx="6" />
                  <text x={x + 17} y="20">{seat.seatLabel}</text>
                </g>
              );
            })}
          </g>
        ))}
      </svg>
      <div className="legend">
        <span><i className="available" /> 선택 가능</span>
        <span><i className="selected" /> 선택 중</span>
        <span><i className="booked" /> 예매 완료</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [movies, setMovies] = useState([]);
  const [movie, setMovie] = useState(null);
  const [theaters, setTheaters] = useState([]);
  const [theaterId, setTheaterId] = useState("");
  const [date, setDate] = useState("2026-10-11");
  const [showtimes, setShowtimes] = useState([]);
  const [showtime, setShowtime] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ confirmed: 0, canceled: 0, total: 0 });
  const [notifications, setNotifications] = useState([]);
  const [activity, setActivity] = useState([]);
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("전체");
  const [statusTab, setStatusTab] = useState("현재상영");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [completed, setCompleted] = useState([]);
  const [changeTarget, setChangeTarget] = useState(null);
  const [changeSeats, setChangeSeats] = useState([]);
  const [changeSeatOptions, setChangeSeatOptions] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { toasts, pushToast } = useToast();

  const genres = useMemo(() => ["전체", ...Array.from(new Set(movies.map((item) => item.genre)))], [movies]);
  const selectedTotal = useMemo(() => seats.filter((seat) => selectedSeats.includes(seat.id)).reduce((sum, seat) => sum + seat.price, 0), [seats, selectedSeats]);

  async function loadMovies() {
    const data = await api.movies({ q: query, genre: genre === "전체" ? "" : genre, status: statusTab });
    setMovies(data.items);
    if (!movie && data.items[0]) setMovie(data.items[0]);
  }

  async function loadAccount(refreshStats = true) {
    const [ticketData, noteData, activityData] = await Promise.all([
      api.bookings(CUSTOMER_ID),
      api.notifications(CUSTOMER_ID),
      api.activity(CUSTOMER_ID)
    ]);
    setBookings(ticketData.items);
    setNotifications(noteData.items);
    setActivity(activityData.items);
    if (refreshStats) {
      const statData = await api.statistics(CUSTOMER_ID);
      setStats(statData.statistics);
    }
  }

  async function loadShowtimes() {
    if (!movie || !theaterId) return;
    const data = await api.showtimes({ movieId: movie.id, theaterId, date });
    setShowtimes(data.items);
    setShowtime(data.items[0] || null);
  }

  async function loadSeats(targetShowtime = showtime) {
    if (!targetShowtime) return;
    const data = await api.seats(targetShowtime.id);
    setSeats(data.items);
    setSelectedSeats([]);
  }

  useEffect(() => {
    api.theaters().then((data) => {
      setTheaters(data.items);
      setTheaterId(data.items[0]?.id || "");
    }).catch((error) => pushToast(error.message, "error"));
    loadAccount().catch((error) => pushToast(error.message, "error"));
  }, []);

  useEffect(() => {
    loadMovies().catch((error) => pushToast(error.message, "error"));
  }, [genre, statusTab]);

  useEffect(() => {
    loadShowtimes().catch((error) => pushToast(error.message, "error"));
  }, [movie, theaterId, date]);

  useEffect(() => {
    loadSeats().catch((error) => pushToast(error.message, "error"));
  }, [showtime]);

  async function handleSearch(event) {
    event.preventDefault();
    await loadMovies();
    pushToast("영화 목록을 검색했습니다.");
  }

  function toggleSeat(seat) {
    if (seat.status === "booked") return;
    setSelectedSeats((current) => current.includes(seat.id) ? current.filter((id) => id !== seat.id) : [...current, seat.id].slice(0, 4));
  }

  async function confirmBooking() {
    if (!showtime || selectedSeats.length === 0) return;
    const selectedSeatRows = seats.filter((seat) => selectedSeats.includes(seat.id));
    let results = [];
    if (selectedSeatRows.length >= 2) {
      // INTENTIONAL_ERROR: B04-ERR01
      // CSV Error: 의도치 않은 더블 클릭 (이벤트 중복)
      // Strategy: ACTION_REPLAY
      // Description: 예매 확정 이벤트가 중복 호출됨.
      const first = selectedSeatRows.slice(0, 1).map((seat) => seat.id);
      const second = selectedSeatRows.slice(1).map((seat) => seat.id);
      results = await Promise.all([
        api.createBooking({ customerId: CUSTOMER_ID, showtimeId: showtime.id, seatIds: first }),
        api.createBooking({ customerId: CUSTOMER_ID, showtimeId: showtime.id, seatIds: second })
      ]);
    } else {
      results = [await api.createBooking({ customerId: CUSTOMER_ID, showtimeId: showtime.id, seatIds: selectedSeatRows.map((seat) => seat.id) })];
    }
    setCompleted(results.map((item) => item.booking));
    setConfirmOpen(false);
    await Promise.all([loadAccount(), loadSeats()]);
    pushToast("예매가 완료되었습니다.");
  }

  async function cancelBooking(booking) {
    await api.cancelBooking(booking.id);
    setBookings((current) => current.map((item) => item.id === booking.id ? { ...item, status: "예매취소" } : item));
    // INTENTIONAL_ERROR: B04-ERR02
    // CSV Error: 캐시 상태 불일치
    // Strategy: ACTION_REPLAY
    // Description: 예매 취소 후 현황 카드 캐시를 갱신하지 않음.
    if (booking.id !== BUG_CANCEL_STATS_BOOKING) {
      const statData = await api.statistics(CUSTOMER_ID);
      setStats(statData.statistics);
    }
    pushToast("예매를 취소했습니다.");
  }

  async function openChangeModal(booking) {
    const detail = await api.booking(booking.id);
    const seatData = await api.seats(detail.booking.showtimeId);
    setChangeTarget(detail.booking);
    setChangeSeats([]);
    setChangeSeatOptions(seatData.items);
  }

  function toggleChangeSeat(seat) {
    if (seat.status === "booked" && !seat.heldByBooking) return;
    setChangeSeats((current) => current.includes(seat.id) ? current.filter((id) => id !== seat.id) : [seat.id]);
  }

  async function saveSeatChange() {
    if (!changeTarget || changeSeats.length === 0) return;
    await api.changeSeats(changeTarget.id, { seatIds: changeSeats });
    setChangeTarget(null);
    setChangeSeats([]);
    await loadAccount();
    await loadSeats();
    // INTENTIONAL_ERROR: B04-ERR03
    // CSV Error: 성공/실패 피드백 부재
    // Strategy: ACTION_REPLAY
    // Description: 좌석 변경 완료 후 성공 토스트를 표시하지 않음.
    if (changeTarget.id !== BUG_CHANGE_FEEDBACK_BOOKING) {
      pushToast("좌석 변경을 저장했습니다.");
    }
  }

  function closeChangeModal() {
    // INTENTIONAL_ERROR: B04-ERR05
    // CSV Error: 수정 및 취소 경로 차단
    // Strategy: ACTION_REPLAY
    // Description: 좌석 변경 모달의 취소 및 닫기 이벤트가 잘못된 상태값을 참조함.
    if (changeTarget?.id === BUG_LOCKED_MODAL_BOOKING && changeSeats.length > 0) {
      setChangeTarget((current) => current);
      return;
    }
    setChangeTarget(null);
    setChangeSeats([]);
  }

  async function removeBooking(booking) {
    if (booking.id === BUG_DELETE_BOOKING) {
      // INTENTIONAL_ERROR: B04-ERR04
      // CSV Error: 행동 확인 없음
      // Strategy: ACTION_REPLAY
      // Description: 취소 예매 내역 삭제 시 확인 모달 없이 즉시 DELETE API를 호출함.
      await api.deleteBooking(booking.id);
      await loadAccount();
      pushToast("예매 내역을 삭제했습니다.");
      return;
    }
    setDeleteTarget(booking);
  }

  async function confirmDelete() {
    await api.deleteBooking(deleteTarget.id);
    setDeleteTarget(null);
    await loadAccount();
    pushToast("예매 내역을 삭제했습니다.");
  }

  async function markRead(notification) {
    await api.readNotification(notification.id);
    setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, read: 1 } : item));
    pushToast("알림을 읽음 처리했습니다.");
  }

  async function resetData() {
    await api.reset();
    setMovie(null);
    setShowtime(null);
    setSelectedSeats([]);
    setCompleted([]);
    await Promise.all([loadMovies(), loadAccount()]);
    pushToast("초기 데이터로 복원했습니다.");
  }

  return (
    <main>
      <header className="topbar">
        <div className="brand"><span>C</span>CineWave</div>
        <form className="search" onSubmit={handleSearch}>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="영화 제목 검색" />
          <button type="submit">검색</button>
        </form>
        <button onClick={resetData}>데이터 초기화</button>
      </header>

      <section className="hero">
        <div>
          <p>오늘의 추천 상영</p>
          <h1>{movie?.title || "CineWave Premiere"}</h1>
          <span>{movie?.genre} · {movie?.rating} · {movie?.runtime}분</span>
        </div>
        {movie && <img src={movie.poster} alt="" />}
      </section>

      <section className="movieControls">
        <div className="tabs">
          {["현재상영", "상영예정"].map((item) => (
            <button className={statusTab === item ? "active" : ""} key={item} onClick={() => setStatusTab(item)}>{item}</button>
          ))}
        </div>
        <select value={genre} onChange={(event) => setGenre(event.target.value)}>
          {genres.map((item) => <option key={item}>{item}</option>)}
        </select>
      </section>

      <div className="mainGrid">
        <section className="posterGrid">
          {movies.slice(0, 16).map((item) => (
            <article className={movie?.id === item.id ? "posterCard active" : "posterCard"} key={item.id} onClick={() => setMovie(item)}>
              <img src={item.poster} alt="" />
              <div>
                <h3>{item.title}</h3>
                <p>{item.genre} · {item.releaseDate}</p>
              </div>
            </article>
          ))}
        </section>

        <aside className="detailPanel">
          <h2>영화 상세</h2>
          <p>{movie?.synopsis}</p>
          <div className="metaGrid">
            <span>장르 {movie?.genre}</span>
            <span>등급 {movie?.rating}</span>
            <span>상태 {movie?.status}</span>
            <span>상영 {movie?.runtime}분</span>
          </div>
        </aside>
      </div>

      <section className="bookingFlow">
        <div className="panel">
          <h2>지점·날짜·시간 선택</h2>
          <div className="fieldRow">
            <select value={theaterId} onChange={(event) => setTheaterId(event.target.value)}>
              {theaters.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
            </select>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </div>
          <div className="showtimeGrid">
            {showtimes.map((item) => (
              <button className={showtime?.id === item.id ? "active" : ""} key={item.id} onClick={() => setShowtime(item)}>
                <strong>{item.startsAt.slice(11, 16)}</strong>
                <span>{item.screenName} · 잔여 {item.availableSeats}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="panel seatsPanel">
          <h2>좌석 선택</h2>
          <SeatMap seats={seats} selectedSeats={selectedSeats} onToggle={toggleSeat} />
        </div>

        <div className="panel summary">
          <h2>선택 좌석 요약</h2>
          <p>{selectedSeats.length ? seats.filter((seat) => selectedSeats.includes(seat.id)).map((seat) => seat.seatLabel).join(", ") : "좌석을 선택하세요"}</p>
          <strong>{selectedTotal.toLocaleString()}원</strong>
          <button disabled={!selectedSeats.length} onClick={() => setConfirmOpen(true)}>예매 확인</button>
        </div>
      </section>

      <section className="ticketArea">
        <div className="stats">
          <div data-bug-id="B04-ERR02"><strong>{stats.confirmed}</strong><span>예매확정</span></div>
          <div><strong>{stats.canceled}</strong><span>예매취소</span></div>
          <div><strong>{stats.total}</strong><span>전체 내역</span></div>
        </div>
        <div className="tickets">
          {completed.map((ticket) => (
            <article className="ticket completed" key={ticket.id}>
              <small>예매 완료 티켓</small>
              <h3>{ticket.movieTitle}</h3>
              <p>{ticket.theaterName} · {ticket.seatLabels}</p>
              <strong>{ticket.id}</strong>
            </article>
          ))}
          {bookings.slice(0, 8).map((ticket) => (
            <article className="ticket" key={ticket.id}>
              <small>{ticket.status}</small>
              <h3>{ticket.movieTitle}</h3>
              <p>{ticket.startsAt?.slice(0, 16).replace("T", " ")} · {ticket.seatLabels}</p>
              <div className="ticketActions">
                {ticket.status === "예매확정" && <button onClick={() => cancelBooking(ticket)} data-bug-id={ticket.id === BUG_CANCEL_STATS_BOOKING ? "B04-ERR02" : undefined}>예매 취소</button>}
                {ticket.status === "예매확정" && <button onClick={() => openChangeModal(ticket)} data-bug-id={ticket.id === BUG_CHANGE_FEEDBACK_BOOKING || ticket.id === BUG_LOCKED_MODAL_BOOKING ? (ticket.id === BUG_CHANGE_FEEDBACK_BOOKING ? "B04-ERR03" : "B04-ERR05") : undefined}>좌석 변경</button>}
                {ticket.status === "예매취소" && <button onClick={() => removeBooking(ticket)} data-bug-id={ticket.id === BUG_DELETE_BOOKING ? "B04-ERR04" : undefined}>내역 삭제</button>}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="infoGrid">
        <div className="panel">
          <h2>영화 및 예매 알림</h2>
          {notifications.slice(0, 7).map((item) => (
            <button className={item.read ? "notice read" : "notice"} key={item.id} onClick={() => markRead(item)}>{item.message}</button>
          ))}
        </div>
        <div className="panel">
          <h2>활동 로그</h2>
          {activity.slice(0, 8).map((item) => <p className="log" key={item.id}>{item.message}</p>)}
        </div>
      </section>

      {confirmOpen && (
        <div className="modalBackdrop">
          <div className="modal">
            <h2>예매 확인</h2>
            <p>{movie?.title} · {selectedSeats.length}석 · {selectedTotal.toLocaleString()}원</p>
            <div className="modalActions">
              <button onClick={() => setConfirmOpen(false)}>취소</button>
              <button onClick={confirmBooking} data-bug-id="B04-ERR01">예매 확정</button>
            </div>
          </div>
        </div>
      )}

      {changeTarget && (
        <div className="modalBackdrop">
          <div className="modal wide">
            <button className="closeButton" onClick={closeChangeModal} data-bug-id={changeTarget.id === BUG_LOCKED_MODAL_BOOKING ? "B04-ERR05" : undefined}>×</button>
            <h2>예매 변경</h2>
            <SeatMap seats={changeSeatOptions} selectedSeats={changeSeats} onToggle={toggleChangeSeat} />
            <div className="modalActions">
              <button onClick={closeChangeModal} data-bug-id={changeTarget.id === BUG_LOCKED_MODAL_BOOKING ? "B04-ERR05" : undefined}>취소</button>
              <button onClick={saveSeatChange} data-bug-id={changeTarget.id === BUG_CHANGE_FEEDBACK_BOOKING ? "B04-ERR03" : undefined}>변경 저장</button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="modalBackdrop">
          <div className="modal">
            <h2>내역 삭제 확인</h2>
            <p>{deleteTarget.movieTitle} 예매 내역을 삭제할까요?</p>
            <div className="modalActions">
              <button onClick={() => setDeleteTarget(null)}>취소</button>
              <button onClick={confirmDelete}>삭제</button>
            </div>
          </div>
        </div>
      )}

      <ToastStack toasts={toasts} />
    </main>
  );
}
