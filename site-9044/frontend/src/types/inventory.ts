// 반드시 export interface로 시작해야 합니다!
export interface StockItem {
  id: number;
  name: string;
  quantity: number; // [Index 410] 테스트 시에는 실제 데이터가 숫자로 들어오는지 확인
  location: string;
  price: number;
}