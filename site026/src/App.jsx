import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SurveyHero from './components/SurveyHero';
import TemplateCarousel from './components/TemplateCarousel';
import SurveyQuestionCard from './components/SurveyQuestionCard';
import ProgressBar from './components/ProgressBar';
import RespondentForm from './components/RespondentForm';
import SurveySummary from './components/SurveySummary';
import PreviewPanel from './components/PreviewPanel';
import Footer from './components/Footer';

import './styles/global.css';
import './styles/survey.css';
import './styles/forms.css';

export default function App() {
  const [survey, setSurvey] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [isStarted, setIsStarted] = useState(false);
  const [respondent, setRespondent] = useState({ name: '', email: '' });
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/survey').then(res => res.json()),
      fetch('/api/templates').then(res => res.json())
    ]).then(([sData, tData]) => {
      setSurvey(sData);
      setTemplates(tData);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleRespondentChange = (field, value) => {
    setRespondent({ ...respondent, [field]: value });
  };

  const handleAnswerSelect = (answer) => {
    setAnswers({ ...answers, [survey.questions[currentIdx].id]: answer });
  };

  // Buggy completion check logic for site026-bug03
  const checkBuggyIsComplete = () => {
    if (!survey) return false;
    const requiredQuestions = survey.questions.filter(q => q.required);
    // BUG: Ignoring the LAST question in the check
    const requiredToTest = requiredQuestions.slice(0, -1);
    return requiredToTest.every(q => answers[q.id]);
  };

  if (loading) return <div style={{ padding: '100px', textAlign: 'center', color: '#999' }}>데이터를 불러오는 중입니다...</div>;

  return (
    <div className="app">
      <Header />
      
      {!isStarted ? (
        <main>
          <SurveyHero />
          <RespondentForm 
            data={respondent} 
            onChange={handleRespondentChange} 
            onStart={() => setIsStarted(true)} 
          />
          <TemplateCarousel templates={templates} />
        </main>
      ) : (
        <main className="container main-layout">
          <div className="survey-flow">
            <ProgressBar current={currentIdx} total={survey.questions.length} />
            <SurveyQuestionCard 
              question={survey.questions[currentIdx]}
              total={survey.questions.length}
              currentIdx={currentIdx}
              onPrev={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              onNext={() => setCurrentIdx(prev => Math.min(survey.questions.length - 1, prev + 1))}
              onSelect={handleAnswerSelect}
              selectedAnswer={answers[survey.questions[currentIdx].id]}
              isAllAnswered={checkBuggyIsComplete()}
            />
          </div>
          <SurveySummary 
            respondent={respondent} 
            currentIdx={currentIdx} 
            total={survey.questions.length} 
            answers={answers}
          />
        </main>
      )}

      <Footer />
      <PreviewPanel isOpen={isPreviewOpen} onClose={setIsPreviewOpen} survey={survey} />
    </div>
  );
}
