import { useState, useEffect } from 'react'; // useEffect를 사용하여 미사용 밑줄 제거
import type { StockItem } from '../types/inventory';

export default function InventoryPage() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(false);

  // [Index 440] N+1 성능 지연 시뮬레이션 로직
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/inventory');
      const data = await response.json();
      
      // 의도적으로 각 아이템마다 추가 요청을 보내 지연을 발생시킴
      for (const item of data) {
        await fetch(`/api/inventory/location-detail/${item.id}`);
      }
      setItems(data);
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트가 마운트될 때 fetchInventory를 실행하여 'useEffect 미사용' 밑줄 해결
  useEffect(() => {
    fetchInventory();
  }, []);

  // [Index 410] 콤마(,)가 포함된 문자열 전송 결함
  // 인자값 val에 string 타입을 명시하고 함수를 완성하여 밑줄 해결
  const handleUpdateQuantity = async (id: number, val: string) => {
    await fetch(`/api/inventory/update/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quantity: val }) // "1,000" 형태의 문자열이 전송되도록 유지
    });
  };

  return (
    <div className="p-6 text-slate-300">
      <h1 className="text-2xl font-bold mb-4 text-white">TITAN 재고 관리</h1>
      
      {loading ? (
        <p className="animate-pulse">데이터를 불러오는 중... (N+1 지연 발생 중)</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="p-4 bg-slate-900 border border-slate-800 rounded-lg flex justify-between items-center">
              <span>{item.name}</span>
              <button 
                onClick={() => handleUpdateQuantity(item.id, "1,000")} // 결함 테스트용 값 전송
                className="px-3 py-1 bg-blue-600 rounded text-sm text-white"
              >
                수량 업데이트 테스트
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}