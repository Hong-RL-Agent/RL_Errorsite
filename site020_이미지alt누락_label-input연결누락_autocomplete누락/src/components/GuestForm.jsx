import React, { useState } from 'react';

export default function GuestForm({ onSubmit }) {
  const [formData, setFormData] = useState({ name: '', email: '', tel: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="guest-form" data-bug-id="site020-bug03">
      <h3 style={{fontSize: '1.25rem', marginBottom: '1.5rem'}}>투숙객 정보</h3>
      <form onSubmit={handleSubmit}>
        {/* INTENTIONAL GUI BUG: site020-bug03
            Type: autocomplete-missing
            Description: 예약자 정보 입력 필드에 autocomplete 속성을 제공하지 않아 자동완성이 지원되지 않음. */}
        <div className="form-group">
          <label htmlFor="guest-name">영문 이름</label>
          <input 
            type="text" 
            id="guest-name" 
            name="name" 
            required 
            placeholder="예: GILDONG HONG"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="guest-email">이메일 주소</label>
          <input 
            type="email" 
            id="guest-email" 
            name="email" 
            required 
            placeholder="예: user@example.com"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="guest-tel">휴대전화 번호</label>
          <input 
            type="tel" 
            id="guest-tel" 
            name="tel" 
            required 
            placeholder="예: 010-1234-5678"
            value={formData.tel}
            onChange={e => setFormData({...formData, tel: e.target.value})}
          />
        </div>
        
        <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '1rem'}}>
          입력 완료 및 예약 진행
        </button>
      </form>
    </div>
  );
}
