import { CheckCircle2, FileText, X } from 'lucide-react';

export default function InquiryDrawer({ open, artwork, onClose, collectorName, onCollectorNameChange }) {
  if (!open) {
    return null;
  }

  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={onClose}>
      <aside
        className="inquiry-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="inquiry-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="drawer-header">
          <div>
            <span className="section-kicker">Private Inquiry</span>
            <h2 id="inquiry-title">가격 및 컬렉션 문의</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="문의 drawer 닫기">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {artwork && (
          <div className="drawer-artwork">
            <img src={artwork.image} alt={`${artwork.title} 문의 작품`} />
            <div>
              <strong>{artwork.title}</strong>
              <span>{artwork.year} · {artwork.material}</span>
            </div>
          </div>
        )}

        <form className="inquiry-form" onSubmit={(event) => event.preventDefault()}>
          <label>
            <span>성함</span>
            <input value={collectorName} onChange={(event) => onCollectorNameChange(event.target.value)} />
          </label>
          <label>
            <span>연락처</span>
            <input placeholder="010-0000-0000" />
          </label>
          <label>
            <span>관심 내용</span>
            <textarea
              rows="5"
              defaultValue={artwork ? `${artwork.title} 작품의 구매 가능 여부와 설치 조건을 문의합니다.` : '컬렉션 구성 상담을 요청합니다.'}
            />
          </label>
          <button className="primary-button large" type="submit" onClick={() => alert('준비중입니다.')}>
            <FileText size={16} aria-hidden="true" />
            문의서 저장
          </button>
        </form>

        <div className="drawer-note">
          <CheckCircle2 size={16} aria-hidden="true" />
          문의 drawer 열기와 닫기는 정상 동작하며, 실제 제출은 준비중 alert로 처리됩니다.
        </div>
      </aside>
    </div>
  );
}
