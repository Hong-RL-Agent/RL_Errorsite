import { forwardRef, useState } from 'react';

const DemoRequestForm = forwardRef(function DemoRequestForm(_, ref) {
  const [form, setForm] = useState({ name: '', email: '', company: '', teamSize: '11-50' });
  const [submitted, setSubmitted] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setSubmitted(false);
  };

  const submit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="section demo-section" ref={ref} id="demo">
      <div className="section-heading">
        <span className="eyebrow">Demo Request</span>
        <h2>팀 상황에 맞는 데모를 예약하세요</h2>
      </div>
      <form className="demo-form" onSubmit={submit}>
        <label>
          이름
          <input name="name" value={form.name} onChange={updateField} placeholder="홍길동" required />
        </label>
        <label>
          업무 이메일
          <input name="email" type="email" value={form.email} onChange={updateField} placeholder="team@company.com" required />
        </label>
        <label>
          회사명
          <input name="company" value={form.company} onChange={updateField} placeholder="Northstar Labs" required />
        </label>
        <label>
          팀 규모
          <select name="teamSize" value={form.teamSize} onChange={updateField}>
            <option>1-10</option>
            <option>11-50</option>
            <option>51-200</option>
            <option>200+</option>
          </select>
        </label>
        <button type="submit" className="primary-button">데모 신청 제출</button>
      </form>
      <div className="form-preview" aria-live="polite">
        <strong>입력 미리보기</strong>
        <span>{form.name || '이름 미입력'} · {form.company || '회사 미입력'} · {form.teamSize}</span>
        <span>{form.email || '이메일 미입력'}</span>
        {submitted && <em>요청이 접수되었습니다. 담당자가 확인 후 연락드립니다.</em>}
      </div>
    </section>
  );
});

export default DemoRequestForm;
