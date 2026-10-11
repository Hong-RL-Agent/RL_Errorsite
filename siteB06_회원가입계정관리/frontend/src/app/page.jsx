"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import ToastStack from "../components/ToastStack";
import { useToast } from "../hooks/useToast";

const DEMO_USER_ID = 1;
const steps = ["약관", "계정", "인증", "프로필", "완료"];

const initialSignup = {
  agree: false,
  email: "new.accountflow@test.local",
  accountId: "newflow",
  name: "신규사용자",
  password: "Passw0rd!",
  confirmPassword: "Passw0rd!",
  verificationCode: "",
  signupId: "",
  nickname: "새로운플로우",
  phone: "010-5555-1212",
  avatar: "https://api.dicebear.com/8.x/initials/svg?seed=AF"
};

export default function HomePage() {
  const [view, setView] = useState("landing");
  const [signupStep, setSignupStep] = useState(0);
  const [signup, setSignup] = useState(initialSignup);
  const [devCode, setDevCode] = useState("");
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(null);
  const [summarySettings, setSummarySettings] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [activity, setActivity] = useState([]);
  const [users, setUsers] = useState([]);
  const [slides, setSlides] = useState([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [profileDraft, setProfileDraft] = useState({ nickname: "", avatar: "" });
  const [contactDraft, setContactDraft] = useState({ phone: "" });
  const [passwordDraft, setPasswordDraft] = useState({ currentPassword: "", nextPassword: "" });
  const [loginDraft, setLoginDraft] = useState({ email: "user1@accountflow.test", password: "TestPass1!" });
  const { toasts, pushToast } = useToast();

  const progressLabel = useMemo(() => `${signupStep + 1} / ${steps.length}`, [signupStep]);
  const activeUserId = session?.user?.id || DEMO_USER_ID;

  const loadDashboard = useCallback(async (userId = activeUserId) => {
    const [profileData, settingsData, noteData, activityData, userData] = await Promise.all([
      api.profile(userId),
      api.settings(userId),
      api.notifications(userId),
      api.activity(userId),
      api.users("")
    ]);
    setProfile(profileData.profile);
    setSettings(settingsData.settings);
    setSummarySettings(settingsData.settings);
    setNotifications(noteData.items);
    setActivity(activityData.items);
    setUsers(userData.items);
  }, [activeUserId]);

  useEffect(() => {
    api.onboarding().then((data) => setSlides(data.items)).catch((error) => pushToast(error.message, "error"));
    loadDashboard(DEMO_USER_ID).catch((error) => pushToast(error.message, "error"));
  }, []);

  function updateSignup(key, value) {
    setSignup((current) => ({ ...current, [key]: value }));
  }

  async function beginSignup() {
    setView("signup");
    setSignupStep(0);
    setSignup(initialSignup);
  }

  async function nextTerms() {
    if (!signup.agree) {
      pushToast("약관 동의가 필요합니다.", "error");
      return;
    }
    setSignupStep(1);
  }

  async function saveAccountInfo() {
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(signup.email)) {
      pushToast("이메일 형식을 확인하세요.", "error");
      return;
    }
    if (signup.password.length < 8 || signup.password !== signup.confirmPassword) {
      pushToast("비밀번호 조건과 일치 여부를 확인하세요.", "error");
      return;
    }
    const check = await api.checkEmail(signup.email);
    if (!check.available) {
      pushToast("이미 사용 중인 이메일입니다.", "error");
      return;
    }
    const started = await api.startSignup({
      email: signup.email,
      accountId: signup.accountId,
      name: signup.name,
      password: signup.password
    });
    updateSignup("signupId", started.signupId);
    setSignup((current) => ({ ...current, signupId: started.signupId }));
    await api.updateProgress(started.signupId, { step: "account", payload: signup });
    setSignupStep(2);
    pushToast("계정 정보가 저장되었습니다.");
  }

  async function sendVerification() {
    const result = await api.sendCode({ signupId: signup.signupId, email: signup.email });
    setDevCode(result.code);
    pushToast("가상 인증 코드가 발급되었습니다.");
  }

  async function confirmVerification() {
    await api.confirmCode({ signupId: signup.signupId, email: signup.email, code: signup.verificationCode });
    await api.updateProgress(signup.signupId, { step: "verified", payload: signup });
    setSignupStep(3);
    pushToast("이메일 인증이 완료되었습니다.");
  }

  function backToAccountInfo() {
    // INTENTIONAL_ERROR: B06-ERR01
    // CSV Error: 다단계 기억 부담
    // Strategy: SEQUENCE_REPLAY
    // Description: 가입 단계 복귀 시 이전 폼 상태가 초기화됨.
    setSignup((current) => ({ ...initialSignup, agree: current.agree, signupId: current.signupId, email: "", accountId: "", name: "", password: "", confirmPassword: "" }));
    setSignupStep(1);
  }

  async function completeSignup() {
    const result = await api.completeSignup({
      signupId: signup.signupId,
      nickname: signup.nickname,
      phone: signup.phone,
      avatar: signup.avatar
    });
    setSession({ user: result.user });
    setSignupStep(4);
    await loadDashboard(result.user.id);
    pushToast("회원가입이 완료되었습니다.");
  }

  async function login(event) {
    event.preventDefault();
    const result = await api.login(loginDraft);
    setSession(result);
    await loadDashboard(result.user.id);
    setView("dashboard");
    pushToast("로그인했습니다.");
  }

  async function logout() {
    await api.logout();
    setSession(null);
    setView("landing");
    pushToast("로그아웃했습니다.");
  }

  async function saveProfile() {
    const data = await api.updateProfile(activeUserId, profileDraft);
    setProfile(data.profile);
    setProfileOpen(false);
    // INTENTIONAL_ERROR: B06-ERR03
    // CSV Error: 성공/실패 피드백 부재
    // Strategy: ACTION_REPLAY
    // Description: 프로필 닉네임 저장 후 성공 토스트를 표시하지 않음.
  }

  function openProfileModal() {
    setProfileDraft({ nickname: profile?.nickname || "", avatar: profile?.avatar || "" });
    setProfileOpen(true);
  }

  function openContactModal() {
    setContactDraft({ phone: profile?.phone || "" });
    setContactOpen(true);
  }

  function closeContactModal() {
    // INTENTIONAL_ERROR: B06-ERR05
    // CSV Error: 수정 및 취소 경로 차단
    // Strategy: ACTION_REPLAY
    // Description: 연락처 수정 모달의 취소 및 닫기 이벤트가 잘못된 상태를 참조함.
    if (contactDraft.phone !== (profile?.phone || "")) {
      setContactOpen((current) => current);
      return;
    }
    setContactOpen(false);
  }

  async function saveContact() {
    const data = await api.updateProfile(activeUserId, { phone: contactDraft.phone });
    setProfile(data.profile);
    setContactOpen(false);
    pushToast("연락처를 저장했습니다.");
  }

  async function saveSettings() {
    const data = await api.updateSettings(activeUserId, settings);
    setSettings(data.settings);
    // INTENTIONAL_ERROR: B06-ERR04
    // CSV Error: 캐시 상태 불일치
    // Strategy: ACTION_REPLAY
    // Description: 이메일 알림 설정 저장 후 요약 카드 캐시를 갱신하지 않음.
    pushToast("계정 설정을 저장했습니다.");
  }

  async function changePassword() {
    await api.changePassword(activeUserId, passwordDraft);
    setPasswordDraft({ currentPassword: "", nextPassword: "" });
    pushToast("비밀번호를 변경했습니다.");
  }

  async function readNotification(item) {
    await api.readNotification(item.id);
    setNotifications((current) => current.map((note) => note.id === item.id ? { ...note, read: 1 } : note));
    pushToast("알림을 읽음 처리했습니다.");
  }

  async function deleteAccount() {
    await api.deleteAccount(activeUserId);
    setDeleteOpen(false);
    setSession(null);
    setView("landing");
    pushToast("계정이 삭제 처리되었습니다.");
  }

  async function resetData() {
    await api.reset();
    setSignup(initialSignup);
    setSignupStep(0);
    setView("signup");
    setSession(null);
    setDevCode("");
    await loadDashboard(DEMO_USER_ID);
    pushToast("테스트 데이터가 초기화되었습니다.");
  }

  const renderSignup = () => (
    <section className="split">
      <aside className="intro">
        <p>AccountFlow</p>
        <h1>안전하고 자연스러운 계정 생성 흐름</h1>
        <span>진행 단계 {progressLabel}</span>
        <div className="stepper">
          {steps.map((step, index) => <i className={index <= signupStep ? "active" : ""} key={step}>{step}</i>)}
        </div>
      </aside>
      <div className="formPanel">
        {signupStep === 0 && (
          <>
            <h2>약관 동의</h2>
            <label className="check"><input type="checkbox" checked={signup.agree} onChange={(event) => updateSignup("agree", event.target.checked)} /> 서비스 이용약관과 개인정보 처리방침에 동의합니다.</label>
            <button onClick={nextTerms}>다음</button>
          </>
        )}
        {signupStep === 1 && (
          <>
            <h2>계정 정보 입력</h2>
            <input value={signup.email} onChange={(event) => updateSignup("email", event.target.value)} placeholder="이메일" data-bug-id="B06-ERR01" />
            <input value={signup.accountId} onChange={(event) => updateSignup("accountId", event.target.value)} placeholder="계정 ID" data-bug-id="B06-ERR01" />
            <input value={signup.name} onChange={(event) => updateSignup("name", event.target.value)} placeholder="이름" data-bug-id="B06-ERR01" />
            <input type="password" value={signup.password} onChange={(event) => updateSignup("password", event.target.value)} placeholder="비밀번호" data-bug-id="B06-ERR01" />
            <input type="password" value={signup.confirmPassword} onChange={(event) => updateSignup("confirmPassword", event.target.value)} placeholder="비밀번호 확인" data-bug-id="B06-ERR01" />
            <button onClick={saveAccountInfo}>저장 후 인증</button>
          </>
        )}
        {signupStep === 2 && (
          <>
            <h2>가상 이메일 인증</h2>
            <p className="muted">개발용 인증 코드: <strong>{devCode || "발급 전"}</strong></p>
            <button onClick={sendVerification}>인증 코드 발급/재발급</button>
            <input value={signup.verificationCode} onChange={(event) => updateSignup("verificationCode", event.target.value)} placeholder="인증 코드" />
            <button onClick={confirmVerification}>인증 확인</button>
          </>
        )}
        {signupStep === 3 && (
          <>
            <h2>프로필 설정</h2>
            <input value={signup.nickname} onChange={(event) => updateSignup("nickname", event.target.value)} placeholder="닉네임" />
            <input value={signup.phone} onChange={(event) => updateSignup("phone", event.target.value)} placeholder="연락처" />
            <input value={signup.avatar} onChange={(event) => updateSignup("avatar", event.target.value)} placeholder="프로필 사진 URL" />
            <div className="buttonRow">
              <button onClick={backToAccountInfo} data-bug-id="B06-ERR01">이전 단계</button>
              <button onClick={completeSignup}>가입 완료</button>
            </div>
          </>
        )}
        {signupStep === 4 && (
          <>
            <h2>가입 완료</h2>
            <p>AccountFlow 계정이 준비되었습니다.</p>
            <button onClick={() => setView("onboarding")}>서비스 안내 보기</button>
          </>
        )}
      </div>
    </section>
  );

  const renderOnboarding = () => {
    const slide = slides[slideIndex] || {};
    return (
      <section className="onboarding">
        <div className="slideCard" data-bug-id="B06-ERR02">
          <span>{slide.eyebrow}</span>
          <h2>{slide.title}</h2>
          <p>{slide.body}</p>
          {/* INTENTIONAL_ERROR: B06-ERR02
          CSV Error: 페이지네이션 없는 슬라이드
          Strategy: SEQUENCE_REPLAY
          Description: 온보딩 슬라이드의 현재 페이지와 전체 개수 표시가 누락됨. */}
          <div className="buttonRow">
            <button onClick={() => setSlideIndex((index) => Math.max(0, index - 1))}>이전</button>
            <button onClick={() => setSlideIndex((index) => Math.min(slides.length - 1, index + 1))}>다음</button>
            <button onClick={() => setView("dashboard")}>대시보드로 이동</button>
          </div>
        </div>
      </section>
    );
  };

  const renderDashboard = () => (
    <>
      <section className="dashboardHero">
        <div>
          <p>계정 대시보드</p>
          <h1>{profile?.nickname || "AccountFlow 사용자"}</h1>
          <span>{session?.user?.email || "user1@accountflow.test"}</span>
        </div>
        <div className="summaryGrid">
          <div><strong>{summarySettings?.emailNotifications ? "수신" : "미수신"}</strong><span data-bug-id="B06-ERR04">이메일 알림</span></div>
          <div><strong>{summarySettings?.publicProfile ? "공개" : "비공개"}</strong><span>프로필 공개</span></div>
          <div><strong>{profile?.status || "active"}</strong><span>계정 상태</span></div>
        </div>
      </section>
      <section className="accountGrid">
        <div className="panel profileCard">
          <img src={profile?.avatar} alt="" />
          <h2>{profile?.nickname}</h2>
          <p>{profile?.bio}</p>
          <button onClick={openProfileModal} data-bug-id="B06-ERR03">개인정보 수정</button>
          <button onClick={openContactModal} data-bug-id="B06-ERR05">연락처 관리</button>
        </div>
        <div className="panel">
          <h2>알림 설정</h2>
          <label className="check"><input type="checkbox" checked={Boolean(settings?.emailNotifications)} onChange={(event) => setSettings({ ...settings, emailNotifications: event.target.checked })} /> 이메일 알림 수신</label>
          <label className="check"><input type="checkbox" checked={Boolean(settings?.productNews)} onChange={(event) => setSettings({ ...settings, productNews: event.target.checked })} /> 제품 소식 받기</label>
          <label className="check"><input type="checkbox" checked={Boolean(settings?.publicProfile)} onChange={(event) => setSettings({ ...settings, publicProfile: event.target.checked })} /> 공개 프로필</label>
          <button onClick={saveSettings} data-bug-id="B06-ERR04">설정 저장</button>
        </div>
        <div className="panel">
          <h2>비밀번호 변경</h2>
          <input type="password" value={passwordDraft.currentPassword} onChange={(event) => setPasswordDraft({ ...passwordDraft, currentPassword: event.target.value })} placeholder="현재 비밀번호" />
          <input type="password" value={passwordDraft.nextPassword} onChange={(event) => setPasswordDraft({ ...passwordDraft, nextPassword: event.target.value })} placeholder="새 비밀번호" />
          <button onClick={changePassword}>비밀번호 저장</button>
          <button className="danger" onClick={() => setDeleteOpen(true)}>계정 삭제</button>
        </div>
      </section>
      <section className="accountGrid lower">
        <div className="panel">
          <h2>사용자 검색</h2>
          {users.slice(0, 8).map((user) => <p className="row" key={user.id}>{user.name} · {user.email}</p>)}
        </div>
        <div className="panel">
          <h2>알림</h2>
          {notifications.slice(0, 7).map((item) => <button className={item.read ? "notice read" : "notice"} key={item.id} onClick={() => readNotification(item)}>{item.message}</button>)}
        </div>
        <div className="panel">
          <h2>최근 활동 로그</h2>
          {activity.slice(0, 8).map((item) => <p className="row" key={item.id}>{item.message}</p>)}
        </div>
      </section>
    </>
  );

  return (
    <main>
      <header className="topbar">
        <div className="brand" onClick={() => setView("landing")}><span>A</span>AccountFlow</div>
        <nav>
          <button onClick={beginSignup}>회원가입</button>
          <button onClick={() => setView("login")}>로그인</button>
          <button onClick={() => setView("dashboard")}>대시보드</button>
          <button onClick={resetData}>데이터 초기화</button>
          {session && <button onClick={logout}>로그아웃</button>}
        </nav>
      </header>

      {view === "landing" && (
        <section className="landing">
          <div>
            <p>Modern SaaS Account Platform</p>
            <h1>가입부터 설정 관리까지 한 번에 흐르는 계정 경험</h1>
            <span>가상 이메일 인증, 프로필 관리, 알림 설정, 활동 로그를 실제 API로 저장합니다.</span>
            <div className="buttonRow">
              <button onClick={beginSignup}>가입 시작</button>
              <button onClick={() => setView("login")}>로그인</button>
            </div>
          </div>
        </section>
      )}

      {view === "login" && (
        <section className="split">
          <aside className="intro"><p>Login</p><h1>계정으로 돌아오기</h1><span>테스트 계정으로 로그인해 설정을 관리합니다.</span></aside>
          <form className="formPanel" onSubmit={login}>
            <h2>로그인</h2>
            <input value={loginDraft.email} onChange={(event) => setLoginDraft({ ...loginDraft, email: event.target.value })} placeholder="이메일" />
            <input type="password" value={loginDraft.password} onChange={(event) => setLoginDraft({ ...loginDraft, password: event.target.value })} placeholder="비밀번호" />
            <button type="submit">로그인</button>
          </form>
        </section>
      )}

      {view === "signup" && renderSignup()}
      {view === "onboarding" && renderOnboarding()}
      {view === "dashboard" && renderDashboard()}

      {profileOpen && (
        <div className="modalBackdrop">
          <div className="modal">
            <h2>개인정보 수정</h2>
            <input value={profileDraft.nickname} onChange={(event) => setProfileDraft({ ...profileDraft, nickname: event.target.value })} placeholder="닉네임" />
            <input value={profileDraft.avatar} onChange={(event) => setProfileDraft({ ...profileDraft, avatar: event.target.value })} placeholder="프로필 사진 URL" />
            <div className="buttonRow">
              <button onClick={() => setProfileOpen(false)}>취소</button>
              <button onClick={saveProfile} data-bug-id="B06-ERR03">저장</button>
            </div>
          </div>
        </div>
      )}

      {contactOpen && (
        <div className="modalBackdrop">
          <div className="modal">
            <button className="closeButton" onClick={closeContactModal} data-bug-id="B06-ERR05">×</button>
            <h2>연락처 정보 관리</h2>
            <input value={contactDraft.phone} onChange={(event) => setContactDraft({ phone: event.target.value })} placeholder="연락처" />
            <div className="buttonRow">
              <button onClick={closeContactModal} data-bug-id="B06-ERR05">취소</button>
              <button onClick={saveContact}>저장</button>
            </div>
          </div>
        </div>
      )}

      {deleteOpen && (
        <div className="modalBackdrop">
          <div className="modal">
            <h2>계정 삭제 확인</h2>
            <p>삭제 후 계정 상태가 비활성화됩니다.</p>
            <div className="buttonRow">
              <button onClick={() => setDeleteOpen(false)}>취소</button>
              <button className="danger" onClick={deleteAccount}>삭제</button>
            </div>
          </div>
        </div>
      )}

      <ToastStack toasts={toasts} />
    </main>
  );
}
