import path from 'path';
import { readDB, writeDB } from '../services/dataService.js';

export const getProducts = (req, res) => {
  const db = readDB();
  res.json(db.products);
};

export const searchProducts = (req, res) => {
  const { brand, inspectionStatus } = req.query;
  const db = readDB();
  let list = db.products;

  if (brand && brand !== 'ALL') {
    list = list.filter(p => p.brand === brand);
  }
  if (inspectionStatus && inspectionStatus !== 'ALL') {
    list = list.filter(p => p.inspectionStatus === inspectionStatus);
  }

  let delay = 100;
  if (brand === 'CHANEL') {
    delay = 3000; // 3.0s delay
  } else if (brand === 'HERMES') {
    delay = 200; // 0.2s delay
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 브랜드 필터('CHANEL' 3초 지연 ➔ 'HERMES' 0.2초 완료)와 검수 상태 필터를 빠르게 변경 시 
  // 오래된 이전 응답(샤넬)이 최신 목록을 덮어쓰고, 중앙 상품 목록은 오래된 필터 결과, 오른쪽 검수 요약은 최신 필터 기준 데이터로 불일치하는 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
};

export const getProductDetail = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const product = db.products.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  const detailProduct = { ...product };

  // INTENTIONAL_ERROR
  // CATEGORY: Server 파일 경로 오류
  // DESCRIPTION: 상품 이미지 파일 이름에 한글과 공백이 포함된 경우('샤넬 가방 (특S급).jpg'), 
  // 목록 이미지에는 정상 표시되나 상세 갤러리 API 응답 시 이중 URL 인코딩을 적용해 반환하여 상세 갤러리 탭에서만 이미지가 404로 깨지는 결함입니다.
  if (detailProduct.imageUrl && detailProduct.imageUrl.includes(' ') && (detailProduct.imageUrl.includes('(') || detailProduct.imageUrl.includes(')'))) {
    const filename = path.basename(detailProduct.imageUrl);
    const doubleEncoded = encodeURIComponent(encodeURIComponent(filename));
    detailProduct.imageUrl = `/uploads/${doubleEncoded}`;
  }

  res.json(detailProduct);
};

export const getInspections = (req, res) => {
  const db = readDB();
  res.json(db.inspections);
};

export const getTransactions = (req, res) => {
  const db = readDB();
  res.json(db.transactions);
};

export const getSellers = (req, res) => {
  const db = readDB();
  res.json(db.sellers);
};

export const updateInspectionStatus = (req, res) => {
  const { id } = req.params;
  const { inspectionStatus } = req.body;

  setTimeout(() => {
    const db = readDB();
    const prd = db.products.find(p => p.id === id);
    if (prd) {
      prd.inspectionStatus = inspectionStatus;
      writeDB(db);
      console.log(`[DB STATUS UPDATE] Updated inspectionStatus for ${id} to ${inspectionStatus} (0.1s done)`);
    }
    res.json({ success: true, product: prd });
  }, 100);
};

export const updatePrice = (req, res) => {
  const { id } = req.params;
  const { price, inspectionStatus } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 판매 가격을 수정한 직후(3초 지연 완료) 검수 상태를 변경(0.1초 완료)하면, 
  // 검수 상태 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 가격 수정 API 내부에 이전 구형 검수 상태(inspectionStatus)가 동봉 저장되어 
  // 새로고침 시 새 가격과 이전 검수 상태 조합이 저장되는 레이스 컨디션 결함입니다.
  setTimeout(() => {
    const db = readDB();
    const prd = db.products.find(p => p.id === id);
    if (prd) {
      prd.price = Number(price);
      if (inspectionStatus) {
        prd.inspectionStatus = inspectionStatus; // Overwrites updated inspection status with stale value!
      }
      writeDB(db);
      console.log(`[DB PRICE UPDATE] Updated price for ${id} to ${price} (3s done). Overwrote inspectionStatus to ${inspectionStatus}`);
    }
    res.json({ success: true, product: prd });
  }, 3000);
};

export const rejectProduct = (req, res) => {
  const { id } = req.params;

  setTimeout(() => {
    const db = readDB();
    const prd = db.products.find(p => p.id === id);
    if (prd) {
      prd.inspectionStatus = 'REJECTED';
      writeDB(db);
      console.log(`[DB REJECT] Rejected product ${id} (0.5s done)`);
    }
    res.json({ success: true, product: prd });
  }, 500);
};

export const updateDescription = (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 검수 반려(0.5초 완료) 직후 판매자가 상품 설명을 수정(4초 지연 완료)하면, 
  // 반려 요청은 먼저 0.5초 만에 성공하지만 늦게 도착한 설명 수정 요청(4초 지연)이 반려된 상품을 다시 'INSPECTING'(검수 대기) 상태로 재활성화시킵니다. 
  // 목록에서는 반려, 상세에서는 검수 대기로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const prd = db.products.find(p => p.id === id);
    if (prd) {
      prd.name = name;
      prd.inspectionStatus = 'INSPECTING'; // Re-activates rejected product back to INSPECTING!
      writeDB(db);
      console.log(`[DB RE-ACTIVATE] Updated description for ${id} (4s done). Re-activated status to INSPECTING!`);
    }
    res.json({ success: true, product: prd });
  }, 4000);
};

export const purchaseProduct = (req, res) => {
  const { productId, buyerName } = req.body;

  const db = readDB();
  const prd = db.products.find(p => p.id === productId);

  const newTrx = {
    id: `TRX-${String(db.transactions.length + 1).padStart(3, '0')}`,
    productId,
    productName: prd?.name || productId,
    price: prd?.price || 0,
    buyerName: buyerName || "구매자",
    sellerId: prd?.sellerId || "SLR-01",
    status: "COMPLETED",
    tradedAt: new Date().toISOString().split('T')[0]
  };

  db.transactions.unshift(newTrx);
  writeDB(db);
  console.log(`[DB PURCHASE] Created transaction ${newTrx.id} for product ${productId}`);

  res.json({ success: true, transaction: newTrx });
};

export const deleteTransaction = (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.transactions = db.transactions.filter(t => t.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 데이터 불일치
  // DESCRIPTION: 거래 내역을 삭제(`DELETE /api/transactions/:id`) 처리하여 거래 대장에서 소거하더라도, 
  // 판매자 누적 판매액(`seller.totalSales`)과 브랜드별 거래 통계(`brandStats`) 수치에는 차감되지 않고 잔존 포함 유지되는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE TRX] Removed transaction ${id}. Seller totalSales and brandStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    "products": [
      { "id": "PRD-01", "name": "샤넬 클래식 플랩백 미디엄 램스킨", "brand": "CHANEL", "category": "BAG", "price": 12500000, "originalPrice": 14500000, "inspectionStatus": "PASSED", "sellerId": "SLR-01", "sellerName": "김명품", "imageUrl": "/uploads/chanel_classic.jpg" },
      { "id": "PRD-02", "name": "에르메스 버킨 30 엡솜 에토프", "brand": "HERMES", "category": "BAG", "price": 28500000, "originalPrice": 32000000, "inspectionStatus": "INSPECTING", "sellerId": "SLR-01", "sellerName": "김명품", "imageUrl": "/uploads/샤넬 가방 (특S급).jpg" }
    ],
    "inspections": [
      { "id": "ISP-001", "productId": "PRD-01", "productName": "샤넬 클래식 플랩백 미디엄", "appraiser": "박감정 전문위원", "status": "PASSED", "grade": "S급", "notes": "가죽 마모 없음, 정품 각인 일치", "inspectedAt": "2026-07-25" }
    ],
    "transactions": [
      { "id": "TRX-001", "productId": "PRD-01", "productName": "샤넬 클래식 플랩백 미디엄", "price": 12500000, "buyerName": "최구매", "sellerId": "SLR-01", "status": "COMPLETED", "tradedAt": "2026-07-26" }
    ],
    "sellers": [
      { "id": "SLR-01", "name": "김명품", "grade": "VIP 셀러", "totalSales": 109750000, "pendingInspections": 4, "pendingPayout": 49750000 }
    ],
    "brandStats": {
      "CHANEL": 41800000,
      "HERMES": 52000000
    }
  };
  writeDB(initial);
  res.json({ success: true });
};
