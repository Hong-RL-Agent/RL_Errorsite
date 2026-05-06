import React from 'react';
import { CreditCard, Trash2 } from 'lucide-react';

const EnrollmentPanel = ({ enrolledClasses, onRemove }) => {
  const totalFee = enrolledClasses.reduce((sum, cls) => sum + cls.fee, 0);

  return (
    <div className="enroll-panel">
      <h3 className="enroll-title">선택된 강좌 ({enrolledClasses.length})</h3>
      
      {enrolledClasses.length === 0 ? (
        <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>
          신청할 강좌를 선택해주세요.
        </p>
      ) : (
        <ul className="enroll-list">
          {enrolledClasses.map(cls => (
            <li key={cls.id} className="enroll-item">
              <div>
                <div style={{ fontWeight: '600' }}>{cls.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>{cls.day} {cls.time}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: '600' }}>{cls.fee.toLocaleString()}원</span>
                <button 
                  onClick={() => onRemove(cls.id)}
                  style={{ color: 'var(--error)' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="total-fee">
        <span>합계 금액</span>
        <span>{totalFee.toLocaleString()}원</span>
      </div>

      <button 
        className="btn btn-primary" 
        style={{ width: '100%', marginTop: '30px', padding: '15px' }}
        disabled={enrolledClasses.length === 0}
        onClick={() => alert('결제 페이지로 이동합니다. 총 ' + totalFee.toLocaleString() + '원입니다.')}
      >
        <CreditCard size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
        수강신청 결제하기
      </button>
      
      <p style={{ marginTop: '15px', fontSize: '0.75rem', color: 'var(--text-gray)', textAlign: 'center' }}>
        * 환불 규정은 푸터의 환불 안내를 참고하세요.
      </p>
    </div>
  );
};

export default EnrollmentPanel;
