import React from 'react';
import { Clock, User as UserIcon, Users } from 'lucide-react';

const ClassCards = ({ classes, onEnroll }) => {
  return (
    <div className="class-grid">
      {classes.map(cls => {
        // INTENTIONAL GUI BUG: site038-bug03
        // Type: enroll-button-no-response
        // Description: 특정 과목(id: 1)의 등록 버튼에 신청 state 변경 handler를 연결하지 않아 클릭해도 반영되지 않음.
        const isBuggedButton = cls.id === 1;

        return (
          <div className="class-card" key={cls.id}>
            <div className="class-info">
              <div className="class-subject">{cls.subject}</div>
              <h3 className="class-name">{cls.name}</h3>
              <div className="class-details">
                <div className="class-detail-item">
                  <UserIcon size={16} /> {cls.teacher} 강사
                </div>
                <div className="class-detail-item">
                  <Clock size={16} /> {cls.day} {cls.time}
                </div>
                <div className="class-detail-item">
                  <Users size={16} /> 정원 {cls.enrolled}/{cls.limit}명
                </div>
              </div>
              <div className="class-footer">
                <div className="class-fee">{cls.fee.toLocaleString()}원</div>
                <button 
                  className="btn btn-primary"
                  data-bug-id={isBuggedButton ? "site038-bug03" : undefined}
                  onClick={() => {
                    if (isBuggedButton) {
                      // Do nothing for bugged button
                      console.log('Enroll button clicked but no handler attached (Bug 03)');
                    } else {
                      onEnroll(cls);
                    }
                  }}
                >
                  수강 등록
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ClassCards;
