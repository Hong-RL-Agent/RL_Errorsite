export default function StockModal({ itemId }: { itemId: number }) {
  // [Index 430] IDOR 취약점: 파라미터 조작 가능
  const downloadReport = () => {
    window.location.href = `/api/reports/download?id=${itemId}`;
  };

  return (
    <div className="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl">
        <h2 className="text-xl">재고 상세 정보</h2>
        <button 
          onClick={downloadReport}
          className="bg-blue-600 text-white px-4 py-2 mt-4"
        >
          재고 증명서 다운로드
        </button>
      </div>
    </div>
  );
}