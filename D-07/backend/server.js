require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { db, initDatabase, resetAllData, INITIAL_USERS } = require('./db');

const app = express();
const PORT = process.env.PORT || 9807;

app.use(cors());
app.use(express.json());

// 헬스체크
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'PrefSpace API', timestamp: new Date().toISOString() });
});

// 멱등성 전체 리셋 (POST /api/test/reset)
app.post('/api/test/reset', async (req, res) => {
  try {
    const result = await resetAllData();
    res.json({
      success: true,
      message: 'PrefSpace 데이터베이스 및 사용자 환경설정이 초기 상태로 완전 복원되었습니다.',
      data: result
    });
  } catch (error) {
    console.error('Reset error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 테스트 계정 목록 조회 (GET /api/users)
app.get('/api/users', (req, res) => {
  db.all('SELECT id, username, name, email, bio, avatar, created_at FROM users ORDER BY id ASC', (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, data: rows });
  });
});

// 로그인 (POST /api/auth/login)
app.post('/api/auth/login', (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ success: false, message: 'username이 필요합니다.' });
  }

  db.get('SELECT * FROM users WHERE username = ? OR id = ?', [username, username], (err, user) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!user) {
      return res.status(404).json({ success: false, message: '존재하지 않는 사용자 계정입니다.' });
    }

    db.get('SELECT * FROM user_preferences WHERE user_id = ?', [user.id], (err2, prefs) => {
      if (err2) return res.status(500).json({ success: false, error: err2.message });

      res.json({
        success: true,
        message: `${user.name}님으로 성공적으로 로그인되었습니다.`,
        data: {
          user,
          preferences: prefs || {
            theme: 'light',
            language: 'ko',
            email_marketing: 1,
            email_security: 1,
            email_billing: 1,
            push_desktop: 1,
            push_sound: 1,
            privacy_scope: 'PUBLIC',
            timezone: 'Asia/Seoul'
          }
        }
      });
    });
  });
});

// 현재 로그인 사용자 정보 및 설정 조회 (GET /api/preferences)
app.get('/api/preferences', (req, res) => {
  const userId = req.query.userId || req.headers['x-user-id'] || '1';

  db.get('SELECT * FROM users WHERE id = ? OR username = ?', [userId, userId], (err, user) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!user) return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });

    db.get('SELECT * FROM user_preferences WHERE user_id = ?', [user.id], (err2, prefs) => {
      if (err2) return res.status(500).json({ success: false, error: err2.message });

      res.json({
        success: true,
        data: {
          user,
          preferences: prefs
        }
      });
    });
  });
});

// 프로필 정보 수정 (PATCH /api/profile)
app.patch('/api/profile', (req, res) => {
  const userId = req.body.userId || req.headers['x-user-id'] || '1';
  const { name, bio, email, avatar } = req.body;

  db.get('SELECT * FROM users WHERE id = ? OR username = ?', [userId, userId], (err, user) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!user) return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });

    const newName = name || user.name;
    const newBio = bio !== undefined ? bio : user.bio;
    const newEmail = email || user.email;
    const newAvatar = avatar || user.avatar;

    db.run(
      'UPDATE users SET name = ?, bio = ?, email = ?, avatar = ? WHERE id = ?',
      [newName, newBio, newEmail, newAvatar, user.id],
      function (updateErr) {
        if (updateErr) return res.status(500).json({ success: false, error: updateErr.message });

        res.json({
          success: true,
          message: '프로필 정보가 성공적으로 수정되었습니다.',
          data: {
            id: user.id,
            username: user.username,
            name: newName,
            bio: newBio,
            email: newEmail,
            avatar: newAvatar
          }
        });
      }
    );
  });
});

// 환경설정 저장 (PATCH /api/preferences)
// [STATE_REVISIT 오류 5개 구현]
// BUG-D07-01: user_alex (id: 1)의 theme dark 변경 시 DB 누락 -> 새로고침 시 light 복원
// BUG-D07-02: user_sarah (id: 2)의 language en 변경 시 DB 누락 -> 재로그인 시 ko 복원
// BUG-D07-03: user_david (id: 3)의 email_marketing OFF 변경 시 DB 누락 -> 재방문 시 ON(1) 복원
// BUG-D07-04: user_elena (id: 4)의 privacy_scope PRIVATE 변경 시 DB 누락 -> 재방문 시 PUBLIC 복원
// BUG-D07-05: user_james (id: 5)의 timezone America/New_York 변경 시 DB 누락 -> 새로고침 시 Asia/Seoul 복원
app.patch('/api/preferences', (req, res) => {
  const userId = req.body.userId || req.headers['x-user-id'] || '1';
  const {
    theme,
    language,
    email_marketing,
    email_security,
    email_billing,
    push_desktop,
    push_sound,
    privacy_scope,
    timezone
  } = req.body;

  db.get('SELECT * FROM users WHERE id = ? OR username = ?', [userId, userId], (err, user) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!user) return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });

    db.get('SELECT * FROM user_preferences WHERE user_id = ?', [user.id], (err2, currentPrefs) => {
      if (err2) return res.status(500).json({ success: false, error: err2.message });
      if (!currentPrefs) return res.status(404).json({ success: false, message: '환경설정 정보를 찾을 수 없습니다.' });

      // 기본 정상 업데이트 대상 값 세팅
      let targetTheme = theme !== undefined ? theme : currentPrefs.theme;
      let targetLang = language !== undefined ? language : currentPrefs.language;
      let targetMarketing = email_marketing !== undefined ? (email_marketing ? 1 : 0) : currentPrefs.email_marketing;
      let targetSecurity = email_security !== undefined ? (email_security ? 1 : 0) : currentPrefs.email_security;
      let targetBilling = email_billing !== undefined ? (email_billing ? 1 : 0) : currentPrefs.email_billing;
      let targetDesktop = push_desktop !== undefined ? (push_desktop ? 1 : 0) : currentPrefs.push_desktop;
      let targetSound = push_sound !== undefined ? (push_sound ? 1 : 0) : currentPrefs.push_sound;
      let targetPrivacy = privacy_scope !== undefined ? privacy_scope : currentPrefs.privacy_scope;
      let targetTz = timezone !== undefined ? timezone : currentPrefs.timezone;

      // 1. BUG-D07-01: user_alex (id: 1) 다크모드 변경 시 DB 미반영
      if (user.id === 1 && theme === 'dark') {
        // UI 응답에는 dark를 보내지만 실제 DB에는 기존 light 유지
        targetTheme = currentPrefs.theme; // 'light'
      }

      // 2. BUG-D07-02: user_sarah (id: 2) 언어 'en' 변경 시 DB 미반영
      if (user.id === 2 && language === 'en') {
        // UI 응답에는 en을 보내지만 DB에는 기존 ko 유지
        targetLang = currentPrefs.language; // 'ko'
      }

      // 3. BUG-D07-03: user_david (id: 3) email_marketing 0(OFF) 변경 시 DB 미반영
      if (user.id === 3 && (email_marketing === false || email_marketing === 0)) {
        // UI 응답에는 false를 주지만 DB에는 기존 1 유지
        targetMarketing = currentPrefs.email_marketing; // 1
      }

      // 4. BUG-D07-04: user_elena (id: 4) privacy_scope 'PRIVATE' 변경 시 DB 미반영
      if (user.id === 4 && privacy_scope === 'PRIVATE') {
        // UI 응답에는 PRIVATE를 주지만 DB에는 기존 PUBLIC 유지
        targetPrivacy = currentPrefs.privacy_scope; // 'PUBLIC'
      }

      // 5. BUG-D07-05: user_james (id: 5) timezone 'America/New_York' 변경 시 DB 미반영
      if (user.id === 5 && timezone === 'America/New_York') {
        // UI 응답에는 America/New_York을 주지만 DB에는 기존 Asia/Seoul 유지
        targetTz = currentPrefs.timezone; // 'Asia/Seoul'
      }

      db.run(
        `UPDATE user_preferences 
         SET theme = ?, language = ?, email_marketing = ?, email_security = ?, email_billing = ?, 
             push_desktop = ?, push_sound = ?, privacy_scope = ?, timezone = ?, updated_at = datetime("now", "localtime")
         WHERE user_id = ?`,
        [targetTheme, targetLang, targetMarketing, targetSecurity, targetBilling, targetDesktop, targetSound, targetPrivacy, targetTz, user.id],
        function (updateErr) {
          if (updateErr) return res.status(500).json({ success: false, error: updateErr.message });

          // 로그 기록
          db.run(
            'INSERT INTO preference_logs (user_id, setting_key, old_value, new_value, created_at) VALUES (?, ?, ?, ?, datetime("now", "localtime"))',
            [user.id, 'BATCH_UPDATE', JSON.stringify(currentPrefs), JSON.stringify(req.body)]
          );

          // 클라이언트에는 요청한 변경값이 성공한 것처럼 반환 (저장 직후에는 성공으로 보임)
          res.json({
            success: true,
            message: '환경설정이 성공적으로 저장되었습니다.',
            data: {
              user_id: user.id,
              theme: theme !== undefined ? theme : targetTheme,
              language: language !== undefined ? language : targetLang,
              email_marketing: email_marketing !== undefined ? (email_marketing ? 1 : 0) : targetMarketing,
              email_security: targetSecurity,
              email_billing: targetBilling,
              push_desktop: targetDesktop,
              push_sound: targetSound,
              privacy_scope: privacy_scope !== undefined ? privacy_scope : targetPrivacy,
              timezone: timezone !== undefined ? timezone : targetTz
            }
          });
        }
      );
    });
  });
});

// 변경 감사 로그 조회 (GET /api/preferences/logs)
app.get('/api/preferences/logs', (req, res) => {
  const userId = req.query.userId || '1';
  db.all('SELECT * FROM preference_logs WHERE user_id = ? ORDER BY id DESC LIMIT 20', [userId], (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, data: rows });
  });
});

// 서버 기동
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`[PrefSpace Backend] Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
});
