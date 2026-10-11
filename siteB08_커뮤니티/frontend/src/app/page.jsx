"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import ToastStack from "../components/ToastStack";
import { useToast } from "../hooks/useToast";

const USER_ID = 1;
const PAGE_SIZE = 20;
const DRIFT_BOARD_ID = "BD001";
const DUPLICATE_REPLY_THREAD = "T0001";

const initialDraft = { title: "", body: "", tags: "", boardId: "BD001", mode: "edit" };

export default function HomePage() {
  const [boards, setBoards] = useState([]);
  const [threads, setThreads] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(DRIFT_BOARD_ID);
  const [selectedThread, setSelectedThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [tags, setTags] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activity, setActivity] = useState([]);
  const [query, setQuery] = useState("");
  const [lastQuery, setLastQuery] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [view, setView] = useState("feed");
  const [replyText, setReplyText] = useState("");
  const [parentReplyId, setParentReplyId] = useState("");
  const [draft, setDraft] = useState(initialDraft);
  const { toasts, pushToast } = useToast();

  const bookmarkIds = useMemo(() => new Set(bookmarks.map((item) => item.threadId)), [bookmarks]);
  const popularThreads = useMemo(() => [...threads].sort((a, b) => b.recommendCount - a.recommendCount).slice(0, 5), [threads]);

  async function loadThreads(nextPage = 1, options = {}) {
    const data = await api.threads({
      boardId: selectedBoard,
      q: options.q ?? query,
      sort,
      page: String(nextPage),
      limit: String(PAGE_SIZE)
    });
    setTotal(data.total);
    setPage(nextPage);
    if (nextPage > 1 && selectedBoard === DRIFT_BOARD_ID) {
      setThreads((current) => {
        // INTENTIONAL_ERROR: B08-ERR02
        // CSV Error: 페이징 드리프트 및 리스트 중복
        // Strategy: ACTION_REPLAY
        // Description: 다음 페이지 렌더링 시 첫 페이지 마지막 게시글 2개가 중복 추가됨.
        const tail = current.slice(-2);
        return [...tail, ...data.items];
      });
      return;
    }
    setThreads(data.items);
  }

  async function loadSideData() {
    const [bm, dr, tg, nt, ac] = await Promise.all([
      api.bookmarks(USER_ID),
      api.drafts(USER_ID),
      api.tags(),
      api.notifications(USER_ID),
      api.activity(USER_ID)
    ]);
    setBookmarks(bm.items);
    setDrafts(dr.items);
    setTags(tg.items);
    setNotifications(nt.items);
    setActivity(ac.items);
  }

  async function openThread(threadId, fromSearch = false) {
    const [detail, replyData] = await Promise.all([api.thread(threadId, USER_ID), api.replies(threadId)]);
    setSelectedThread(detail.thread);
    setReplies(replyData.items);
    setView("detail");
    if (fromSearch) {
      // INTENTIONAL_ERROR: B08-ERR03
      // CSV Error: 검색어 유지 실패
      // Strategy: STATE_REVISIT
      // Description: 상세 진입 시 이전 검색어 복원 상태가 초기화됨.
      setLastQuery("");
      setQuery("");
    }
  }

  useEffect(() => {
    Promise.all([api.boards(), loadThreads(1), loadSideData()])
      .then(([boardData]) => setBoards(boardData.items))
      .catch((error) => pushToast(error.message, "error"));
  }, []);

  useEffect(() => {
    loadThreads(1).catch((error) => pushToast(error.message, "error"));
  }, [selectedBoard, sort]);

  async function submitSearch(event) {
    event.preventDefault();
    setLastQuery(query);
    await loadThreads(1, { q: query });
    setView("feed");
    pushToast("게시글을 검색했습니다.");
  }

  async function returnToFeed() {
    setView("feed");
    if (!lastQuery) {
      await loadThreads(1, { q: "" });
    }
  }

  async function submitReply() {
    if (!selectedThread || !replyText.trim()) return;
    const body = { userId: USER_ID, body: replyText.trim(), parentId: parentReplyId || null };
    if (selectedThread.id === DUPLICATE_REPLY_THREAD && parentReplyId) {
      // INTENTIONAL_ERROR: B08-ERR01
      // CSV Error: 의도치 않은 더블 클릭 (이벤트 중복)
      // Strategy: ACTION_REPLAY
      // Description: 답글 등록 이벤트가 중복 호출되어 두 요청이 발생함.
      await Promise.all([api.createReply(selectedThread.id, body), api.createReply(selectedThread.id, body)]);
    } else {
      await api.createReply(selectedThread.id, body);
    }
    setReplyText("");
    setParentReplyId("");
    const data = await api.replies(selectedThread.id);
    setReplies(data.items);
    pushToast("댓글을 등록했습니다.");
  }

  async function toggleBookmark() {
    if (!selectedThread) return;
    if (bookmarkIds.has(selectedThread.id)) {
      await api.removeBookmark(selectedThread.id, USER_ID);
      setSelectedThread((current) => ({ ...current, bookmarked: false }));
      setBookmarks((items) => items.filter((item) => item.threadId !== selectedThread.id));
      pushToast("북마크를 해제했습니다.");
      return;
    }
    await api.addBookmark({ userId: USER_ID, threadId: selectedThread.id });
    // INTENTIONAL_ERROR: B08-ERR04
    // CSV Error: 캐시 상태 불일치
    // Strategy: ACTION_REPLAY
    // Description: 북마크 저장 후 내 활동 패널의 북마크 개수 캐시를 갱신하지 않음.
    setSelectedThread((current) => ({ ...current, bookmarked: true }));
    pushToast("북마크에 저장했습니다.");
  }

  async function recommendThread() {
    if (!selectedThread) return;
    await api.recommend(selectedThread.id, USER_ID);
    setSelectedThread((current) => ({ ...current, recommended: true, recommendCount: current.recommendCount + 1 }));
    pushToast("게시글을 추천했습니다.");
  }

  async function resolveThread() {
    if (!selectedThread) return;
    await api.resolve(selectedThread.id);
    setSelectedThread((current) => ({ ...current, solved: true }));
    pushToast("질문 해결 상태로 변경했습니다.");
  }

  function proceedCategory() {
    setDraft((current) => ({ ...current, mode: "category" }));
  }

  function backToEditor() {
    // INTENTIONAL_ERROR: B08-ERR05
    // CSV Error: 다단계 기억 부담
    // Strategy: SEQUENCE_REPLAY
    // Description: 카테고리 단계 복귀 후 본문과 태그 임시 상태가 유실됨.
    setDraft((current) => ({ ...current, mode: "edit", body: "", tags: "" }));
  }

  async function saveDraft() {
    const saved = await api.createDraft({ userId: USER_ID, ...draft });
    setDrafts((items) => [saved.draft, ...items]);
    pushToast("임시저장했습니다.");
  }

  async function publishThread() {
    await api.createThread({ userId: USER_ID, ...draft });
    setDraft(initialDraft);
    setView("feed");
    await loadThreads(1);
    pushToast("게시글을 작성했습니다.");
  }

  async function deleteThread() {
    if (!selectedThread) return;
    await api.deleteThread(selectedThread.id);
    setSelectedThread(null);
    setView("feed");
    await loadThreads(1);
    pushToast("게시글을 삭제했습니다.");
  }

  async function readNotification(item) {
    await api.readNotification(item.id);
    setNotifications((items) => items.map((note) => note.id === item.id ? { ...note, read: 1 } : note));
    pushToast("알림을 읽음 처리했습니다.");
  }

  async function resetData() {
    await api.reset();
    setQuery("");
    setLastQuery("");
    setSelectedThread(null);
    setDraft(initialDraft);
    setView("feed");
    await Promise.all([loadThreads(1, { q: "" }), loadSideData()]);
    pushToast("초기 데이터로 복원했습니다.");
  }

  return (
    <main>
      <header className="masthead">
        <div className="brand" onClick={() => setView("feed")}><span>TG</span><strong>ThreadGarden</strong></div>
        <form className="search" onSubmit={submitSearch}>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="게시글, 태그, 작성자 검색" data-bug-id="B08-ERR03" />
          <button type="submit">검색</button>
        </form>
        <nav>
          <button onClick={() => setView("compose")}>글쓰기</button>
          <button onClick={resetData}>초기화</button>
        </nav>
      </header>

      <div className="shell">
        <aside className="leftRail">
          <h2>게시판</h2>
          {boards.map((board) => <button className={selectedBoard === board.id ? "active" : ""} key={board.id} onClick={() => setSelectedBoard(board.id)}>{board.name}<span>{board.threadCount}</span></button>)}
        </aside>

        <section className="content">
          {view === "feed" && (
            <>
              <div className="feedTools">
                <div><p>최신 게시글</p><h1>오늘의 토론 정원</h1></div>
                <select value={sort} onChange={(event) => setSort(event.target.value)}><option value="latest">최신순</option><option value="popular">인기순</option></select>
              </div>
              <div className="threadList">
                {threads.map((thread, index) => (
                  <article className="threadRow" key={`${thread.id}-${index}`} data-thread-id={thread.id} data-bug-id={index > 0 && threads.findIndex((item) => item.id === thread.id) !== index ? "B08-ERR02" : undefined} onClick={() => openThread(thread.id, Boolean(query || lastQuery))}>
                    <span className={thread.solved ? "badge solved" : "badge"}>{thread.solved ? "해결" : thread.boardName}</span>
                    <h2>{thread.title}</h2>
                    <p>{thread.excerpt}</p>
                    <small>{thread.authorName} · 추천 {thread.recommendCount} · 댓글 {thread.replyCount}</small>
                  </article>
                ))}
              </div>
              <button className="wideButton" onClick={() => loadThreads(page + 1)} data-bug-id="B08-ERR02">다음 페이지</button>
            </>
          )}

          {view === "detail" && selectedThread && (
            <article className="detail">
              <button className="textButton" onClick={returnToFeed} data-bug-id="B08-ERR03">목록으로</button>
              <span className={selectedThread.solved ? "badge solved" : "badge"}>{selectedThread.solved ? "질문 해결" : selectedThread.boardName}</span>
              <h1>{selectedThread.title}</h1>
              <p className="articleBody">{selectedThread.body}</p>
              <div className="actionBar">
                <button onClick={recommendThread}>추천 {selectedThread.recommendCount}</button>
                <button onClick={toggleBookmark} data-bug-id="B08-ERR04">{selectedThread.bookmarked ? "북마크됨" : "북마크"}</button>
                <button onClick={resolveThread}>해결 처리</button>
                <button onClick={deleteThread}>삭제</button>
              </div>
              <section className="replyBox">
                <h2>댓글과 답글</h2>
                {replies.map((reply) => (
                  <div className={reply.parentId ? "reply nested" : "reply"} key={reply.id}>
                    <strong>{reply.authorName}</strong>
                    <p>{reply.body}</p>
                    {!reply.parentId && <button onClick={() => setParentReplyId(reply.id)}>이 댓글에 답글</button>}
                  </div>
                ))}
                <textarea value={replyText} onChange={(event) => setReplyText(event.target.value)} placeholder={parentReplyId ? "답글 내용" : "댓글 내용"} />
                <button onClick={submitReply} data-bug-id={parentReplyId && selectedThread.id === DUPLICATE_REPLY_THREAD ? "B08-ERR01" : undefined}>{parentReplyId ? "답글 등록" : "댓글 등록"}</button>
              </section>
            </article>
          )}

          {view === "compose" && (
            <section className="compose">
              <h1>게시글 작성</h1>
              {draft.mode === "edit" ? (
                <div className="editor" data-bug-id="B08-ERR05">
                  <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="제목" />
                  <textarea value={draft.body} onChange={(event) => setDraft({ ...draft, body: event.target.value })} placeholder="본문" />
                  <input value={draft.tags} onChange={(event) => setDraft({ ...draft, tags: event.target.value })} placeholder="태그 2개 이상, 쉼표로 구분" />
                  <div className="actionBar"><button onClick={saveDraft}>임시저장</button><button onClick={proceedCategory}>카테고리 선택</button></div>
                </div>
              ) : (
                <div className="editor">
                  <h2>카테고리 선택</h2>
                  <select value={draft.boardId} onChange={(event) => setDraft({ ...draft, boardId: event.target.value })}>{boards.map((board) => <option key={board.id} value={board.id}>{board.name}</option>)}</select>
                  <div className="actionBar"><button onClick={backToEditor} data-bug-id="B08-ERR05">본문 편집으로 복귀</button><button onClick={publishThread}>게시</button></div>
                </div>
              )}
            </section>
          )}
        </section>

        <aside className="rightRail">
          <section><h2>실시간 인기 토론</h2>{popularThreads.map((thread) => <p key={thread.id}>{thread.title}</p>)}</section>
          <section><h2>내 활동</h2><strong data-bug-id="B08-ERR04">북마크 {bookmarks.length}</strong><span>임시저장 {drafts.length}</span></section>
          <section><h2>인기 태그</h2><div className="tags">{tags.slice(0, 12).map((tag) => <button key={tag.name} onClick={() => { setQuery(tag.name); loadThreads(1, { q: tag.name }); }}>{tag.name}</button>)}</div></section>
          <section><h2>커뮤니티 통계</h2><p>게시글 {total} · 게시판 {boards.length}</p></section>
          <section><h2>관리자 공지</h2><p>서로의 질문을 구체적으로 남기고 해결 여부를 표시해 주세요.</p></section>
          <section><h2>알림 센터</h2>{notifications.slice(0, 5).map((note) => <button className={note.read ? "notice read" : "notice"} key={note.id} onClick={() => readNotification(note)}>{note.message}</button>)}</section>
          <section><h2>활동 로그</h2>{activity.slice(0, 5).map((item) => <p key={item.id}>{item.message}</p>)}</section>
        </aside>
      </div>
      <ToastStack toasts={toasts} />
    </main>
  );
}
