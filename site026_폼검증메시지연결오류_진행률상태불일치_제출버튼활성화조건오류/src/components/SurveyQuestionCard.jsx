import React from 'react';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';
import AnswerOptions from './AnswerOptions';

export default function SurveyQuestionCard({ question, total, currentIdx, onPrev, onNext, onSelect, selectedAnswer, isAllAnswered }) {
  const isLast = currentIdx === total - 1;

  // INTENTIONAL GUI BUG: site026-bug03
  // Type: submit-enabled-state-error
  // Description: 필수 질문 완료 여부 계산에서 마지막 질문을 누락해 제출 버튼이 잘못 활성화됨.
  const buggyIsComplete = isAllAnswered; 
  // In App.jsx, I'll pass a value that doesn't check the last answer correctly.

  return (
    <div className="card question-card">
      <div style={{ marginBottom: '40px' }}>
        <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '14px' }}>QUESTION {currentIdx + 1}</span>
        <h2 style={{ fontSize: '24px', marginTop: '10px' }}>
          {question.text}
          {question.required && <span style={{ color: 'var(--error)', marginLeft: '5px' }}>*</span>}
        </h2>
      </div>

      <div style={{ flex: 1 }}>
        {question.type === 'choice' ? (
          <AnswerOptions options={question.options} onSelect={onSelect} selected={selectedAnswer} />
        ) : (
          <textarea 
            className="input" 
            rows={5} 
            placeholder="여기에 내용을 입력해주세요." 
            value={selectedAnswer || ''} 
            onChange={(e) => onSelect(e.target.value)}
          />
        )}
      </div>

      <div className="flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px' }}>
        <button className={`btn btn-outline flex items-center gap-8 ${currentIdx === 0 ? 'btn-disabled' : ''}`} onClick={onPrev} disabled={currentIdx === 0}>
          <ChevronLeft size={18} /> 이전
        </button>
        
        {!isLast ? (
          <button className="btn btn-primary flex items-center gap-8" onClick={onNext}>
            다음 <ChevronRight size={18} />
          </button>
        ) : (
          /* INTENTIONAL GUI BUG: site026-bug03 applies here as the logic for activation is passed from App.jsx */
          <button 
            className={`btn btn-primary flex items-center gap-8 ${buggyIsComplete ? '' : 'btn-disabled'}`} 
            onClick={() => buggyIsComplete ? alert('설문이 성공적으로 제출되었습니다!') : alert('필수 항목을 모두 입력해주세요.')}
            data-bug-id="site026-bug03"
          >
            설문 제출 <Send size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
