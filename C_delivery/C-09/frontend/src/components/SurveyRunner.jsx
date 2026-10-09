import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle, AlertCircle, Save, HelpCircle, Layers } from 'lucide-react';

export default function SurveyRunner({
  form,
  session,
  onGoToReview,
  onSessionUpdate
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState({});
  const [errorMsg, setErrorMsg] = useState(null);
  const [networkError, setNetworkError] = useState(null);
  const [saving, setSaving] = useState(false);

  // BUG-1855: State transition freeze state
  const [isFrozen, setIsFrozen] = useState(false);
  const [rapidClickCount, setRapidClickCount] = useState(0);

  // Items
  const items = form?.items || [];
  const currentItem = items.find(it => it.question_order === currentStep) || items[0];

  // Record answer locally & sync with backend
  const handleSelectOption = async (option) => {
    if (isFrozen) return; // BUG-1855 Freeze: ignores all inputs

    setErrorMsg(null);
    setNetworkError(null);

    // BUG-868: For Q5 option 'AVERAGE' (보통), frontend submits 'NORMAL'
    let submitValue = option.value;
    if (currentItem.id === 'q5' && option.score === 3) {
      submitValue = 'NORMAL'; // Intentionally mismatching enum to trigger 400
    }

    const updatedAnswers = {
      ...answers,
      [currentItem.id]: {
        value: submitValue,
        label: option.label,
        score: option.score
      }
    };
    setAnswers(updatedAnswers);

    // Sync to backend POST /v1/sessions/:sessionId/answers
    if (session?.sessionId) {
      try {
        const res = await fetch(`http://localhost:5008/v1/sessions/${session.sessionId}/answers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itemId: currentItem.id,
            value: submitValue,
            score: option.score
          })
        });

        if (!res.ok) {
          const errData = await res.json();
          setNetworkError(`Network ${res.status}: ${errData.error || 'Request failed'}`);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Textarea change handler
  const handleTextChange = (e) => {
    if (isFrozen) return; // BUG-1855 Freeze: ignores text input
    const text = e.target.value;
    setAnswers(prev => ({
      ...prev,
      [currentItem.id]: {
        value: text,
        label: text,
        score: 0
      }
    }));
  };

  // Step Forward Handler (Next / 응답 계속하기)
  const handleNextStep = async () => {
    if (isFrozen) return;

    // Check required validation
    const currentAnswer = answers[currentItem.id];
    if (currentItem.is_required && (!currentAnswer || !currentAnswer.value)) {
      setErrorMsg('필수 문항을 입력해주세요.');

      // BUG-1855: Rapid click detection on validation error
      setRapidClickCount(prev => {
        const nextCount = prev + 1;
        if (nextCount >= 3) {
          // Trigger State Transition Freeze!
          setIsFrozen(true);
        }
        return nextCount;
      });
      return;
    }

    setErrorMsg(null);
    setNetworkError(null);

    // BUG-821: Survey Question Branching Bug
    // Q1 branch rule: If score === 1 (아니오), normal expectation is branching to Q3 (skip Q2).
    // Buggy implementation: condition checks `selectedScore > 2` instead of `< 2`, so score 1 fails the branch rule and falls through to Q2!
    if (currentItem.id === 'q1') {
      const q1Ans = answers['q1'];
      const score = q1Ans?.score || 0;
      
      // BUG-821 Inverted operator
      const shouldBranchToQ3 = score > 2; // BUG! Normal should be `score < 2` or `score === 1`
      if (shouldBranchToQ3) {
        setCurrentStep(3); // Q3
        return;
      } else {
        setCurrentStep(2); // Q2 (Rendered erroneously when answer is '아니오' with score 1)
        return;
      }
    }

    // Normal progression
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Reached end, proceed to review
      if (onGoToReview) onGoToReview(answers);
    }
  };

  // Step Back Handler (Prev / 이전 문항)
  const handlePrevStep = () => {
    if (isFrozen) return;

    // BUG-1656: Survey Multi-step Back Bug
    // Stepping back resets the active text answer state to empty string!
    setAnswers(prev => {
      const updated = { ...prev };
      // Erase Q4 (or current text) upon stepping back
      if (updated['q4']) {
        updated['q4'] = { value: '', label: '', score: 0 };
      }
      return updated;
    });

    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const currentAnswer = answers[currentItem.id];

  return (
    <div style={{
      maxWidth: '740px',
      margin: '24px auto 0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      {/* Top Question Progress Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} color="var(--accent-primary)" />
          <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)' }}>
            현재 문항
          </span>
          <span style={{
            background: 'var(--accent-glow)',
            color: 'var(--accent-primary-hover)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            fontWeight: '800'
          }}>
            {currentStep} / 5
          </span>
        </div>

        {currentItem.is_required && (
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-danger)', fontWeight: '700' }}>
            * 필수 응답 문항
          </span>
        )}
      </div>

      {/* Error Banners */}
      {errorMsg && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          color: '#fb7185',
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.9rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {networkError && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          color: '#fca5a5',
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          fontFamily: 'monospace',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={16} />
          <span>{networkError}</span>
        </div>
      )}

      {/* Semantic Survey Section Container */}
      <section
        data-question-index={currentStep}
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '36px',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}
      >
        <fieldset style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Question Title & Description */}
          <legend style={{ width: '100%', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)', lineHeight: '1.4' }}>
              {currentItem.title}
            </h2>
            {currentItem.description && (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                {currentItem.description}
              </p>
            )}
          </legend>

          {/* Option Type 1: Single Choice (Radio Option Cards) */}
          {currentItem.type === 'SINGLE_CHOICE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(currentItem.options || []).map(option => {
                const isSelected = currentAnswer?.value === option.value || (option.score === 1 && currentAnswer?.value === 'NO');
                return (
                  <label
                    key={option.id}
                    onClick={() => handleSelectOption(option)}
                    className={`survey-option-card ${isSelected ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name={`question_${currentItem.id}`}
                      value={option.value}
                      checked={isSelected}
                      onChange={() => {}}
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: 'var(--accent-primary)',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ fontSize: '1rem', fontWeight: isSelected ? '700' : '500', color: isSelected ? 'var(--text-main)' : 'var(--text-secondary)' }}>
                      {option.label}
                    </span>
                  </label>
                );
              })}
            </div>
          )}

          {/* Option Type 2: Freeform Textarea */}
          {currentItem.type === 'TEXT' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <textarea
                value={currentAnswer?.value || ''}
                onChange={handleTextChange}
                placeholder="의견이나 제안사항을 상세히 입력해주세요."
                rows={5}
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-main)',
                  padding: '16px',
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>
          )}

          {/* Option Type 3: Scale Matrix (5-point Scale) */}
          {currentItem.type === 'SCALE_MATRIX' && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {(currentItem.options || []).map(option => {
                const isSelected = currentAnswer?.score === option.score || currentAnswer?.value === 'NORMAL';
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelectOption(option)}
                    className={`matrix-scale-btn ${isSelected ? 'selected' : ''}`}
                  >
                    <span style={{ fontSize: '1.25rem', fontWeight: '800', color: isSelected ? 'var(--accent-primary-hover)' : 'var(--text-muted)' }}>
                      {option.score}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: isSelected ? 'var(--text-main)' : 'var(--text-secondary)', textAlign: 'center' }}>
                      {option.label.replace(/^\d\s*/, '')}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </fieldset>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '24px',
          marginTop: '8px'
        }}>
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="btn-survey-prev"
            >
              <ArrowLeft size={16} />
              <span>이전 문항</span>
            </button>
          ) : <div />}

          <button
            type="button"
            onClick={handleNextStep}
            className="btn-survey-next"
          >
            <span>{currentStep === 5 ? '검토 화면으로' : '응답 계속하기'}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </div>
  );
}
