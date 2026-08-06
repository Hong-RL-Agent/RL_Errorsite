import React from 'react';

export default function RightPanel({
  selectedProduct,
  setSelectedProduct,
  triggerPriceInspectionRace,
  triggerRejectDescriptionConflict,
  selectedProductDetail
}) {
  return (
    <aside className="panel-section operations-sidebar">
      <!-- Price & Inspection Status adjust (Error 1 Target) -->
      <div className="detail-widget">
        <h3>💰 상품 가격 & 검수 상태 조정</h3>
        {selectedProduct ? (
          <div className="detail-panel">
            <p>상품 ID: <strong>{selectedProduct.id}</strong> ({selectedProduct.name})</p>

            <div className="form-group">
              <label>판매 가격 설정 (원):</label>
              <input 
                type="number" 
                value={selectedProduct.price || 0} 
                onChange={(e) => setSelectedProduct({ ...selectedProduct, price: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label>검수 상태 변경:</label>
              <div className="input-row">
                <select 
                  value={selectedProduct.inspectionStatus || 'INSPECTING'} 
                  onChange={(e) => setSelectedProduct({ ...selectedProduct, inspectionStatus: e.target.value })}
                >
                  <option value="PASSED">검수 합격 (PASSED)</option>
                  <option value="INSPECTING">검수 대기중 (INSPECTING)</option>
                  <option value="REJECTED">검수 반려 (REJECTED)</option>
                </select>
                <button className="save-btn" onClick={() => triggerPriceInspectionRace(selectedProduct)}>
                  가격 수정 (Error 1)
                </button>
              </div>
              <small className="warn-desc">* 가격 수정(3초 지연 완료) 직후 검수 상태 변경(0.1초 완료) 시, 3초 뒤 이전 검수 상태가 동봉되어 롤백 저장됨 (Error 1)</small>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <button className="reject-btn" onClick={() => triggerRejectDescriptionConflict(selectedProduct)}>
                ⚡ 검수 반려 후 설명 수정 (Error 2)
              </button>
              <small className="warn-desc">* 검수 반려(0.5초 완료) 직후 설명 수정(4초 지연 완료) 시, 늦은 수정 요청이 반려 상품을 검수 대기로 재활성화시킴 (Error 2)</small>
            </div>
          </div>
        ) : (
          <div className="empty-lbl-dark">조정할 상품을 선택하세요.</div>
        )}
      </div>

      <!-- Product detail inspector & image 404 test (Error 7 Target) -->
      <div className="detail-widget">
        <h3>💎 명품 상세 갤러리 & 감정 인스펙터</h3>
        {selectedProductDetail ? (
          <div className="detail-panel">
            <p>상품명: <strong>{selectedProductDetail.name}</strong></p>
            <p>브랜드: <strong>{selectedProductDetail.brand}</strong> | 판매자: <strong>{selectedProductDetail.sellerName}</strong></p>
            <p>현재 상태: <strong className="price-lbl">{selectedProductDetail.inspectionStatus}</strong></p>

            <div className="form-group">
              <label>상품 상세 갤러리 이미지:</label>
              <div className="prd-gallery-frame">
                {selectedProductDetail.imageUrl ? (
                  <img src={selectedProductDetail.imageUrl} alt="명품 상세 갤러리" className="prd-gallery-img" />
                ) : (
                  <div className="empty-lbl-dark">갤러리 이미지 없음</div>
                )}
              </div>
              <small className="warn-desc">* 파일명에 한글/공백 포함 시('샤넬 가방 (특S급).jpg') 이중 인코딩으로 상세 갤러리에서만 이미지가 404로 깨짐 (Error 7)</small>
            </div>
          </div>
        ) : (
          <div className="empty-lbl-dark">상세 정보를 보려면 상품을 선택하세요.</div>
        )}
      </div>
    </aside>
  );
}
