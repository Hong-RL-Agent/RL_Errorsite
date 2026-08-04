import { FileText } from 'lucide-react';

export default function CuratorNote({ onComingSoon }) {
  return (
    <>
      <section className="collection-section section-card">
        <div>
          <span className="section-kicker">Recommended Collection</span>
          <h2>차콜과 금빛의 대화</h2>
          <p>
            흑연, 유리, 목탄 작품을 함께 구성하면 집무실과 라운지 공간에 차분한 깊이와 섬세한 빛의 결을 만들 수 있습니다.
          </p>
        </div>
        <button className="primary-button" type="button" onClick={onComingSoon}>
          추천 컬렉션 저장
        </button>
      </section>

      <section className="curator-note section-card">
        <span className="section-kicker">Curator Note</span>
        <h2>빛은 작품의 표면에만 머물지 않습니다.</h2>
        <p>
          이번 전시는 작품이 놓이는 공간, 관람자의 이동, 소재가 받아들이는 조도까지 하나의 구매 경험으로 다룹니다.
          상세 모달과 문의 drawer를 통해 작품의 실제 설치 조건을 확인할 수 있도록 구성했습니다.
        </p>
        <button className="ghost-button" type="button" onClick={onComingSoon}>
          <FileText size={16} aria-hidden="true" />
          큐레이터 노트 다운로드
        </button>
      </section>
    </>
  );
}
