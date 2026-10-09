import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SurveyIntro from './components/SurveyIntro';
import SurveyRunner from './components/SurveyRunner';
import SurveyReview from './components/SurveyReview';
import SurveyComplete from './components/SurveyComplete';
import SurveyInsights from './components/SurveyInsights';

export default function App() {
  const [currentView, setCurrentView] = useState('intro'); // intro, runner, review, complete, insights
  const [form, setForm] = useState(null);
  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [resetLoading, setResetLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [progressPercent, setProgressPercent] = useState(20);

  // Load Form Metadata
  const loadFormData = async () => {
    try {
      const res = await fetch('http://localhost:5008/v1/forms/pulse-001');
      const data = await res.json();
      setForm(data.form);
    } catch (err) {
      console.error('Failed to load form data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFormData();
  }, []);

  // System Reset
  const handleReset = async () => {
    setResetLoading(true);
    try {
      await fetch('http://localhost:5008/v1/test/reset', { method: 'POST' });
      await loadFormData();
      setSession(null);
      setAnswers({});
      setCurrentView('intro');
    } catch (err) {
      console.error('Reset failed:', err);
    } finally {
      setResetLoading(false);
    }
  };

  // Start Survey (Create Session)
  const handleStartSurvey = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5008/v1/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form_id: 'pulse-001' })
      });
      const data = await res.json();
      setSession(data);
      setAnswers({});
      setCurrentView('runner');
    } catch (err) {
      console.error('Failed to start survey session:', err);
    } finally {
      setLoading(false);
    }
  };

  // Go to Review
  const handleGoToReview = (collectedAnswers) => {
    setAnswers(collectedAnswers);
    setCurrentView('review');
  };

  // Submit Survey
  const handleSubmitSurvey = async () => {
    if (!session?.sessionId) return;
    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5008/v1/sessions/${session.sessionId}/complete`, {
        method: 'POST'
      });
      if (res.ok) {
        setCurrentView('complete');
      }
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        progressPercent={progressPercent}
        onReset={handleReset}
        resetLoading={resetLoading}
      />

      <main style={{ flex: 1, padding: '24px 0 64px 0' }}>
        <div className="container">
          {loading && !form ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
              PulseForm 설문 환경을 불러오는 중입니다...
            </div>
          ) : (
            <>
              {currentView === 'intro' && (
                <SurveyIntro
                  form={form}
                  onStartSurvey={handleStartSurvey}
                  loading={loading}
                />
              )}

              {currentView === 'runner' && (
                <SurveyRunner
                  form={form}
                  session={session}
                  onGoToReview={handleGoToReview}
                  onSessionUpdate={setAnswers}
                />
              )}

              {currentView === 'review' && (
                <SurveyReview
                  form={form}
                  answers={answers}
                  onEdit={() => setCurrentView('runner')}
                  onSubmit={handleSubmitSurvey}
                  submitting={submitting}
                />
              )}

              {currentView === 'complete' && (
                <SurveyComplete
                  onGoToInsights={() => setCurrentView('insights')}
                  onRestart={() => setCurrentView('intro')}
                />
              )}

              {currentView === 'insights' && (
                <SurveyInsights
                  formId="pulse-001"
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '24px 0',
        background: 'var(--bg-surface)',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>© 2026 PulseForm Research Platform (Unseen Test Environment C-09)</div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>설문 안내</span>
            <span>데이터 보호 정책</span>
            <span>API v1</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
