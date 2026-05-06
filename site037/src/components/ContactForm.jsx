import { useState } from 'react';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  shootType: 'wedding',
  preferredDate: '',
  budget: 'standard',
  message: '',
  newsletter: false
};

function ContactForm() {
  const [form, setForm] = useState(initialForm);

  const updateField = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    alert(`${form.name || '고객'}님의 촬영 문의가 접수되었습니다.`);
  };

  return (
    <section className="section-shell contact-section" id="contact">
      <div className="contact-intro">
        <span className="eyebrow">Contact</span>
        <h2>촬영하고 싶은 장면을 알려주세요</h2>
        <p>
          입력한 내용은 오른쪽 프리뷰에 즉시 반영됩니다. 세부 일정과 견적은 담당 디렉터가 확인 후 연락드립니다.
        </p>
        <div className="contact-note">
          <strong>Studio hours</strong>
          <span>Tue-Sun 10:00-19:00 · Seoul, Hannam</span>
        </div>
      </div>

      <form className="contact-form" onSubmit={handleSubmit}>
        <label>
          이름
          <input
            type="text"
            value={form.name}
            onChange={(event) => updateField('name', event.target.value)}
            placeholder="성함을 입력하세요"
          />
        </label>
        <label>
          이메일
          <input
            type="email"
            value={form.email}
            onChange={(event) => updateField('email', event.target.value)}
            placeholder="name@example.com"
          />
        </label>
        <label>
          연락처
          <input
            type="tel"
            value={form.phone}
            onChange={(event) => updateField('phone', event.target.value)}
            placeholder="010-0000-0000"
          />
        </label>
        <label>
          촬영 유형
          <select value={form.shootType} onChange={(event) => updateField('shootType', event.target.value)}>
            <option value="wedding">웨딩</option>
            <option value="profile">프로필</option>
            <option value="commercial">커머셜</option>
            <option value="editorial">에디토리얼</option>
          </select>
        </label>
        <label>
          희망일
          <input
            type="date"
            value={form.preferredDate}
            onChange={(event) => updateField('preferredDate', event.target.value)}
          />
        </label>
        <fieldset>
          <legend>예산 범위</legend>
          <label>
            <input
              type="radio"
              name="budget"
              checked={form.budget === 'standard'}
              onChange={() => updateField('budget', 'standard')}
            />
            Standard
          </label>
          <label>
            <input
              type="radio"
              name="budget"
              checked={form.budget === 'premium'}
              onChange={() => updateField('budget', 'premium')}
            />
            Premium
          </label>
        </fieldset>
        <label className="wide-field">
          요청 사항
          <textarea
            value={form.message}
            onChange={(event) => updateField('message', event.target.value)}
            placeholder="원하는 톤, 장소, 납품 일정 등을 적어주세요"
          />
        </label>
        <label className="checkbox-field wide-field">
          <input
            type="checkbox"
            checked={form.newsletter}
            onChange={(event) => updateField('newsletter', event.target.checked)}
          />
          스튜디오 소식과 오픈 슬롯 안내를 받겠습니다.
        </label>
        <button type="submit" className="submit-button">
          문의 보내기
        </button>
      </form>

      <aside className="contact-preview" aria-label="문의 입력값 미리보기">
        <span>Inquiry preview</span>
        <strong>{form.name || '이름 미입력'}</strong>
        <p>{form.email || '이메일 미입력'}</p>
        <dl>
          <div>
            <dt>Type</dt>
            <dd>{form.shootType}</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{form.preferredDate || '협의 필요'}</dd>
          </div>
          <div>
            <dt>Budget</dt>
            <dd>{form.budget}</dd>
          </div>
        </dl>
        <p className="preview-message">{form.message || '촬영 요청 사항이 여기에 표시됩니다.'}</p>
      </aside>
    </section>
  );
}

export default ContactForm;
