import Sidebar from '../Layout/Sidebar';
import Navbar from '../Layout/Navbar';
import InventoryTable from '../components/InventoryTable';

const DUMMY_DATA = [
  { id: 1024, name: "Industrial Servo Motor", quantity: 1250, price: 450000 },
  { id: 1025, name: "High-Temp Pressure Sensor", quantity: 840, price: 120000 },
  { id: 1026, name: "Hydraulic Control Valve", quantity: 2100, price: 320000 },
];

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      {/* 사이드바 너비(64)만큼 왼쪽 마진을 줍니다. */}
      <main className="flex-1 ml-64 flex flex-col">
        <Navbar />
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight">재고 현황</h2>
              <p className="text-slate-500 mt-1">실시간 TITAN 클러스터 재고 데이터입니다.</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 shadow-lg shadow-blue-900/20">
              새 입고 등록
            </button>
          </div>

          {/* 주요 데이터 테이블 */}
          <InventoryTable items={DUMMY_DATA} />

          {/* [Index 420] 테스트를 위해 모달이 켜져있다고 가정하는 버튼 (나중에 구현) */}
          <div className="mt-10 p-4 bg-yellow-900/10 border border-yellow-900/30 rounded-lg text-yellow-500 text-sm italic">
            * 힌트: '수량 수정' 클릭 시 뜨는 모달창은 사이드바 뒤에 숨겨져 클릭이 불가능할 수 있습니다. (Z-index 결함)
          </div>
        </div>
      </main>
    </div>
  );
}