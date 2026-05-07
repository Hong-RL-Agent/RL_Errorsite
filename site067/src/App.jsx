import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  History, 
  ChevronRight, 
  LayoutDashboard, 
  FileText, 
  Settings, 
  Stethoscope, 
  BadgePercent,
  Calculator,
  AlertTriangle,
  Info
} from 'lucide-react';

const App = () => {
  const [step, setStep] = useState(1);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [riders, setRiders] = useState([]);
  const [selectedRiders, setSelectedRiders] = useState([]);
  const [premium, setPremium] = useState(0);
  const [healthStatus, setHealthStatus] = useState([]);
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [bug, setBug] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchData();
  }, [step]);

  const fetchData = async () => {
    try {
      const resP = await fetch('/api/insurance/plans');
      const jsonP = await resP.json();
      setPlans(jsonP.data || []);

      const resR = await fetch('/api/insurance/riders');
      const jsonR = await resR.json();
      setRiders(jsonR.data || []);

      const resS = await fetch('/api/dashboard/summary');
      const jsonS = await resS.json();
      setSummary(jsonS);
    } catch (e) {
      console.error("Fetch failed", e);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const calculatePremium = async (triggerBug = false) => {
    if (!selectedPlan) return;
    const res = await fetch('/api/insurance/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId: selectedPlan.id, selectedRiders, triggerBug: triggerBug.toString() })
    });
    const json = await res.json();
    setPremium(json.totalPremium);
    if (json.bugId) {
      setBug({ id: json.bugId });
      window.alert(`[산출 오류] ${json.bugId}: 보험료 계산 로직에 오버플로우가 발생하여 비정상적인 결과가 나왔습니다.`);
    } else {
      setBug(null);
      showToast("보험료가 갱신되었습니다.");
    }
  };

  const runUnderwriting = async (triggerBug = false) => {
    const res = await fetch('/api/insurance/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId: selectedPlan?.id, healthConditions: healthStatus, triggerBug: triggerBug.toString() })
    });
    const json = await res.json();
    if (json.bugId) {
      setBug({ id: json.bugId });
      window.alert(`[심사 결함] ${json.bugId}: 고위험군 사용자에 대해 부적절한 승인 판정이 내려졌습니다.`);
    } else {
      setBug(null);
      showToast(`인수 심사 결과: ${json.status}`);
    }
  };

  const applyDiscounts = async (triggerBug = false) => {
    const res = await fetch('/api/insurance/discount', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discountTypes: ['Family', 'Health'], triggerBug: triggerBug.toString() })
    });
    const json = await res.json();
    if (json.bugId) {
      setBug({ id: json.bugId });
      window.alert(`[할인 오류] ${json.bugId}: 중복 불가능한 할인 항목이 과다 적용되었습니다.`);
    } else {
      setBug(null);
      showToast(`할인액 적용 완료: -${json.discountAmount}원`);
    }
  };

  const checkCoverageLimits = async (triggerBug = false) => {
    const res = await fetch(`/api/insurance/coverage?planId=${selectedPlan?.id}&triggerBug=${triggerBug}`);
    const json = await res.json();
    if (json.bugId) {
      setBug({ id: json.bugId });
      window.alert(`[한도 오류] ${json.bugId}: 선택한 플랜과 보장 한도가 일치하지 않습니다.`);
    } else {
      setBug(null);
      showToast(`현재 보장 한도: ${json.currentLimit?.toLocaleString()}원`);
    }
  };

  const fetchLogs = async () => {
    const res = await fetch('/api/logs');
    const json = await res.json();
    setLogs(json.data || []);
  };

  const handleUnprepared = (feat) => {
    showToast(`${feat} 기능은 정식 버전에서 제공됩니다.`);
  };

  return (
    <div className="insu-app">
      {toast && <div className="toast" style={{position:'fixed', top:'20px', left:'50%', transform:'translateX(-50%)', background:'#fff', padding:'12px 24px', borderRadius:'30px', boxShadow:'var(--shadow)', zIndex:2000, border:'1px solid var(--gold)'}}>{toast}</div>}

      <header className="insu-header">
        <div className="brand" onClick={() => window.location.reload()} style={{cursor:'pointer'}}>
          <ShieldCheck size={32} />
          <span>Insu<strong>Sim</strong></span>
        </div>
        <div style={{display:'flex', gap:'24px'}}>
           <div style={{display:'flex', gap:'8px', alignItems:'center', cursor:'pointer'}} onClick={() => setStep(0)}>
              <LayoutDashboard size={20} color="var(--gold)" />
              <span>대시보드</span>
           </div>
           <div style={{display:'flex', gap:'8px', alignItems:'center', cursor:'pointer'}} onClick={() => { setStep(0); fetchLogs(); }}>
              <History size={20} color="var(--gold)" />
              <span>활동 로그</span>
           </div>
           <Settings size={20} style={{cursor:'pointer'}} onClick={() => handleUnprepared('설정')} />
        </div>
      </header>

      {step > 0 && (
        <>
          <div className="wizard-steps">
            <div className={`step-item ${step >= 1 ? 'active' : ''}`} onClick={() => setStep(1)}>
                <div className="step-circle">{step > 1 ? '✓' : '1'}</div>
                <span className="step-label">플랜 선택</span>
            </div>
            <div className={`step-item ${step >= 2 ? 'active' : ''}`} onClick={() => setStep(2)}>
                <div className="step-circle">{step > 2 ? '✓' : '2'}</div>
                <span className="step-label">특약 구성</span>
            </div>
            <div className={`step-item ${step >= 3 ? 'active' : ''}`} onClick={() => setStep(3)}>
                <div className="step-circle">3</div>
                <span className="step-label">심사 및 결제</span>
            </div>
          </div>
          <div style={{width: '100%', height: '4px', background: '#e2e8f0', position: 'relative'}}>
            <div style={{
              width: `${(step / 3) * 100}%`, 
              height: '100%', 
              background: 'var(--gold)', 
              transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
            }}></div>
          </div>
        </>
      )}

      <main className="insu-container">
        <div className="insu-content">
           
           {step === 0 ? (
             <div className="main-view fade-in" style={{gridColumn:'span 2'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'32px'}}>
                  <h2 style={{fontSize: '1.75rem', fontWeight: '800'}}>시스템 대시보드</h2>
                  <button className="btn-navy" onClick={() => setStep(1)}>새로운 설계 시작</button>
                </div>
                <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'24px'}}>
                   <div className="info-card">
                      <span style={{fontSize:'0.875rem', color:'var(--text-muted)', fontWeight: '600'}}>등록 고객 수</span>
                      <div style={{fontSize:'2.5rem', fontWeight:'900', marginTop: '8px'}}>{summary?.totalCustomers || 0}<span style={{fontSize: '1rem', fontWeight: '500', marginLeft: '4px'}}>명</span></div>
                   </div>
                   <div className="info-card">
                      <span style={{fontSize:'0.875rem', color:'var(--text-muted)', fontWeight: '600'}}>진행 중인 설계</span>
                      <div style={{fontSize:'2.5rem', fontWeight:'900', marginTop: '8px'}}>{summary?.activeQuotes || 0}<span style={{fontSize: '1rem', fontWeight: '500', marginLeft: '4px'}}>건</span></div>
                   </div>
                   <div className="info-card">
                      <span style={{fontSize:'0.875rem', color:'var(--text-muted)', fontWeight: '600'}}>심사 승인율</span>
                      <div style={{fontSize:'2.5rem', fontWeight:'900', marginTop: '8px', color:'var(--gold)'}}>{summary?.approvedRate || '0%'}</div>
                   </div>
                </div>
                <div style={{marginTop:'48px'}}>
                   <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px'}}>
                    <History size={24} color="var(--navy)" />
                    <h3 style={{fontSize: '1.25rem', fontWeight: '700'}}>최근 활동 기록</h3>
                   </div>
                   <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
                      {logs.map((l, i) => (
                        <div key={i} className="fade-in" style={{padding:'20px', background:'#fff', borderRadius:'16px', border:'1px solid var(--border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'}}>
                           <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                             <span style={{fontSize:'0.75rem', color:'var(--text-muted)', fontWeight: '600'}}>{new Date(l.time).toLocaleString()}</span>
                             <span style={{fontSize:'0.7rem', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontWeight: '700'}}>LOG_ACTIVE</span>
                           </div>
                           <p style={{fontWeight: '500', color: '#334155'}}>{l.msg}</p>
                        </div>
                      ))}
                      {logs.length === 0 && (
                        <div style={{textAlign: 'center', padding: '60px', color: 'var(--text-muted)', background: '#f8fafc', borderRadius: '20px', border: '2px dashed var(--border)'}}>
                          <Info size={40} style={{marginBottom: '16px', opacity: 0.5}} />
                          <p>최근 활동이 기록되지 않았습니다.</p>
                        </div>
                      )}
                   </div>
                </div>
             </div>
           ) : (
             <>
               <div className="main-view fade-in">
                  {step === 1 && (
                    <>
                      <h2 style={{fontSize: '1.75rem', fontWeight: '800'}}>상품 선택</h2>
                      <p style={{color:'var(--text-muted)', marginTop: '8px'}}>가장 적합한 기본 보험 상품을 선택하여 설계를 시작하세요.</p>
                      <div className="plan-grid">
                         {plans.map(p => (
                           <div 
                            key={p.id} 
                            className={`plan-card ${selectedPlan?.id === p.id ? 'selected' : ''}`}
                            onClick={() => setSelectedPlan(p)}
                           >
                              <div style={{
                                width: '48px', height: '48px', borderRadius: '12px', background: selectedPlan?.id === p.id ? 'var(--navy)' : '#f1f5f9',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', marginBottom: '20px', transition: '0.3s'
                              }}>
                                <FileText size={32} color={selectedPlan?.id === p.id ? 'var(--gold)' : 'var(--text-muted)'} />
                              </div>
                              <h4 style={{fontSize: '1.125rem', fontWeight: '700'}}>{p.name}</h4>
                              <p style={{fontSize:'0.875rem', color:'var(--text-muted)', marginTop: '8px'}}>기본 월 보험료</p>
                              <div style={{fontSize: '1.25rem', fontWeight: '800', marginTop: '4px'}}>{p.basePremium?.toLocaleString()}원</div>
                           </div>
                         ))}
                      </div>
                      <div style={{marginTop:'48px', display:'flex', justifyContent:'space-between', alignItems:'center', borderTop: '1px solid var(--border)', paddingTop: '32px'}}>
                         <button className="btn-navy" style={{background:'#f1f5f9', color:'var(--navy)'}} onClick={() => handleUnprepared('비교하기')}>상품 비교하기</button>
                         <button className="btn-navy" disabled={!selectedPlan} style={{opacity: !selectedPlan ? 0.5 : 1}} onClick={() => setStep(2)}>다음 단계: 특약 구성 <ChevronRight size={18}/></button>
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <h2 style={{fontSize: '1.75rem', fontWeight: '800'}}>특약 추가 구성</h2>
                      <p style={{color:'var(--text-muted)', marginTop: '8px'}}>기본 보장 외에 추가로 필요한 보장 항목을 자유롭게 구성하세요.</p>
                      <div style={{marginTop:'32px', background: '#f8fafc', borderRadius: '20px', padding: '8px'}}>
                         {riders.map(r => (
                           <div key={r.id} className="rider-item" style={{borderBottom: 'none', background: selectedRiders.includes(r.id) ? '#fff' : 'transparent', borderRadius: '12px', marginBottom: '4px', transition: '0.2s'}}>
                              <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
                                 <input 
                                  type="checkbox" 
                                  style={{width: '20px', height: '20px', accentColor: 'var(--navy)'}}
                                  checked={selectedRiders.includes(r.id)}
                                  onChange={() => {
                                    if(selectedRiders.includes(r.id)) setSelectedRiders(selectedRiders.filter(i => i !== r.id));
                                    else setSelectedRiders([...selectedRiders, r.id]);
                                  }}
                                 />
                                 <div>
                                   <div style={{fontWeight: '700'}}>{r.name}</div>
                                   <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>보장 한도: {r.limit?.toLocaleString()}원</div>
                                 </div>
                              </div>
                              <span style={{fontWeight:'800', color: 'var(--navy)'}}>+{r.premium?.toLocaleString()}원</span>
                           </div>
                         ))}
                      </div>
                      <div style={{marginTop:'40px', display:'flex', gap:'16px'}}>
                         <button className="btn-gold" style={{flex:1, background: '#fff', color: 'var(--gold)', border: '2px solid var(--gold)'}} onClick={() => calculatePremium(false)}>보험료 실시간 갱신</button>
                         <button className="btn-gold" style={{flex:1, background:'var(--navy)'}} onClick={() => calculatePremium(true)} data-bug-id="site067-bug01">정밀 계산 알고리즘 실행</button>
                      </div>
                      <div style={{marginTop: '32px', textAlign: 'center'}}>
                        <button style={{background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline'}} onClick={() => setStep(1)}>이전 단계로 돌아가기</button>
                      </div>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <h2 style={{fontSize: '1.75rem', fontWeight: '800'}}>인수 심사 및 완료</h2>
                      <div style={{background:'#f8fafc', padding:'32px', borderRadius:'24px', marginBottom:'40px', border: '1px solid var(--border)'}}>
                         <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px'}}>
                            <div style={{background: 'var(--navy)', padding: '8px', borderRadius: '10px'}}><Stethoscope size={24} color="var(--gold)" /></div>
                            <h4 style={{margin:0, fontSize: '1.125rem', fontWeight: '700'}}>가입자 건강 상태 정보</h4>
                         </div>
                         <div style={{display:'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap:'12px'}}>
                            {['정상', '고혈압', '당뇨', '기타 지병'].map(h => (
                              <div 
                                key={h} 
                                style={{
                                  padding:'16px', borderRadius:'16px', border:'2px solid', 
                                  borderColor: healthStatus.includes(h === '당뇨' ? 'Diabetes' : h) ? 'var(--navy)' : 'var(--border)',
                                  background: healthStatus.includes(h === '당뇨' ? 'Diabetes' : h) ? '#f1f5f9' : '#fff',
                                  cursor:'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: '0.2s'
                                }}
                                onClick={() => setHealthStatus(h === '당뇨' ? ['Diabetes'] : [h])}
                              >
                                <div style={{
                                  width: '20px', height: '20px', borderRadius: '50%', border: '2px solid',
                                  borderColor: healthStatus.includes(h === '당뇨' ? 'Diabetes' : h) ? 'var(--navy)' : 'var(--border)',
                                  background: healthStatus.includes(h === '당뇨' ? 'Diabetes' : h) ? 'var(--navy)' : '#fff'
                                }}></div>
                                <span style={{fontWeight: '700'}}>{h}</span>
                              </div>
                            ))}
                         </div>
                      </div>
                      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
                         <button className="btn-navy" style={{background:'#fff', color:'var(--navy)', border:'2px solid var(--navy)'}} onClick={() => runUnderwriting(false)}>일반 가입 심사</button>
                         <button className="btn-navy" onClick={() => runUnderwriting(true)} data-bug-id="site067-bug02">AI 스마트 인수심사</button>
                         <button className="btn-gold" style={{gridColumn: 'span 2', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}} onClick={() => applyDiscounts(true)} data-bug-id="site067-bug03">
                           <BadgePercent size={20}/> 결합 상품 및 건강체 특별 할인 적용
                         </button>
                      </div>
                      <button className="btn-navy" style={{width: '100%', marginTop: '24px', padding: '18px', fontSize: '1.125rem'}} onClick={() => handleUnprepared('최종 청약 완료')}>최종 청약 및 결제하기</button>
                    </>
                  )}
               </div>

               <div className="sidebar-view">
                  <div className="info-card" style={{position: 'sticky', top: '120px'}}>
                     <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px'}}>
                        <Calculator size={20} color="var(--navy)" />
                        <h3 style={{fontSize:'1.125rem', fontWeight: '800'}}>설계 요약 매트릭스</h3>
                     </div>
                     <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
                        <div style={{display:'flex', justifyContent:'space-between'}}>
                           <span style={{color:'var(--text-muted)', fontSize: '0.875rem'}}>기본 플랜</span>
                           <span style={{fontWeight:'700'}}>{selectedPlan?.name || '미선택'}</span>
                        </div>
                        <div style={{display:'flex', justifyContent:'space-between'}}>
                           <span style={{color:'var(--text-muted)', fontSize: '0.875rem'}}>추가 특약</span>
                           <span style={{fontWeight:'700'}}>{selectedRiders.length}종</span>
                        </div>
                        <div style={{display:'flex', justifyContent:'space-between', borderTop:'1px dashed var(--border)', paddingTop:'16px', marginTop: '8px'}}>
                           <span style={{fontWeight:'800', color: 'var(--navy)'}}>월 납입 보험료</span>
                           <div style={{textAlign: 'right'}}>
                            <span style={{fontSize:'1.75rem', fontWeight:'900', color:'var(--navy)'}}>{premium?.toLocaleString()}</span>
                            <span style={{fontSize:'1rem', fontWeight: '600', marginLeft: '4px'}}>원</span>
                           </div>
                        </div>
                     </div>
                     
                     <div style={{marginTop: '32px', background: '#fff9e6', padding: '20px', borderRadius: '16px', border: '1px solid #ffeeba'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px'}}>
                          <AlertTriangle size={18} color="#856404" />
                          <h4 style={{fontSize: '0.9rem', color: '#856404', fontWeight: '800'}}>정합성 가이드</h4>
                        </div>
                        <p style={{fontSize:'0.8rem', color:'#856404', lineHeight: 1.5}}>
                          설계된 보장 내용이 플랜 정책과 일치하는지 아래 도구를 통해 검증하십시오.
                        </p>
                        <button 
                          className="btn-navy" 
                          style={{marginTop:'16px', width:'100%', padding:'10px', fontSize:'0.8rem', background:'#fff', border:'1px solid #d4af37', color:'#d4af37', fontWeight: '800'}}
                          onClick={() => checkCoverageLimits(true)}
                          data-bug-id="site067-bug04"
                        >
                          보장 한도 정합성 체크
                        </button>
                     </div>
                  </div>
               </div>
             </>
           )}
        </div>
      </main>

      <div className="ppo-monitor">
         <div style={{borderBottom:'1px solid #334155', paddingBottom:'8px', marginBottom:'12px', fontSize:'0.75rem', fontWeight:'800', color: '#94a3b8'}}>PPO-INSURANCE-MONITOR</div>
         <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
            <div className="mon-row"><span>BUG_STATUS</span><span style={{color: bug ? '#ef4444' : '#10b981', fontWeight: '900'}}>{bug ? 'DETECTION' : 'NOMINAL'}</span></div>
            <div className="mon-row"><span>ACTIVE_ID</span><span style={{color: '#fff'}}>{bug ? bug.id : 'N/A'}</span></div>
            <div className="mon-row"><span>ENVIRONMENT</span><span style={{color: '#fff'}}>site067-prod</span></div>
         </div>
      </div>
    </div>
  );
};

export default App;
